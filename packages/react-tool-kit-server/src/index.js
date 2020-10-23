import express from 'express';
import morgan from 'morgan';
import path from 'path';

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
    customMiddleware = () => {}
  } = config;
  let context;
  const app = express();
  const loggerEnv = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';
  const logger = morgan(loggerEnv, {
    skip: function(req, res) {
      if (process.env.NODE_ENV === 'development') {
        return false;
      }
      return res.statusCode < 400;
    }
  });

  app.use(logger);

  if (process.env.NODE_ENV === 'development') {
    const { devMiddleware } = require('react-tool-kit/lib/express-dev');
    devMiddleware(app);
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
      .catch(err => {
        console.error('Error getInitialData:\n', err);
      })
      .then(() => {
        context = {};
        const data = {
          ...config,
          expressCtx: { req, res },
          store,
          context
        };
        return serverRender(data);
      })
      .then(({ html, apolloErr }) => {
        if (apolloErr) {
          console.error('Apollo ERR: ', apolloErr);
          const status = handleGqlError({ req, res }, apolloErr);
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
      .catch(err => {
        console.error(err);
        return res.sendStatus(500);
      });
  });

  return app;
}
