# {{name}}

> Bootstraped with [React Tool Kit](https://github.com/asepsetyawan/react-tool-kit)

## How to use

### Start

    ```sh
    npm start
    ```

### Build

    ```sh
    npm run deploy:prod
    ```

### Build DLL for caching

    ```sh
    npm run dll
    ```

### Override config

You can override config by creating `react-tool-kit.config.js`. You can check the [wiki](https://github.com/asepsetyawan/react-tool-kit/wiki/Custom-react-tool-kit-config) for more information.

### Available environment variables

- `APP_ENV` (App environment, default to "development")
- `APP_ASSET_PATH` (App public asset path, default to "/")
- `__DEV__`
- `__STAG__`
- `__PROD__`
