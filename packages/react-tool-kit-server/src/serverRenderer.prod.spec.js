import React from 'react';

process.env.NODE_ENV = 'production';

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

jest.mock('react-apollo', () => ({
  ApolloProvider: props => props.children,
  getDataFromTree: () => Promise.resolve()
}));

jest.mock('./assetUtil.js', () => {
  return {
    generateAssets: jest.fn(() => ({
      vendor: 'vendortmp.js',
      app: 'apptmp.js'
    }))
  };
});
const serverRenderer = require('./serverRenderer').default;

test('works with minimum setup', done => {
  serverRenderer({
    expressCtx: {
      req: {
        query: {}
      },
      res: {}
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

test('works with minimum setup - with shell', done => {
  serverRenderer({
    expressCtx: {
      req: {
        query: {
          'rkit-shell': true
        }
      },
      res: {}
    },
    context: {},
    store: {
      dispatch: jest.fn(),
      subscribe: jest.fn(),
      getState: jest.fn()
    },
    onRender: () => <div>test123</div>
  }).then(({ html }) => {
    expect(html).toMatch(/window\.__shell__ = true/);
    done();
  });
});

test('support apollo', done => {
  const mockApolloClient = {
    extract: jest.fn()
  };
  const createApolloClient = () => mockApolloClient;
  jest.spyOn(console, 'log');

  serverRenderer({
    createApolloClient,
    expressCtx: {
      req: {
        query: {}
      },
      res: {}
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
    expect(console.log).not.toHaveBeenCalled();
    done();
  });
});
