import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router';
import {blueGrey500} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
//import Websocket from 'react-websocket';
import RaisedButton from 'material-ui/RaisedButton';
import Websocketsss from './websocket.jsx';

// Theme for material-ui toggle
const muiTheme = getMuiTheme({
  palette: {
    accent1Color: blueGrey500,
  },
});

export default class SerialDisplay extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            index: 0,
            serialData: "",
            portIsOpen: false,
            commPort: "COM31",
            commBaud: "115200",
            //ws: new Websocketsss({url:'ws://localhost:8989/ws'}),
            //ws: new WebSocket('ws://localhost:8989/ws'),
            wss: new Websocketsss({url: 'ws://localhost:8989/ws', onMessage: (evt) => {this.handleWsData(evt);}, onopen: this.openWebsocket(), onclose: this.closeWebsocket()}),
        };
    }

    componentDidMount() {
      //this.setupWebsocket();
      this.state.wss.setupWebsocket();
    }

    componentWillUnmount() {
      //let websocket = this.state.ws;
      //websocket.close();
    }


    connectButtonChange(event) {

		//if(this.state.portIsOpen == false)
		//{
			var cmd = "OPEN " + this.state.commPort + " " + this.state.commBaud + "\r\n";
			this.handleWsSend(cmd);
            //this.setState({portIsOpen: true});
		//}
    }

    disconnectButtonChange(event) {

		//if(this.state.portIsOpen == true)
		//{
            // Send the command
		    var cmd = "CLOSE " + this.state.commPort + "\r\n";
			this.handleWsSend(cmd);
            //this.setState({portIsOpen: false});
		//}
    }

    breakButtonChange(event) {
        var cmd = "SEND " + this.state.commPort + " BREAK\r\n";
        this.handleWsSend(cmd);
    }

    // Send data to the websocket.
    handleWsSend(cmd) {
        this.state.wss.send(cmd);
        console.log(cmd);
    }

    // Handle received messages from the websocket.
    handleWsData(data) {
        //console.log(data);
        let jsonData = JSON.parse(data);
        //this.setState({count: this.state.count + result.movement});
        //console.log(jsonData);


		// // Get the version
		// if( jsonData.hasOwnProperty('Version'))
		// {
		// 	$scope.version = jsonData.Version;
		// }

		// // Get the Serial Port List
		// if( jsonData.hasOwnProperty('SerialPorts'))
		// {
		// 	$scope.portList = jsonData.SerialPorts;
		// }

		// // Get the commands
		// if( jsonData.hasOwnProperty('Commands'))
		// {
		// 	$scope.commands = jsonData.Commands;
		// }

		// // Get the file size that is recording
		// if( jsonData.hasOwnProperty('D') && jsonData.hasOwnProperty('FileSize') && $scope.portList != null)
		// {
		// 	for(x = 0; x < $scope.portList.length; x++)
		// 	{
		// 		if($scope.portList[x].Name == jsonData.P)
		// 		{
		// 			$scope.portList[x].fileSize = humanFileSize(jsonData.FileSize, false);
		// 		}
		// 	}
		// }

		// If JSON data contains a D element,
		// display just the data.  If the not display all
		if(jsonData.D == undefined)
		{
			//$scope.messageStr += msg;
            this.setState({serialData: this.state.serialData += data});
		}
		else if( jsonData.hasOwnProperty('D'))
		{
			//$scope.messageStr += jsonData.D;
            this.setState({serialData: this.state.serialData += jsonData.D});
		}
		else {
			//$scope.messages.push(msg);
			//$scope.messageStr += msg;
			//$scope.messageStr += jsonData.D;
		}

        // Keep the buffer at a max length and remove the earlier data
        var maxLength = 3000;
        if(this.state.serialData.length > maxLength)
        {
            this.setState({serialData: this.state.serialData.substring(this.state.serialData.length-maxLength)});
        }

        // Always scroll to the bottom
        var txtArea = document.getElementById('serialPort_txtArea');
        txtArea.scrollTop = txtArea.scrollHeight;

    }

    openWebsocket() {
        console.log("Open Websocket");
    }

    closeWebsocket() {
        console.log("Close Websocket");
    }

    setupWebsocket() {
        let websocket = this.state.ws;
        websocket.onopen = this.openWebsocket;      // Open Socket function
        websocket.close = this.closeWebsocket;      // Close Socket function
        websocket.onmessage = (evt) => {            // When message is received from socket
            this.handleWsData(evt.data);
        }
    }



    render() {
        return (
            <div>
                <MuiThemeProvider muiTheme={muiTheme}>
                    <div>
                    <TextField id="serialPort_txtArea" fullWidth={true} rows={30} rowsMax={30} multiLine={true} underlineShow={true} value={this.state.serialData} />
                    
                    <form onSubmit={this.connectButtonChange.bind(this)}>
                        <RaisedButton primary={true} type="submit" label="Connect" />
                    </form>
                    <form onSubmit={this.disconnectButtonChange.bind(this)}>
                        <RaisedButton primary={true} type="submit" label="Disconnect" />
                    </form>
                    <form onSubmit={this.breakButtonChange.bind(this)}>
                        <RaisedButton primary={true} type="submit" label="BREAK" />
                    </form>
                    </div>
                </MuiThemeProvider>

            </div>
        );
    }
}