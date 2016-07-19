    import React from 'react';
    import ReactDOM from 'react-dom';
    import Websocket from './Websocket.jsx';


  class EchoWebsocket extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        data: ""
      };
    }

    handleData(incomingData) {
      let result = JSON.parse(incomingData);
      this.setState({data: (JSON.stringify(result.D) + "\n" + this.state.data).substring(0, 2000)});

    }

    render() {
      return (
        <div>

         <textarea value={this.state.data} readOnly rows="35" cols="150" />

          <Websocket url='ws://localhost:8787/ws' 
              onMessage={this.handleData.bind(this)}
              reconnect='true'/>
        </div>
      );
    }
  }


  ReactDOM.render(
  <EchoWebsocket />,
  document.getElementById('echoWebsocket'));