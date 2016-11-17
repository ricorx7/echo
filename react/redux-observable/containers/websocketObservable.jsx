import React from 'react';
import ReactDOM from 'react-dom';
import websocket from './../epics/websocketEpic.js';

class WebsocketObservable extends React.Component {

    componentDidMount() {
      this.props.startSocket();
    }

    componentWillUnmount() {
      this.props.stopSocket();
    }


    logging(logline) {
        if (this.props.debug === true) {
            console.log(logline);
        }
    }

    // Send data to the websocket.
    send(cmd) {
        this.state.ws.send(cmd);
        console.log(cmd);
    }

    render() {
        console.log('this.props', this.props);
        return (
          <div>
            Data: { this.props.socket }
          </div>
        );
      }
}

export default WebsocketObservable;