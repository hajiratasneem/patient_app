import React from 'react';
import $ from 'jquery';
import config from './properties.json';
import queryString from 'query-string';
import { Input, Button } from 'semantic-ui-react';
import { BrowserRouter, Redirect, Route, withRouter, Link } from 'react-router-dom';
import { Switch } from 'react-router';
import { getAccessToken } from './Authentication';
import { PatientDetails } from './PatientDetails';
import { ExplanationOfBenefit } from './ExplanationOfBenefit';
import { Coverage } from './Coverage';
import { faListAlt, faAmericanSignLanguageInterpreting } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export class PatientData extends React.Component {
  constructor(props) {
    super(props);
    console.log("props patient data---", this.props);
    this.state = {
      patient_id: '',
      access_token: '',
      code: queryString.parse(this.props.location.search, { ignoreQueryPrefix: true }).code
    };
    this.retrieveTokenObject(this.state.code);
  }

  async retrieveTokenObject(code) {
    let token_obj = {};
    if (sessionStorage.getItem('token') == '' || sessionStorage.getItem('token') == undefined) {
      token_obj = await getToken(this.state.code);
    }
    else {
      token_obj = { 'token': sessionStorage.getItem('token'), 'patient_id': sessionStorage.getItem('patient_id') };
    }
    // console.log("token_objjjjjjjjj",token_obj);
  }

  onClickLogout () {
    sessionStorage.setItem('token','');
    sessionStorage.setItem('code','');
    sessionStorage.setItem('patient_id','');
    
    window.open("https://sandbox.bluebutton.cms.gov/v1/o/authorize/?client_id="+config.client_id+"&redirect_uri="+config.redirect_uri+"&response_type=code","_self");
  }

  render() {
    return (
      <div>
        <div > <p className={'logout'}> <Button  onClick={this.onClickLogout}>Logout</Button></p></div>
        <div className=" col-12 patient_data" style={{'textAlign':'center'}} >
          <FontAwesomeIcon icon={faListAlt} />
          &nbsp;Patient Medicare Record
        </div>
        <div></div>
        <div className="col-12 padding-top-10px" style={{'textAlign':'center','padding-top': '50px'}}>
          <ul style={{'font-size': '22px'}}>
            <li className="col-12 nobull">
              <Link to={{ pathname: '/patient-data/details', search: '?code=' + this.state.code }}>Patient Details</Link>
            </li>
            <br />
            <li className="col-12 nobull">
              <Link to={{ pathname: '/patient-data/explanationOfBenefit', search: '?code=' + this.state.code }}>Explanation Of Benefit</Link>
            </li>
            <br />
            <li className="col-12 nobull">
              <Link to={{ pathname: '/patient-data/coverage', search: '?code=' + this.state.code }}>Coverage Details</Link>
            </li>
            <br />
          </ul>
        </div>
      </div>
    )
  }
}

export async function getToken(code) {
  let token = await getAccessToken(code);

  let patient_id = await getPatientID(token);
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('patient_id', patient_id);
  sessionStorage.setItem('code', code);
  return { 'token': token, 'patient_id': patient_id };
}

export async function getPatientID(token) {
  var patient_id_url = config.patient_id;
  const tokenResponse = await fetch(patient_id_url, {
    method: "GET",
    headers: {
      'Authorization': 'Bearer ' + token
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      var entry = response ? response.entry : null;
      var p = entry[0].resource.id;
      if (p) {
        // retrieved_patient_id = patient_id;
        console.log("Successfully retrieved patient id", p);
      }
      else {
        if (response.error_description) {
          console.log(response.error_description);
        }
      }
      return p;
    })
    .catch(reason => {
      console.log("Failed to get patient id error--");
    });
  return tokenResponse;
}

export default withRouter(PatientData);
