import React from 'react';
import ReactDOM from 'react-dom';
import {blueGrey500} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';


// Theme for material-ui toggle
const muiTheme = getMuiTheme({
  palette: {
    accent1Color: blueGrey500,
  },
});

const dlButtonStyle = {
  margin: 12,
};

// Display the record data and allow the user to download the data.
export default class RecordedData extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            fileList: []
        }
    }

    componentDidMount() {
        // Get the file list
        $.getJSON('http://localhost:8989/file/list', function(data) {
                this.setState({fileList: data.FileList});
            }.bind(this));

    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div>
                <MuiThemeProvider muiTheme={muiTheme}>
                <div>
                {this.state.fileList.map(function(file, i) {
                    return (
                        <div>
                            {file.RcrdFile}
                            <RaisedButton primary={true} label="Download" href={"../" + file.RcrdFolder + "/" + file.RcrdFile} style={dlButtonStyle}/>
                            
                        </div>
                    );
                })}
                </div>
                </MuiThemeProvider>
            </div>
        );
    }

}