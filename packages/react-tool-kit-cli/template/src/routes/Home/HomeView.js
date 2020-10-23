import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { compose } from 'recompose'
import { Link } from 'react-router-dom'

import { toggleLogin } from '../../reducers/user'
import './HomeView.scss'
import TestView from './TestView'
import TestGql from './TestGql'
import withOffline from '../../components/withOffline'
import HomeHook from './HomeHook'
import { HOME_PATH } from '../../url'

class HomeView extends Component {
  static propTypes = {
    user: PropTypes.object,
    toggleLogin: PropTypes.func
  }

  render() {
    return (
      <div className="home-view">
        <div className="my2">
          home view (change HomeView.js and states should not be reset)
        </div>
        <div>
          user: {this.props.user.isLoggedIn ? 'loggedIn' : 'notLoggedIn'}
        </div>
        <div className="my2">
          <button onClick={this.props.toggleLogin}>toggle login</button>
        </div>
        <TestGql />
        <TestView />
        <Link to={HOME_PATH + 'about'}>about</Link>
        <HomeHook />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  user: state.user
})

const mapDispatchToProps = {
  toggleLogin
}

const enhance = compose(
  withOffline,
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)

export default enhance(HomeView)
