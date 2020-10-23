# react-tool-kit-server

Express server for server-side rendering with data prefetching.

## Install

```sh
yarn add react-tool-kit-server
```

## API

```js
import { createReactServer } from 'react-tool-kit-server';

import createStore from '../store/createStore';
import { getInitialData } from '../routes';
import { HOME_PATH, ASSET_URL } from '../url';
import CoreLayout from '../layouts/CoreLayout';

const app = createReactServer({
  createStore,
  getInitialData,
  homePath: HOME_PATH,
  assetUrl: ASSET_URL,
  customMiddleware: expressIns => {},
  onRender: () => <CoreLayout />
});
```

#### `createStore()`
function that must return Redux store.

#### `getInitialData(req, store)`
function that must return Promise.

#### `customMiddleware(expressIns)`
functions that receive express instance and runs before SSR requests

#### `onRender({ expressCtx, store })`
function that must return either
- React element
- Promise of React element

#### `mapAppString(appStr)`
function that accepts renderToString result and return new string

#### `createApolloClient(expressCtx)`
function that must return Apollo client to be used on SSR server

### License

MIT
