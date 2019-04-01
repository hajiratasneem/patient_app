import React from 'react';
import $ from 'jquery';
import config from './properties.json';
import queryString from 'query-string';
import { Input, Button } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import { Authentication } from './Authentication';
import { PatientData, getToken } from './PatientData';

export class PatientDetails extends React.Component {
  constructor(props) {
    super(props);
    console.log("in patient detailsss---", this.props);
    this.state = {
      patient_id: '',
      access_token: '',
      code: queryString.parse(this.props.location.search, { ignoreQueryPrefix: true }).code,
      patient_details: {}
    }
    // console.log("parent details state----",this.state);
    this.retrieveToken(this.state.code);
  }

  async retrieveToken(code) {
    // let obj = await getToken(code);
    let obj = { 'token': sessionStorage.getItem('token'), 'patient_id': sessionStorage.getItem('patient_id') };
    let patient_obj = await this.getPatientDetails(obj.token, obj.patient_id);
    if(patient_obj!=undefined){
      if (patient_obj.length > 0) {
        console.log('patient_details', patient_obj[0].resource);
        if (patient_obj[0].resource != undefined) {
          // this.setState({ data: patient_obj[0].resource });
          this.patientDetails(patient_obj[0].resource);
        }
      }
    }
  }

  patientDetails(obj) {
    // let obj = this.state.data;
    let patient_details = { 'Patient Name': '', 'District': '', 'State': '', 'Postal Code': '' , 'Gender': '', 'Birth Date': '' };
    patient_details['Patient Name'] = obj['name'][0]['given'][0]
    if (obj['name'][0]['given'].length > 1) {
      patient_details['Patient Name'] += ' ' + obj['name'][0]['given'][1]
    }
    patient_details['Patient Name'] += ' ' + obj['name'][0]['family']
    patient_details['Birth Date'] = obj['birthDate'];
    patient_details['Gender'] = obj['gender'];
    patient_details['District'] = obj['address'][0]['district'];
    patient_details['State'] = obj['address'][0]['state'];
    patient_details['Postal Code'] = obj['address'][0]['postalCode'];
    this.setState({ patient_details: patient_details });
    console.log("patient_details", patient_details);
  }

  async getPatientDetails(token, patient_id) {
    var patient_url = config.patient_details + patient_id;
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
          console.log("Successfully retrieved patient details", entry);
        }
        else {
          if (response.error_description) {
            console.log(response.error_description);
          }
        }
        return entry;
      })
      .catch(reason => {
        console.log("Failed to get patient details error--");
      });

    return tokenResponse;
  }

  render() {
    let data = this.state.patient_details;
    let content = Object.keys(data).map(key => {
      return (
        // <div >
          <tr key={key}>
            <td style={{ 'textAlign': 'right' }}>{`${key}`}  : </td>
            <td style={{'font-weight': 'bold','textAlign': 'left', 'color' :'rgba(10, 90, 97, 0.89)'}}>{`${data[key]}`}</td>

          </tr>
        // </div>
      );
    });
    return (
      <div className=" col-12 ">
        <div className=" col-12 patient_data" style={{ 'textAlign': 'center' }}>
          Patient Details
        </div>
        <div style={{'padding-top': '50px' }}></div>
        <table className=" col-12 ">
          {content}
        </table>
      </div>
    )
  }
}


export default withRouter(PatientDetails);
