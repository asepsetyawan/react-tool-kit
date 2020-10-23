import '@babel/polyfill'
import React from 'react'

import { createReactServer } from 'react-tool-kit-server'

import createApolloClient from '../apollo/client-ssr'
import createStore from '../store/createStore'
import { getInitialData } from '../routes'
import { HOME_PATH } from '../url'
import CoreLayout from '../layouts/CoreLayout'
import amp from '../amp'

const app = createReactServer({
  createApolloClient,
  createStore,
  getInitialData,
  homePath: HOME_PATH,
  assetUrl: process.env.APP_ASSET_PATH,
  customMiddleware: ins => {
    ins.use(amp)

    if (__DEV__) {
      const proxy = require('http-proxy-middleware')
      const backendUrl =
        process.env.APP_BACKEND_URL || 'https://staging.example.com'
      const graphUrl =
        process.env.APP_GRAPHQL_URL ||
        'https://gql-staging.example.com/graphql'
      console.log('APP_BACKEND_URL = ' + backendUrl)
      console.log('APP_GRAPHQL_URL = ' + graphUrl)

      ins.use(
        ['/microfinance'],
        proxy({
          secure: false,
          target: backendUrl,
          changeOrigin: true,
          prependPath: false
        })
      )

      ins.get('/', (req, res) => {
        res.redirect(HOME_PATH)
      })

      ins.use(
        proxy('/gql', {
          headers: {
            Origin: 'https://gql-staging.example.com'
          },
          secure: false,
          changeOrigin: true,
          target: graphUrl,
          prependPath: false
        })
      )
    }
  },
  onRender: () => <CoreLayout />
})

if (module.hot) {
  module.hot.accept('../routes', () => {
    console.log('✅ Server hot reloaded ../routes')
  })
  module.hot.accept('../url.js', () => {
    console.log('✅ Server hot reloaded ../url.js')
  })
  module.hot.accept('../apollo/client.js', () => {
    console.log('✅ Server hot reloaded ../apollo/client.js')
  })
  module.hot.accept('../apollo/client-ssr.js', () => {
    console.log('✅ Server hot reloaded ../apollo/client-ssr.js')
  })
  module.hot.accept('../layouts/CoreLayout', () => {
    console.log('✅ Server hot reloaded ../layouts')
  })
  module.hot.accept('../store/createStore', () => {
    console.log('✅ Server hot reloaded ../store/createStore')
  })
  module.hot.accept('../amp', () => {
    console.log('✅ Server hot reloaded ../amp')
  })
}

export default app
