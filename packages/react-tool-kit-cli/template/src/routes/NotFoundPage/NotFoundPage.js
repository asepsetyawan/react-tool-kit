import React from 'react'
import Helmet from 'react-helmet-async'
import { Link } from 'react-router-dom'

import RouterStatus from '../../components/RouterStatus'
import './NotFoundPage.scss'
import { HOME_PATH } from '../../url'

const NotFoundPage = () => (
  <RouterStatus code={404}>
    <Helmet>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
    <div className="not-found-page">
      Sorry, Page Not found, <Link to={HOME_PATH}>Back to Home</Link>
    </div>
  </RouterStatus>
)

export default NotFoundPage
