import React from 'react';
import ReactDOM from 'react-dom';
import Websocket from 'react-websocket';

var RtiWebsocket = React.createClass({

  handleData: function(data) {
     // do something with the data
     this.setState({
        foo: bar
     });
     console.log("hello")
  },

  render: function() {
    return (
    <Websocket url='ws://192.168.0.222:8989/ws' onMessage={this.handleData}/>
    );
  }
});

ReactDOM.render(
  <RtiWebsocket />,
  document.getElementById('rtiWebsocket')
);
