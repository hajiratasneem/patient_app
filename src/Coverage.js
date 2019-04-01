import React from 'react';
import $ from 'jquery';
import config from './properties.json';
import { Input, Button } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import { AccessDenied } from './AccessDenied';
import { Switch } from 'react-router';
import { BrowserRouter, Redirect, Route } from 'react-router-dom';
import { Authentication } from './Authentication';
import { PatientData, getToken } from './PatientData';
import queryString from 'query-string';


export class Coverage extends React.Component {
  constructor(props) {
    super(props);
    console.log("in coverage---", this.props);
    this.state = {
      patient_id: '',
      access_token: '',
      code: queryString.parse(this.props.location.search, { ignoreQueryPrefix: true }).code,
      coverage_details: []
    }
    // console.log("coverage state----", this.state);
    this.retrieveToken(this.state.code);
  }

  async retrieveToken(code) {
    // let obj = await getToken(code);
    let obj = { 'token': sessionStorage.getItem('token'), 'patient_id': sessionStorage.getItem('patient_id') };
    // console.log("objjjj", obj);
    let patient_obj = await this.getPatientCoverage(obj.token, obj.patient_id);
    // console.log("patient_obj----",patient_obj);
    let coverage = this.getCoverageDetails(patient_obj);
    this.setState({ coverage_details: coverage });
  }

  getCoverageDetails(obj) {
    // console.log("objects----", obj);
    let temp_array = [];
    let i = 0;
    let temp = obj.map((data) => {
      // console.log("data------", data);
      let temp_obj = {};
      i = i + 1;
      temp_obj[''] = 'Coverage ' + i;
      if (data['fullUrl'] != undefined) {
        temp_obj['Full URL'] = data['fullUrl'];
      }
      if (data['resource'] != undefined) {
        if (data['resource']['grouping'] != undefined) {
          temp_obj['Grouping'] = data['resource']['grouping']['subGroup'] + ' - ' + data['resource']['grouping']['subPlan'];
        }
        if (data['resource']['status'] != undefined) {
          temp_obj['Status'] = data['resource']['status'];
        }
      }
      // console.log("temp_obj---", temp_obj);
      temp_array.push(temp_obj);
    });
    return temp_array;
  }

  async getPatientCoverage(token, patient_id) {
    var patient_url = config.coverage + patient_id;
    const tokenResponse = await fetch(patient_url, {
      method: "GET",
      headers: {
        'Authorization': 'Bearer ' + token
      },
    })
      .then((response) => {
        // console.log("response-----",response.json());
        return response.json();
      })
      .then((response) => {
        var entry = response ? response.entry : null;
        if (entry) {
          console.log("Successfully retrieved patient coverage details", entry);
        }
        else {
          if (response.error_description) {
            console.log(response.error_description);
          }
        }
        return entry;
      })
      .catch(reason => {
        console.log("Failed to get patient coverage details error--");
      });
    return tokenResponse;
  }

  render() {
    let data = this.state.coverage_details;
    // console.log("this.state.coverage_details-----",this.state.coverage_details, data);
    console.log("data_obj----", data.length, data[0]);
    let i = 0;
    let content = data.map((d) => (
      Object.keys(d).map(key => {
        if (key == '') {
          return (
            <div>
              <tr>
                <td style={{ 'textAlign': 'right' }}>{`${key}`}   </td>
                <td style={{ 'font-weight': 'bold', 'textAlign': 'left' }}>{`${d[key]}`}</td>
              </tr>
            </div>
          );
        }
        else {
          return (
            <div>
              <tr>
                <td style={{ 'textAlign': 'right' }}>{`${key}`}  : </td>
                <td style={{ 'font-weight': 'bold', 'textAlign': 'left', 'color': 'rgba(10, 90, 97, 0.89)' }}>{`${d[key]}`}</td>
              </tr>
            </div>
          );
        }
      })
    ));
    return (
      <div className=" col-12 ">
        <div className=" col-12 patient_data" style={{ 'textAlign': 'center' }}>
          Coverage
        </div>
        <div style={{ 'padding-top': '50px' }}></div>
        <table className=" col-12 ">
          <div>{content}</div>
        </table>
      </div>
    )
  }
}

export default withRouter(Coverage);
