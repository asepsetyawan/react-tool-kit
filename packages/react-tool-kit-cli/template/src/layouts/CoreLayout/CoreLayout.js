import React, { Component } from 'react'
import Helmet from 'react-helmet-async'

import renderRoutes from '../../routes'

import './CoreLayout.scss'
import { HOME_PATH } from '../../url'

class CoreLayout extends Component {
  render() {
    return (
      <div className="container text-center">
        <Helmet>
          <title>React App</title>
          <meta name="title" content="React App" />
          <meta name="description" content="React App" />
          <meta property="og:title" content="React App" />
          <meta property="og:description" content="React App" />
          <meta name="theme-color" content="#42b549" />
          <link rel="manifest" href={`${HOME_PATH}manifest.json`} />
        </Helmet>
        <div className="core-layout__viewport">{renderRoutes()}</div>
      </div>
    )
  }
}

export default CoreLayout
