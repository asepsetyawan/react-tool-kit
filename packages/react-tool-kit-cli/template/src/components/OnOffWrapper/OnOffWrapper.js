import { Component } from 'react'
import { func } from 'prop-types'

class OnOffWrapper extends Component {
  constructor(props) {
    super(props)

    let online = true

    if (typeof window !== 'undefined') {
      online = window.navigator.onLine
    }

    this.state = {
      online
    }

    this.handleOffline = this.handleOffline.bind(this)
    this.handleOnline = this.handleOnline.bind(this)
  }

  componentDidMount() {
    window.addEventListener('offline', this.handleOffline)
    window.addEventListener('online', this.handleOnline)
  }

  componentWillUnmount() {
    window.removeEventListener('offline', this.handleOffline)
    window.removeEventListener('online', this.handleOnline)
  }

  handleOffline(event) {
    if (this.props.onOffline) {
      this.props.onOffline(event)
    }
    this.setState({
      online: false
    })
  }

  handleOnline(event) {
    if (this.props.onOnline) {
      this.props.onOnline(event)
    }
    this.setState({
      online: true
    })
  }

  render() {
    if (!this.props.children) {
      return null
    }

    return this.props.children(this.state.online)
  }
}

OnOffWrapper.propTypes = {
  children: func,
  onOffline: func,
  onOnline: func
}

OnOffWrapper.defaultProps = {
  children: null,
  onOffline: () => {},
  onOnline: () => {}
}

export default OnOffWrapper
