const log4js = require('log4js');
const os = require('os');

export const defaultLogerConfig = {
  enableStream: false,
  service: 'default',
  streamHost: '0.0.0.0',
  streamPort: 0,
};

/**
 * preparing log config
 * @param {object} config
 */
const prepareLogConfig = (config = defaultLogerConfig) => {
  const logConfig = {
    appenders: {
      console: { type: 'console' },
    },
    categories: {
      default: { appenders: ['console'], level: 'debug' },
    },
    pm2: false,
    disableClustering: true,
  };

  if (config.enableStream) {
    const stramAppendersConfig = {
      streamer: {
        type: '@log4js-node/logstashudp',
        host: config.streamHost,
        port: config.streamPort,
        args: 'direct',
      },
    };
    const categoriesConfig = {
      [`${config.service}-logger`]: { appenders: ['streamer'], level: 'error' },
    };
    Object.assign(logConfig.appenders, stramAppendersConfig);
    Object.assign(logConfig.categories, categoriesConfig);
  }

  return logConfig;
};

/**
 * get logger instance
 * @param {object} config
 */
export const getLogger = (config = defaultLogerConfig) => {
  let logInstance;
  let _streamer;
  let _console;

  const init = () => {
    logInstance = this;

    const logConfig = prepareLogConfig(config);

    log4js.configure(logConfig);

    _console = log4js.getLogger();
    _streamer = log4js.getLogger();

    if (config.enableStream) {
      _streamer = log4js.getLogger(`${config.service}-logger`);
    }

    return {
      streamer: _streamer,
      console: _console,
    };
  };

  if (!logInstance) {
    logInstance = init();
  }

  return logInstance;
};

/**
 * error serializer for logger
 * @param {string} message
 * @param {string} service
 * @param {object} opt
 */
export const logErrorSerializer = (message, service, opt = {}) => {
  const additionalOpt = typeof opt !== 'object' ? {} : opt;
  const errorObject = {
    message: '',
    object: {
      service,
      clienthost: os.hostname(),
      ...additionalOpt,
    },
  };

  if (typeof message === 'string') {
    errorObject.message = message;
  }

  if (message instanceof Error) {
    errorObject.message = message.message;
    errorObject.object = {
      ...errorObject.object,
      stack: message.stack,
    };
  }

  return errorObject;
};
