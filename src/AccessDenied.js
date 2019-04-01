import React from 'react';
import $ from 'jquery';
import config from './properties.json';
import {Input,Button} from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import Loader from 'react-loader-spinner';

export class AccessDenied extends React.Component {
  constructor(props){
    console.log("props----");
    super(props);
    this.state = {
      error:'Access Denied!'
    }    
  }

  render() {
    return (
      <div className="access_denied">
          {this.state.error}
      </div>)
  }
}

export default withRouter(AccessDenied);