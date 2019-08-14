import React, { PureComponent } from 'react'
import RNSnackbar from 'react-native-snackbar-component'
import PropTypes from 'prop-types'
import constants from './constants'
import checkConnectionStatus from './ConnectionCheck'

export default class Snackbar extends PureComponent {
    state = { visible: true }

    componentDidMount() {
        const { type, timeout } = this.props
        if (type === 'slow') {
            this.timer = setTimeout(this.dismiss, timeout)
        }
    }

    componentWillUnmount() {
        this.timer && clearTimeout(this.timer)
    }

    dismiss = () => this.setState({ visible: false })
    show = () => this.setState({ visible: true })

    connectivityCheck = () => {
        const { actionHandler } = this.props
        checkConnectionStatus(false).then((info) => {
            actionHandler(info)
            if (!info.isConnected) {
                this.timer = setTimeout(this.show, 1500)
            }
        }).catch((err) => {
            const { statusCode } = err
            if (statusCode === 401) {
                actionHandler(err)
            }
            this.timer = setTimeout(this.show, 1500)
        })
    }
    

    getMessage = (message = '', type) => {
        if (!message || message === '') {
            if (type === 'slow') {
                return constants.slowInternetText
            }
            return constants.noInternetText
        }
        return message
    }

    onActionButtonPress = () => {
        const { type } =this.props
        this.dismiss()
        if (type === 'disconnected') {
            this.connectivityCheck()
        }
    }

    render() {
        const { type, message } = this.props
        const { visible } = this.state
        const textMessage = this.getMessage(message, type)
        return (
            <RNSnackbar
                visible={visible}
                textMessage={textMessage}
                actionText={(type === 'disconnected' ? 'retry' : null)}
                accentColor={'green'}
                actionHandler={this.onActionButtonPress}
            />
        )
    }
}

Snackbar.propTypes = {
    type: PropTypes.oneOf(['slow', 'disconnected']),
    message: PropTypes.string,
    timeout: PropTypes.number,
    actionHandler: PropTypes.func
}

Snackbar.defaultProps = {
    type: 'disconnected',
    message: '',
    timeout: 3000,
    actionHandler: () => {}
}