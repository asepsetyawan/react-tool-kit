import '@babel/polyfill'
import 'raf/polyfill'

import React from 'react'
import { hydrate, render } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ApolloProvider } from 'react-apollo'
import { HelmetProvider } from 'react-helmet-async'
import { loadableReady } from '@loadable/component'

import client from '../apollo/client'
import { createClientStore } from '../store/createStore'
import CoreLayout from '../layouts/CoreLayout'
import 'basscss/css/basscss.css'
// import { HOME_PATH } from '../url'
const store = createClientStore(window.INITIAL_STATE)

function App() {
  return (
    <ApolloProvider client={client}>
      <HelmetProvider>
        <Provider store={store}>
          <BrowserRouter>
            <CoreLayout />
          </BrowserRouter>
        </Provider>
      </HelmetProvider>
    </ApolloProvider>
  )
}

loadableReady(() => {
  const renderApp = window.__shell__ ? render : hydrate
  renderApp(<App />, document.querySelector('#root'))
})

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register(HOME_PATH + 'service-worker.js')
//       .then(registration => {
//         console.log('SW registered: ', registration.scope)

//         registration.onupdatefound = () => {
//           const installingWorker = registration.installing
//           if (installingWorker == null) {
//             return
//           }
//           installingWorker.onstatechange = () => {
//             switch (installingWorker.state) {
//               case 'installed':
//                 if (navigator.serviceWorker.controller) {
//                   window.location.reload()
//                 }
//                 break
//             }
//           }
//         }
//       })
//       .catch(registrationError => {
//         console.log('SW registration failed: ', registrationError)
//       })
//   })
// }
