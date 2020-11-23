import express from 'express';
import path from 'path';
import log4js from 'log4js';
import { defaultLogerConfig, getLogger, logErrorSerializer } from './logger';

import serverRender from './serverRenderer';

export function createRouter() {
  return express.Router();
}

export function createReactServer(config) {
  const {
    createStore,
    getInitialData,
    homePath,
    handleGqlError = () => 500,
    customMiddleware = () => {},
    loggerConfig = defaultLogerConfig,
  } = config;
  let context;
  const app = express();

  const logger = getLogger(loggerConfig);
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    const {
      devMiddleware,
    } = require('@asep.setiawan/react-tool-kit/lib/express-dev');
    devMiddleware(app);

    // development console
    app.use(log4js.connectLogger(logger.console));
  }

  app.set('view engine', 'ejs');
  const ampPath =
    process.env.NODE_ENV === 'development' ? 'src/amp/views' : 'dist/views';
  const ampV = path.resolve(process.cwd(), ampPath);
  app.set('views', ampV);

  app.use(homePath, express.static('dist'));
  customMiddleware(app);
  app.get(homePath + '(*)', (req, res) => {
    const store = createStore();
    // attach cookies to store object as a way to let cookies to be passed into server fetching
    req.headers.cookie && (store['cookies'] = req.headers.cookie);
    const promises = getInitialData(req, store);
    Promise.all(promises)
      .catch((err) => {
        if (isDevelopment) {
          logger.console.error('[Initial Data] Error:', err);
        }

        if (loggerConfig.enableStream) {
          const error = logErrorSerializer(err, loggerConfig.service, {
            type: 'initial-data',
            url: req.originalUrl,
          });
          logger.streamer.error(error.message, error.object);
        }
      })
      .then(() => {
        context = {};
        const data = {
          ...config,
          expressCtx: { req, res },
          store,
          context,
        };
        return serverRender(data);
      })
      .then(({ html, apolloErr }) => {
        if (apolloErr) {
          if (isDevelopment) {
            logger.console.error('[GQL] Error:', apolloErr);
          }

          const status = handleGqlError({ req, res }, apolloErr);
          if (loggerConfig.enableStream) {
            const error = logErrorSerializer(apolloErr, loggerConfig.service, {
              status,
              type: 'gql-error',
              url: req.originalUrl,
            });
            logger.streamer.error(error.message, error.object);
          }
          return res.status(status).send(html);
        }

        if (context.status) {
          console.log('Context status: ', context.status);
          return res.status(context.status).send(html);
        }

        if (context.url) {
          return res.redirect(302, context.url);
        }

        res.send(html);
      })
      .catch((err) => {
        if (isDevelopment) {
          logger.console.error('[Render] Error:', String(err));
        }

        if (loggerConfig.enableStream) {
          const error = logErrorSerializer(err, loggerConfig.service, {
            type: 'render',
            url: req.originalUrl,
          });
          logger.streamer.error(error.message, error.object);
        }

        return res.sendStatus(500);
      });
  });

  return app;
}
