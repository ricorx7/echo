import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router';
import {blueGrey500} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import injectTapEventPlugin from "react-tap-event-plugin";
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import FontIcon from 'material-ui/FontIcon';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import RaisedButton from 'material-ui/RaisedButton';
import {Tabs, Tab} from 'material-ui/Tabs';
import ClearIcon from 'material-ui/svg-icons/content/clear';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import RedoIcon from 'material-ui/svg-icons/content/redo';
import CommentIcon from 'material-ui/svg-icons/communication/comment';
import SaveIcon from 'material-ui/svg-icons/content/save';
import CloudIcon from 'material-ui/svg-icons/file/cloud';
import StopIcon from 'material-ui/svg-icons/av/stop';
import InputIcon from 'material-ui/svg-icons/action/settings-input-component';
import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import Divider from 'material-ui/Divider';
import Websocket from './websocket.jsx';
//import WebsocketObservable from './redux/epics/websocketEpic.js';
//import WebsocketObservable from './redux/containers/websocketObservable.jsx';
import Counter from './saga/components/Counter';

//injectTapEventPlugin();

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
            commPort: "/dev/cu.usbserial-FTYNIZBA",
            commBaud: "115200",
            portIndex: 0,
            baudIndex: 1,
            serialList: [],
            bauds: [],
            serialInput: "",
            lastCmds: "",
            wsInput: "",
            openAdcp: true,
            openWs: false,
            adcpStatus: "Disconnected",
            isRecording: false,
            version: "",
            commands: [],
            ws: new Websocket({url: 'ws://localhost:8989/ws', onMessage: (evt) => {this.handleWsData(evt);}, onopen: this.openWebsocket(), onclose: this.closeWebsocket()}),
            //wsOb: new WebsocketObservable(),
        };
    }

    componentDidMount() {
        this.state.ws.setupWebsocket();

        // Get the Serial list
        $.getJSON('http://localhost:8989/serial/list', function(data) {
                this.setState({serialList: data.SerialPorts});
            }.bind(this));

        // Baud rate list
        this.setState({bauds: [19200, 115200, 921600]});
    }

    componentWillUnmount() {

    }


    // Handle the change to the Serial Port drop down menu.
    handlePortChange(event, index, myvalue) {
        this.setState({portIndex: myvalue});

        // Make a new serial connection
        console.log("index: %i  value: %s\n", myvalue, this.state.serialList[myvalue].Name);
    }

    // Handle the change to the Serial Port baud drop down menu.
    handleBaudChange(event, index, myvalue) {
        this.setState({baudIndex: myvalue});
        console.log("index: %i  value: %i\n", index, myvalue)


        // Make a new serial connection
        //$.post( "ajax/test.html", function( data ) {
        //    $( ".result" ).html( data );
        //  });
    }

    // Clear the serial data display.
    clearButtonClick(event, index, myvalue) {
        this.setState({serialData: ""});
    }

    // Open or close the ADCP settings.
    adcpViewButtonClick(event, index, myvalue) {
        this.setState({openAdcp: !this.state.openAdcp});
    }

    // Open or close the Websocket settings.
    wsViewButtonClick(event, index, myvalue) {
        this.setState({openWs: !this.state.openWs});
    }

    // Set the serial input value.
    serialInputChange(event) {
        this.setState({serialInput: event.target.value});
    }

    // Send a given command to the serial port.
    sendSerialCmdClick(event, index, myvalue) {
        var port = this.state.serialList[this.state.portIndex].Name;

        // Seperate the commands if mulitple commands were given
        // Send a command to the websocket for each command line given
        var cmds = this.state.serialInput.split('\n');
        var that = this;                                                // 'this' does not work within another function for the foreach loop, so made 'that'
        cmds.forEach(function(cmdInput) {
            var cmd = "SEND " + port + " " + cmdInput + "\r\n";
            console.log("%s", cmd);
            that.handleWsSend(cmd);
        });

        // Store the last commands
        this.setState({lastCmds: this.state.serialInput});

        // Clear input
        this.setState({serialInput: ""});
    }

    // Resend the last commands.
    resendCmdButtonClick(event, index, myvalue) {
        // Set the serial input to the last commands
        this.setState({serialInput: this.state.lastCmds});

        // Call the command to send the command
        //this.sendSerialCmdClick(event, index, myvalue);
    }

    // Record the serial data to a file.
    startRecordSerialButtonClick(event, index, myvalue) {
        var port = this.state.serialList[this.state.portIndex].Name;
        var cmd = "RECORD " + port + " START\r\n";
        this.handleWsSend(cmd);

        // Set flag
        this.setState({isRecording: true});
    }

    stopRecordSerialButtonClick(event, index, myvalue) {
        var port = this.state.serialList[this.state.portIndex].Name;
        var cmd = "RECORD " + port + " STOP\r\n";
        this.handleWsSend(cmd);

        // Set flag
        this.setState({isRecording: false});
    }

    // Set the Websocket input value.
    wsInputChange(event) {
        this.setState({wsInput: event.target.value});
    }

    // Send the Websocket command.
    sendWsCmdClick(event, index, myvalue) {
        // Seperate the commands if mulitple commands were given
        // Send a command to the websocket for each command line given
        var cmds = this.state.wsInput.split('\n');
        var that = this;                                                // 'this' does not work within another function for the foreach loop, so made 'that'
        cmds.forEach(function(cmdInput) {
            var cmd = cmdInput + "\r\n";
            console.log("%s", cmd);
            that.handleWsSend(cmd);
        });

        // Clear input
        this.setState({wsInput: ""});
    }

    // Connect to the selected serial port.
    connectSerialButtonClick(event) {
        var port = this.state.serialList[this.state.portIndex].Name;
        var baud = this.state.bauds[this.state.baudIndex];

        var cmd = "OPEN " + port + " " + baud + "\r\n";
        console.log("%s", cmd);
        this.handleWsSend(cmd);
    }

    // Disconnect the selected serial port.
    disconnectSerialButtonClick(event) {
        var port = this.state.serialList[this.state.portIndex].Name;

        // Send the command
        var cmd = "CLOSE " + port + "\r\n";
        this.handleWsSend(cmd);
    }

    // BREAK button clicked.
    breakButtonClick(event) {
        var port = this.state.serialList[this.state.portIndex].Name;
        var cmd = "SEND " + port + " BREAK\r\n";
        this.handleWsSend(cmd);
    }

    // Send data to the websocket.
    handleWsSend(cmd) {
        this.state.ws.send(cmd);
        console.log(cmd);
    }

    // Handle received messages from the websocket.
    handleWsData(data) {
        //console.log(data);
        let jsonData = JSON.parse(data);
        //this.setState({count: this.state.count + result.movement});
        //console.log(jsonData);


		// Get the version
		if( jsonData.hasOwnProperty('Version'))
		{
			this.setState({version: jsonData.Version});
		}

		// Get the Serial Port List
		if( jsonData.hasOwnProperty('SerialPorts')) {
            // Decode the serial list to see which is open
            for(var x = 0; x < jsonData.SerialPorts.length; x++) {
                if(jsonData.SerialPorts[x].IsOpen) {
                    this.setState({portIndex: x});
                    this.setState({adcpStatus: "Connected"});
                }
            }
        }

		// Get the commands
		if( jsonData.hasOwnProperty('Commands'))
		{
			this.setState({commands: jsonData.Commands});
		}

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





    render() {
        return (
            <div>
                <MuiThemeProvider muiTheme={muiTheme}>
                <Toolbar>
                    <ToolbarGroup firstChild={true}>
                        <h3>ADCP Status: {this.state.adcpStatus}</h3>
                    </ToolbarGroup>
                    <ToolbarGroup>
                        <IconButton onClick={this.clearButtonClick.bind(this)} ><DeleteIcon /></IconButton>
                        <FontIcon className="muidocs-icon-custom-sort" />
                        <ToolbarSeparator />
                        <IconButton onClick={this.adcpViewButtonClick.bind(this)} ><InputIcon /></IconButton>
                        <IconButton onClick={this.wsViewButtonClick.bind(this)} ><CloudIcon /></IconButton>
                        <IconMenu iconButtonElement={ <IconButton touch={true}> <NavigationExpandMoreIcon /> </IconButton> } >
                            <MenuItem primaryText="Download" />
                            <MenuItem primaryText="More Info" />
                        </IconMenu>
                    </ToolbarGroup>
                </Toolbar>
                </MuiThemeProvider>

                <MuiThemeProvider muiTheme={muiTheme}>
                    <div>
                        <TextField id="serialPort_txtArea" fullWidth={true} rows={30} rowsMax={30} multiLine={true} underlineShow={true} value={this.state.serialData} />
                        <Drawer width={400} openSecondary={true} open={this.state.openAdcp} docked={true} > 
                            <div>
                                <AppBar title="ADCP" onClick={this.adcpViewButtonClick.bind(this)} />
                                Status: {this.state.adcpStatus}
                                <br />
                                <Divider />

                                <IconButton onClick={this.startRecordSerialButtonClick.bind(this)} disabled={this.state.isRecording} ><SaveIcon /></IconButton>
                                <IconButton onClick={this.stopRecordSerialButtonClick.bind(this)} disabled={!this.state.isRecording} ><StopIcon /></IconButton>
                                <Divider />

                                <DropDownMenu value={this.state.portIndex} onChange={this.handlePortChange.bind(this, this.state.portIndex)}>
                                    {this.state.serialList.map(function(port, i) {
                                        return (
                                        <MenuItem value={i} primaryText={port.Name} />
                                        );
                                    })}
                                    <MenuItem value={this.state.serialList.length} primaryText="Disconnect" />
                                            
                                </DropDownMenu>
                                <br />
                                
                                <DropDownMenu value={this.state.baudIndex} onChange={this.handleBaudChange.bind(this, this.state.baudIndex)}>
                                    {this.state.bauds.map(function(baud, i) {
                                        return (
                                        <MenuItem value={i} primaryText={baud} />
                                        );
                                    })}
                                </DropDownMenu>
                                <Divider />
                                
                                <RaisedButton primary={true} type="submit" label="Connect" onClick={this.connectSerialButtonClick.bind(this)} />
                                <RaisedButton primary={true} type="submit" label="Disconnect" onClick={this.disconnectSerialButtonClick.bind(this)} />
                                <RaisedButton primary={true} type="submit" label="BREAK" onClick={this.breakButtonClick.bind(this)} />
                                <Divider />

                                <TextField hintText="ADCP Commands" value={this.state.serialInput} onChange={this.serialInputChange.bind(this)} multiLine={true} />
                                <RaisedButton primary={true} label="SEND" onClick={this.sendSerialCmdClick.bind(this)} />
                                <IconButton onClick={this.resendCmdButtonClick.bind(this)} ><RedoIcon /></IconButton>
                            </div>
                        </Drawer>
                        <Drawer width={300} openSecondary={true} open={this.state.openWs} >
                            <div>
                                <AppBar title="Websocket" onClick={this.wsViewButtonClick.bind(this)} />
                                <TextField hintText="Websocket Commands" value={this.state.wsInput} onChange={this.wsInputChange.bind(this)} multiLine={true} />
                                <RaisedButton primary={true} label="SEND" onClick={this.sendWsCmdClick.bind(this)} />
                            </div>
                        </Drawer>
                        
                    </div>
                </MuiThemeProvider>
                <Counter />

            </div>
        );
    }
}