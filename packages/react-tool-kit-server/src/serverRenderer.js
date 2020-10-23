import React from 'react';
import serialize from 'serialize-javascript';
import { StaticRouter } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { ChunkExtractor } from '@loadable/server';

import { HelmetProvider } from 'react-helmet-async';
import { ApolloProvider, getDataFromTree } from 'react-apollo';
import { generateAssets } from './assetUtil';

let app;
let vendor;
let appStyle;
let vendorStyle;

const fs = require('fs');
const path = require('path');
const cwd = process.cwd();
function resolveCwd(name) {
  return path.resolve(cwd, name);
}

export default async ({
  expressCtx,
  store,
  context,
  onRender,
  mapAppString = str => str,
  assetUrl = '/',
  createApolloClient,
  template = {
    renderBottom: () => ''
  }
}) => {
  const reqUrl = expressCtx.req.url;
  const shell = typeof expressCtx.req.query['rkit-shell'] !== 'undefined';

  const assetData = generateAssets({ expressCtx, assetUrl });
  vendor = assetData.vendor;
  app = assetData.app;
  appStyle = assetData.appStyle;
  vendorStyle = assetData.vendorStyle;

  const appStyleTag = appStyle
    ? `<link rel='stylesheet' href='${appStyle}'>`
    : '';
  const vendorStyleTag = vendorStyle
    ? `<link rel='stylesheet' href='${vendorStyle}'>`
    : '';
  let dllScript = '';

  if (process.env.NODE_ENV === 'development') {
    if (fs.existsSync(resolveCwd('dist/vendorDll.js'))) {
      dllScript = `<script src='${assetUrl}vendorDll.js'></script>`;
    }
  }

  const elementData = onRender({ expressCtx, store });
  const promiseOfEl =
    elementData instanceof Promise ? elementData : Promise.resolve(elementData);
  const reactEl = await promiseOfEl;
  let helmetCtx = {};

  const BasicApp = () => (
    <HelmetProvider context={helmetCtx}>
      <Provider store={store}>
        <StaticRouter location={reqUrl} context={context}>
          {reactEl}
        </StaticRouter>
      </Provider>
    </HelmetProvider>
  );
  let App = BasicApp;

  let apolloClient;
  let apolloScript = '';
  if (createApolloClient) {
    apolloClient = createApolloClient(expressCtx);
    App = () => (
      <ApolloProvider client={apolloClient}>
        <BasicApp />
      </ApolloProvider>
    );

    if (process.env.NODE_ENV === 'development') {
      console.log('=> Apollo client detected on server.');
    }
  }

  const appEl = <App />;
  return getDataFromTree(appEl)
    .then(() => {
      return renderApp();
    })
    .catch(err => {
      return renderApp(err);
    });

  async function renderApp(apolloErr) {
    const statsFile = resolveCwd('dist/loadable-stats.json');
    const extractor = new ChunkExtractor({ statsFile, entrypoints: ['app'] });
    const jsx = extractor.collectChunks(appEl);
    let content = mapAppString(renderToString(jsx));

    const { helmet } = helmetCtx;

    if (apolloClient) {
      const cacheStr = serialize(apolloClient.extract());
      apolloScript = `<script type="text/javascript">window.__APOLLO_STATE__ = ${cacheStr};</script>`;
    }

    let helmetTitle = helmet.title.toString();
    let helmetMeta = helmet.meta.toString();
    let helmetLink = helmet.link.toString();
    let helmetScript = helmet.script.toString();
    let initScript = `<script type="text/javascript">window.INITIAL_STATE = ${serialize(
      store.getState()
    )};</script>`;

    if (shell) {
      content = '';
      helmetTitle = '';
      helmetLink = '';
      helmetMeta = '';
      helmetScript = '';
      apolloScript = '';
      initScript = '';
    }

    let html = `<!doctype html>
    <html>
    <head>
      ${helmetTitle}
      <meta name="mobile-web-app-capable" content="yes">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      ${[
        helmetMeta,
        vendorStyleTag,
        appStyleTag,
        extractor.getLinkTags(),
        extractor.getStyleTags(),
        helmetLink
      ]
        .filter(s => s !== '')
        .join('\n')}
    </head>
    <body>
      <div id="root">${content}</div>
      ${[helmetScript, template.renderBottom({ expressCtx, store })]
        .filter(s => s !== '')
        .join('\n')}
      <script type="text/javascript">window.__shell__ = ${shell};</script>
      ${[initScript, apolloScript, dllScript, extractor.getScriptTags()]
        .filter(s => s !== '')
        .join('\n')}
    </body>
    </html>`;
    return { html, apolloErr };
  }
};
