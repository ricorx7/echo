import React from 'react';
import ReactDOM from 'react-dom';
import {deepOrange500} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import RaisedButton from 'material-ui/RaisedButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import injectTapEventPlugin from "react-tap-event-plugin";

injectTapEventPlugin();

const muiTheme = getMuiTheme({
  palette: {
    accent1Color: deepOrange500,
  },
});

export default class SerialToolbar extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      portIndex: 0,
      baudIndex: 1,
      serialList: [],
      bauds: []
    };
  }

  // Function called when component loaded.
  componentDidMount() {
    // Get the Serial list
    $.getJSON(this.props.apiList, function(data) {
              this.setState({serialList: data.SerialPorts});
        }.bind(this));

          // Baud rate list
    this.setState({bauds: [19200, 115200, 921600]});
  }

  // Handle the change to the Serial Port drop down menu.
  handlePortChange(event, index, myvalue) {
      this.setState({portIndex: myvalue});

      // Make a new serial connection
  }

  // Handle the change to the Serial Port baud drop down menu.
  handleBaudChange(event, index, myvalue) {
      this.setState({baudIndex: myvalue});
      console.log("index: %i  value: %i\n", index, myvalue)
      // Make a new serial connection
  }


  render() {


    return (
      <MuiThemeProvider muiTheme={muiTheme}>
      <Toolbar>
        <ToolbarGroup firstChild={true}>
          <DropDownMenu value={this.state.portIndex} onChange={this.handlePortChange.bind(this, this.state.portIndex)}>
            {this.state.serialList.map(function(port, i) {
                      return (
                        <MenuItem value={i} primaryText={port.Friendly} />
                      );
                    })}
            <MenuItem value={this.state.serialList.length} primaryText="Disconnect" />
                    
          </DropDownMenu>
        </ToolbarGroup>
        <ToolbarGroup firstChild={true}>
          <DropDownMenu value={this.state.baudIndex} onChange={this.handleBaudChange.bind(this, this.state.baudIndex)}>
            {this.state.bauds.map(function(baud, i) {
                      return (
                        <MenuItem value={i} primaryText={baud} />
                      );
                    })}
                    
          </DropDownMenu>
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarTitle text="Options" />
          <FontIcon className="muidocs-icon-custom-sort" />
          <ToolbarSeparator />
          <RaisedButton label="Connect" primary={true} />
          <IconMenu
            iconButtonElement={
              <IconButton touch={true}>
                <NavigationExpandMoreIcon />
              </IconButton>
            }
          >
            <MenuItem primaryText="Download" />
            <MenuItem primaryText="More Info" />
          </IconMenu>
        </ToolbarGroup>
      </Toolbar>
      </MuiThemeProvider>
    );
  }
}

  ReactDOM.render(
  <SerialToolbar apiList='http://localhost:8989/serial/list' />,
  document.getElementById('serialToolbar'));