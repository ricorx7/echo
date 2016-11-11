import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router';
import { Nav, Navbar, NavbarCollapse, NavbarBrand, NavbarHeader, NavbarToggle, NavDropdown, NavItem, MenuItem, FormGroup, FormControl, Button } from 'react-bootstrap';

import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import MenuItem1 from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import ArchiveIcon from 'material-ui/svg-icons/content/archive';
import InputIcon from 'material-ui/svg-icons/action/settings-input-hdmi';
import Menu from 'material-ui/Menu';

import {blueGrey500} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
//import injectTapEventPlugin from "react-tap-event-plugin";

//injectTapEventPlugin();

// Theme for material-ui toggle
const muiTheme = getMuiTheme({
  palette: {
    accent1Color: blueGrey500,
  },
});

export default class Navigation extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
        index: 0
    };
  }

handleSelect(eventKey) {
    console.log(eventKey);
    switch(eventKey) {
        case 1.1:
            console.log("ADCP List");
            break;
        case 1.2:
            console.log("ADCP Add");
            break;
        case 2.1:
            console.log("Water Test List");
            break;
        case 2.2:
            console.log("Water Test Add");
            break;
        case 3.1:
            console.log("Tank Test Add");
            break;
        case 3.2:
            console.log("Tank Test Add");
            break;
        default:
            break;
    }
}

 render() {
    return (
        <div>
        
    <Navbar inverse>
        <Navbar.Header>
            <Navbar.Brand>
                <a href="#">RoweTech Inc.Vault</a>
            </Navbar.Brand>
            <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
            <Nav onSelect={this.handleSelect}>
                <NavDropdown eventKey={1} title="ADCP" id="basic-nav-dropdown">
                    <MenuItem eventKey={1.1} rightIcon={<InputIcon />} ><Link to="/serial">Serial Port</Link></MenuItem>
                    <MenuItem eventKey={1.2} primaryText="Recordings" href="/record" rightIcon={<ArchiveIcon />} ></MenuItem>
                </NavDropdown>
            </Nav>
            <Nav pullRight>
                <NavItem eventKey={1} href="http://rowetechinc.co/wiki/index.php?title=Main_Page">RoweTech Wiki</NavItem>
            </Nav>
        </Navbar.Collapse>
    </Navbar>

    <MuiThemeProvider muiTheme={muiTheme}>
        <Toolbar>
            <ToolbarGroup firstChild={true}>
                <Menu>
                    <MenuItem1 primaryText="Serial Port" href="/react/#/serial" leftIcon={<InputIcon />} ></MenuItem1>
                    <MenuItem1 primaryText="Recordings" href="/record" leftIcon={<ArchiveIcon />} ></MenuItem1>
                </Menu>
            </ToolbarGroup>
        </Toolbar>
    </MuiThemeProvider>
</div>

    )}

};

//ReactDOM.render(navbarInstance, mountNode);
//ReactDOM.render(<Navigation />, document.getElementById('header'));