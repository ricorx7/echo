import React from 'react';
import ReactDOM from 'react-dom';

class Websocket extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
          ws: new WebSocket(this.props.url, this.props.protocol),
          attempts: 1
        };
    }

    componentDidMount() {
      this.setupWebsocket();
    }

    componentWillUnmount() {
      let websocket = this.state.ws;
      websocket.close();
    }


    logging(logline) {
        if (this.props.debug === true) {
            console.log(logline);
        }
    }

    generateInterval (k) {
      return Math.min(30, (Math.pow(2, k) - 1)) * 1000;
    }

    setupWebsocket() {
        let websocket = this.state.ws;

        websocket.onopen = () => {
          this.logging('Websocket connected');
          if (this.props.onOpen) {
            this.props.onOpen(websocket);
          }
        };

        websocket.onmessage = (evt) => {
          this.props.onMessage(evt.data);
        };

        websocket.onclose = () => {
          this.logging('Websocket disconnected');
          this.props.onClose();
          if (this.props.reconnect) {
            let time = this.generateInterval(this.state.attempts);
            setTimeout(() => {
              this.setState({attempts: this.state.attempts++});
              this.setupWebsocket();
            }, time);
          }
        }
    }

    // Send data to the websocket.
    send(cmd) {
        this.state.ws.send(cmd);
        console.log(cmd);
    }

    render() {
      return (
        <div></div>
      );
    }
}

Websocket.defaultProps = {
    debug: false,
    reconnect: true
};

Websocket.propTypes = {
    url: React.PropTypes.string.isRequired,
    onMessage: React.PropTypes.func.isRequired,
    onOpen: React.PropTypes.func,
    onClose: React.PropTypes.func,
    send: React.PropTypes.func,
    debug: React.PropTypes.bool,
    reconnect: React.PropTypes.bool,
    protocol: React.PropTypes.string
};

export default Websocket;