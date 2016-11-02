import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router';
import { Nav, Navbar, NavbarCollapse, NavbarBrand, NavbarHeader, NavbarToggle, NavDropdown, NavItem, MenuItem, FormGroup, FormControl, Button } from 'react-bootstrap';

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
                    <MenuItem eventKey={1.1} ><Link to="/serial">Serial Port</Link></MenuItem>
                    <MenuItem eventKey={1.2}>Add</MenuItem>
                </NavDropdown>
            </Nav>
            <Nav pullRight>
                <NavItem eventKey={1} href="http://rowetechinc.co/wiki/index.php?title=Main_Page">RoweTech Wiki</NavItem>
            </Nav>
        </Navbar.Collapse>
    </Navbar>
    )}

};

//ReactDOM.render(navbarInstance, mountNode);
//ReactDOM.render(<Navigation />, document.getElementById('header'));