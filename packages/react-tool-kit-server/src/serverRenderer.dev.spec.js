import React from 'react';
import fs from 'fs';
import serverRenderer from './serverRenderer';

process.env.NODE_ENV = 'development';

const existsSyncOri = fs.existsSync;

const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockImplementation(str => {
  if (/dist\/vendorDll\.js/.test(str)) {
    return false;
  }
  return existsSyncOri(str);
});

jest.mock('react-apollo', () => ({
  ApolloProvider: props => props.children,
  getDataFromTree: () => Promise.resolve()
}));
function MockExtractor() {
  return {
    getScriptTags: jest.fn(),
    getStyleTags: jest.fn(),
    getLinkTags: jest.fn(),
    collectChunks: d => d
  };
}
jest.mock('@loadable/server', () => {
  return {
    ChunkExtractor: MockExtractor
  };
});
const reactApollo = require('react-apollo');

test('works with minimum setup', done => {
  serverRenderer({
    expressCtx: {
      req: {
        query: {}
      },
      res: {
        locals: {
          webpackStats: {
            toJson: () => ({
              assetsByChunkName: {
                app: ['app.js', 'app.css'],
                vendor: ['vendor.js', 'vendor.css']
              }
            })
          }
        }
      }
    },
    context: {},
    store: {
      dispatch: jest.fn(),
      subscribe: jest.fn(),
      getState: jest.fn()
    },
    onRender: () => <div>test123</div>
  }).then(({ html }) => {
    expect(html).toMatch(/test123/);
    done();
  });
});

test('works with minimum setup - with DLL', done => {
  existsSyncSpy.mockImplementation(str => {
    if (/dist\/vendorDll\.js/.test(str)) {
      return true;
    }
    return existsSyncOri(str);
  });
  serverRenderer({
    expressCtx: {
      req: {
        query: {}
      },
      res: {
        locals: {
          webpackStats: {
            toJson: () => ({
              assetsByChunkName: {
                app: ['app.js', 'app.css'],
                vendor: ['vendor.js', 'vendor.css']
              }
            })
          }
        }
      }
    },
    context: {},
    store: {
      dispatch: jest.fn(),
      subscribe: jest.fn(),
      getState: jest.fn()
    },
    onRender: () => <div>test123</div>
  }).then(({ html }) => {
    expect(html).toMatch(/test123/);
    expect(html).toMatch("<script src='/vendorDll.js'></script>");
    done();
  });
});

test('works with no style', done => {
  serverRenderer({
    expressCtx: {
      req: {
        query: {}
      },
      res: {
        locals: {
          webpackStats: {
            toJson: () => ({
              assetsByChunkName: {
                app: ['app.js'],
                vendor: ['vendor.js']
              }
            })
          }
        }
      }
    },
    context: {},
    store: {
      dispatch: jest.fn(),
      subscribe: jest.fn(),
      getState: jest.fn()
    },
    onRender: () => <div>test123</div>
  }).then(({ html }) => {
    expect(html).not.toMatch(/(app|vendor)\.css/);
    done();
  });
});

test('async onRender', done => {
  serverRenderer({
    expressCtx: {
      req: {
        query: {}
      },
      res: {
        locals: {
          webpackStats: {
            toJson: () => ({
              assetsByChunkName: {
                app: ['app.js'],
                vendor: ['vendor.js']
              }
            })
          }
        }
      }
    },
    context: {},
    store: {
      dispatch: jest.fn(),
      subscribe: jest.fn(),
      getState: jest.fn()
    },
    onRender: async () => <div>test123</div>
  }).then(({ html }) => {
    expect(html).toMatch(/test123/);
    done();
  });
});

test('support apollo', done => {
  const mockApolloClient = {
    extract: jest.fn()
  };
  const createApolloClient = () => mockApolloClient;

  serverRenderer({
    createApolloClient,
    expressCtx: {
      req: {
        query: {}
      },
      res: {
        locals: {
          webpackStats: {
            toJson: () => ({
              assetsByChunkName: {
                app: ['app.js'],
                vendor: ['vendor.js']
              }
            })
          }
        }
      }
    },
    context: {},
    store: {
      dispatch: jest.fn(),
      subscribe: jest.fn(),
      getState: jest.fn()
    },
    onRender: async () => <div>test123</div>
  }).then(({ html }) => {
    expect(html).toMatch(/test123/);
    expect(mockApolloClient.extract).toHaveBeenCalled();
    done();
  });
});

test('support apollo - get data error', done => {
  const mockApolloClient = {
    extract: jest.fn()
  };
  const createApolloClient = () => mockApolloClient;

  jest
    .spyOn(reactApollo, 'getDataFromTree')
    .mockImplementation(() => Promise.reject());

  jest.spyOn(console, 'error');

  serverRenderer({
    createApolloClient,
    expressCtx: {
      req: {
        query: {}
      },
      res: {
        locals: {
          webpackStats: {
            toJson: () => ({
              assetsByChunkName: {
                app: ['app.js'],
                vendor: ['vendor.js']
              }
            })
          }
        }
      }
    },
    context: {},
    store: {
      dispatch: jest.fn(),
      subscribe: jest.fn(),
      getState: jest.fn()
    },
    onRender: async () => <div>test123</div>
  })
    .then(({ html }) => {
      expect(html).toMatch(/test123/);
      expect(mockApolloClient.extract).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledTimes(1);
      done();
    })
    .catch(() => {
      done();
    });
});
