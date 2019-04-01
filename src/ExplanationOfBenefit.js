import React from 'react';
import $ from 'jquery';
import config from './properties.json';
import { Input, Button } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import { Authentication } from './Authentication';
import { PatientData, getToken } from './PatientData';
import queryString from 'query-string';


export class ExplanationOfBenefit extends React.Component {
  constructor(props) {
    super(props);
    console.log("in explanation of benefit---", this.props);
    this.state = {
      patient_id: '',
      access_token: '',
      code: queryString.parse(this.props.location.search, { ignoreQueryPrefix: true }).code,
      benefit_details: []
    }
    // console.log("explanation of benefit state----", this.state);
    this.retrieveToken(this.state.code);
  }

  async retrieveToken(code) {
    // let obj = await getToken(code);
    let obj = { 'token': sessionStorage.getItem('token'), 'patient_id': sessionStorage.getItem('patient_id') };
    // console.log("objjjj",obj);
    let patient_obj = await this.getPatientExplanationOfBenefit(obj.token, obj.patient_id);
    let explanationofbenefit = this.getExplanationOfBenefitDetails(patient_obj);
    this.setState({ benefit_details: explanationofbenefit });
  }

  getExplanationOfBenefitDetails(obj) {
    // console.log("objects----", obj);
    let temp_array = [];
    let i = 0;
    let temp = obj.map((data) => {
      // console.log("data------", data);
      let temp_obj = {};
      i = i + 1;
      temp_obj[''] = 'Explanation Of Benefit ' + i;
      if (data['resource'] != undefined) {
        if (data['resource']['status'] != undefined) {
          temp_obj['Status'] = data['resource']['status'];
        }
        if (data['resource']['type']['coding'] != undefined) {
          // console.log("data['resource']['type']['coding']",data['resource']['type']['coding'])
          let a = data['resource']['type']['coding'].map((coding) => {
            // console.log("codinggggggggg",coding);
            if (coding['system'] != undefined) {
              let url_arr = coding['system'].split('/');
              // console.log("uuuuuu",url_arr[(url_arr.length)-1]);
              if (url_arr[(url_arr.length) - 1] == 'ex-claimtype') {
                if (coding['display'] != undefined) {
                  temp_obj['Claim Type'] = coding['display'];
                }
              }
              if (url_arr[(url_arr.length) - 1] == 'nch_clm_type_cd') {
                if (coding['display'] != undefined) {
                  temp_obj['NCH Claim Type'] = coding['display'];
                }
              }
            }
          });
        }
        if (data['resource']['billablePeriod'] != undefined) {
          if (data['resource']['billablePeriod']['start'] != undefined && data['resource']['billablePeriod']['end'] != undefined) {
            temp_obj['Billable Period'] = data['resource']['billablePeriod']['start'] + ' to ' + data['resource']['billablePeriod']['end'];
          }
        }
      }
      if (data['resource']['careTeam'] != undefined) {
        if (data['resource']['careTeam'][0]['provider']['identifier']['value'] != undefined) {
          temp_obj['Care Team Provider NPI'] = data['resource']['careTeam'][0]['provider']['identifier']['value'];
        }
      }
      if (data['resource']['diagnosis'] != undefined) {
        let j = 0;
        let d = data['resource']['diagnosis'].map((diagnosis) => {
          j = j + 1;
          if (diagnosis['diagnosisCodeableConcept']['coding'][0]['display'] != undefined) {
            temp_obj['Diagnosis ' + j] = diagnosis['diagnosisCodeableConcept']['coding'][0]['display'];
          }
        });
      }
      if (data['resource']['insurance'] != undefined) {
        if (data['resource']['insurance']['coverage']['reference'] != undefined) {
          let r = data['resource']['insurance']['coverage']['reference'].split('/');
          temp_obj['Insurance Reference ID'] = r[(r.length) - 1]
        }
      }
      if (data['resource']['item'] != undefined) {
        let z = 0;
        temp_obj['Number of Items'] = data['resource']['item'].length;
        let d = data['resource']['item'].map((item) => {
          z = z + 1;
          if (item['category'] != undefined) {
            temp_obj['Item ' + z + '- Category'] = item['category']['coding'][0]['display'];
          }
          if (item['servicedPeriod'] != undefined) {
            temp_obj['Item ' + z + '- Serviced Period'] = item['servicedPeriod']['start'] + ' to ' + item['servicedPeriod']['end'];
          }
          if (item['quantity'] != undefined) {
            temp_obj['Item ' + z + '- Quantity'] = item['quantity']['value'];
          }
          if (item['detail'] != undefined) {
            temp_obj['Item ' + z + '- Detail'] = item['detail'][0]['type']['coding'][0]['display'];
          }
        });
      }
      if (data['resource']['payment'] != undefined) {
        if (data['resource']['payment']['amount'] != undefined) {
          temp_obj['Payment'] = data['resource']['payment']['amount']['value'];
        }
      }
      temp_array.push(temp_obj);
    });
    return temp_array;
  }

  async getPatientExplanationOfBenefit(token, patient_id) {
    var patient_url = config.explanationofbenefit + patient_id;
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
          console.log("Successfully retrieved patient explanationofbenefit details", entry);
        }
        else {
          if (response.error_description) {
            console.log(response.error_description);
          }
        }
        return entry;
      })
      .catch(reason => {
        console.log("Failed to get patient explanationofbenefit details error--");
      });
    return tokenResponse;
  }

  render() {
    let data = this.state.benefit_details;
    // console.log("this.state.benefit_details-----",this.state.benefit_details, data);
    // console.log("data_obj----", data.length, data[0]);
    let i = 0;
    let content = data.map((d) => (
      Object.keys(d).map(key => {
        if (key == '') {
          return (
            <div>
              <tr>
                <td style={{ 'textAlign': 'right' }}>{`${key}`}   </td>
                <td style={{ 'font-weight': 'bold', 'textAlign': 'center' }}>{`${d[key]}`}</td>
              </tr>
            </div>
          );
        }
        else {
          return (
            <div>
              <tr>
                <td style={{ 'textAlign': 'center' }}>{`${key}`}  : </td>
                <td style={{ 'font-weight': 'bold', 'textAlign': 'center', 'color': 'rgba(10, 90, 97, 0.89)' }}>{`${d[key]}`}</td>
              </tr>
            </div>
          );
        }
      })
    ));
    return (
      <div className=" col-12 ">
        <div className=" col-12 patient_data" style={{ 'textAlign': 'center' }}>
          Explanation Of Benefit
        </div>
        <div style={{ 'padding-top': '50px' }}></div>
        <table className=" col-12 ">
          <div>{content}</div>
        </table>
      </div>
    )
  }
}


export default withRouter(ExplanationOfBenefit);
