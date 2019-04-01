import React, { Component } from 'react';
import axios from 'axios';
// import logo from './logo.svg';
import './App.css';

class App extends Component {
  //
  state = {
    selectedFile: null,
  };

  handleFileSelected = e => {
    this.setState({
      selectedFile: e.target.files[0],
    });
  };

  handleOnSubmit = e => {
    e.preventDefault();

    this.fileUpload(this.state.selectedFile)
      .then(res => console.log(res.data))
      .catch(err => console.log(err));
  };

  fileUpload = file => {
    const url = 'http://dekostactrs04.ugs.com/uploads';
    const fd = new FormData();
    fd.append('qqfile', file);
    const config = {
      headers: {
        'content-type': 'multipart/form-data',
      },
    };
    return axios.post(url, fd, config);
  };

  render() {
    return (
      <div className="App">
        <form onSubmit={this.handleOnSubmit}>
          <h2>File Upload</h2>
          <input type="file" onChange={this.handleFileSelected} />
          <button type="submit">Upload</button>
        </form>
      </div>
    );
  }
}

export default App;
