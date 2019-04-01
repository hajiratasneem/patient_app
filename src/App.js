import React, { Component } from 'react';
import {Switch} from 'react-router';
import {BrowserRouter, Redirect, Route} from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faIgloo,faNotesMedical } from '@fortawesome/free-solid-svg-icons';
import config from './properties.json';
import {Authentication} from './Authentication';
import {PatientDetails} from './PatientDetails';
import {ExplanationOfBenefit} from './ExplanationOfBenefit';
import {Coverage} from './Coverage';
import {PatientData} from './PatientData';

library.add(faIgloo,faNotesMedical)
export default class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={() => { return <Redirect to="/login" />}} />
                    <Route exact  path='/login' component={() => { 
                        window.location = 'https://sandbox.bluebutton.cms.gov/v1/o/authorize/?client_id='+config.client_id+'&redirect_uri='+config.redirect_uri+'&response_type=code';
                         return null;} }/>
                    <Route exact path={"/patient-data"} component={Authentication} />
                    {/* <Route path="/patient-data" component={PatientData} /> */}
                    <Route path="/patient-data/details" component={PatientDetails} />
                    <Route path="/patient-data/explanationOfBenefit" component={ExplanationOfBenefit} />
                    <Route path="/patient-data/coverage" component={Coverage} />
                </Switch>
            </BrowserRouter>
        );
    }
}