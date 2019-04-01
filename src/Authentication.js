import React from 'react';
import $ from 'jquery';
import config from './properties.json';
import {Input,Button} from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import {AccessDenied} from './AccessDenied';
import {Switch} from 'react-router';
import {BrowserRouter, Redirect, Route} from 'react-router-dom';
import {PatientData} from './PatientData';

export class Authentication extends React.Component {
  constructor(props){
    console.log("props auth---",props);
    super(props);
    this.state = {
        authentication_error:false
    }
    if (props != undefined){
        if(props.location != undefined){
            if(props.location.search !=undefined){
                var params = props.location.search;
                if(params.slice(1,6)=='error'){
                    // this.setState({authentication_error: true});
                    this.state.authentication_error = true;
                }
                
            }
        }
    }
    let keys = Object.keys(sessionStorage);
    let i = keys.length;
    // console.log("keyss",keys);
    if(!keys.includes('token')){
        sessionStorage.setItem('token','');
    }
    
    // if(sessionStorage.getItem('token')== '' || sessionStorage.getItem('token')== undefined){
    //     sessionStorage.setItem('token','');
    // }
    
    // sessionStorage.setItem('code','');
    // sessionStorage.setItem('patient_id','');
    
  }

  render() {
    return (
        <div>
            <Switch> 
                { this.state.authentication_error && 
                <Route path="/patient-data" component={AccessDenied} />
                }
                { !this.state.authentication_error && 
                <Route path="/patient-data" component={PatientData} />
                }
            </Switch>
      </div>
    )
  }
}

export async function getAccessToken(param_code){
    var tokenUrl = config.tokenUrl;
    let params = {
      grant_type:"authorization_code",
      code:param_code,
      client_id:config.client_id,
      client_secret:config.client_secret,
      redirect_uri: config.redirect_uri
    };
    // if(config.client_id){
    //     console.log("Using client {" + config.client_id + "}")
    // }else{
    //     console.log("No client id provided in properties.json");
    // }

    // Encodes the params to be compliant with
    // x-www-form-urlencoded content types.
    const searchParams = Object.keys(params).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');
    // We get the token from the url
    // console.log("searchParams",searchParams);
    const tokenResponse =  await fetch(tokenUrl, {
        method: "POST",
        headers: {
            "Accept":"application/json",
            "Content-Type":"application/x-www-form-urlencoded"
          },
        body: searchParams
    })
    .then((response) =>{
        return response.json();
    })
    .then((response)=>{
        const token = response?response.access_token:null;
        if(token){
            console.log("Successfully retrieved token", token);
        }
        else{
            // console.log("Failed to get token warning --");
            if(response.error_description){
                console.log(response.error_description);
            }
        }
      return token;

    })
    .catch(reason =>{
        console.log("Failed to get token error--");
        // console.log("Bad request");
    });
    // if(tokenResponse == undefined){
    //     window.open("https://sandbox.bluebutton.cms.gov/v1/o/authorize/?client_id="+config.client_id+"&redirect_uri="+config.redirect_uri+"&response_type=code","_self")
    //   }
    //   else{
    return tokenResponse;
    //   }
  }

export default withRouter(Authentication);
