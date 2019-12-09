import { FACEBOOK_APP_ID, GOOGLE_CLIENT_ID } from '../../../config';
import React, { Component } from 'react';
//import FacebookLogin from 'react-facebook-login';
import FacebookLogin from  'react-facebook-login/dist/facebook-login-render-props';
import { GoogleLogin } from 'react-google-login';
import login from '../actions/login';
import Loader from "../containers/Loading";
const ONE_DAY = 1000 * 60 * 60 * 24;
let loginwithfacebookinitialized = false;
class Login extends Component {

    constructor() {
        super();
        this.state = { error: null };
    }


    onFailure = (error) => {
        console.error('App onFailure', error);
        this.setState({ error });
    };

    performLogin = async (provider, token, showError = true) => {
        try{
            const result = await login(provider, token);
            const authData = localStorage.getItem('authData');
            const issueDate  = authData ? JSON.parse(authData).issueDate : new Date();

            localStorage.setItem('authData', JSON.stringify({provider, token, issueDate }));
            return this.props.onLogin(result);
        }catch(error){
            localStorage.removeItem('authData');
            if (showError){
                return this.onFailure(error);
            } else{
                return this.onFailure(null);
            }
        }
    };

    facebookResponse = (response) => {
        if (response.accessToken){
            this.performLogin('facebook', response.accessToken, true);
        }else{
            this.onFailure('login failed')
        }

    };

    googleResponse = (response) => {
        if (response.accessToken){
            this.performLogin('google', response.accessToken, true);
        }else{
            this.onFailure('login failed')
        }

    };

    render() {
        const authData = localStorage.getItem('authData');
        if (authData){
            const {provider, token, issueDate } = JSON.parse(authData);
            const timePassed = (new Date()).getTime() - (new Date(issueDate)).getTime();
            if (timePassed > ONE_DAY){
                localStorage.removeItem('authData');
            } else{
                this.performLogin(provider, token, false);
                return <Loader />;
            }
        }
        console.log('window.location.protocol:',window.location.protocol);
        const google = (<GoogleLogin
            clientId={GOOGLE_CLIENT_ID}
            onSuccess={this.googleResponse}
            onFailure={this.onFailure}
            render={renderProps => (
                <button id="google-login-button"  className="login-button"  onClick={renderProps.onClick}>Google</button>
            )}
        />);
        const https = window.location.protocol === 'http:';
        console.log(' window.location.search', window.location.search);
        console.log(' window.location.origin', window.location.origin);
        const cameFromNonHttpFacebookClick = window.location.search.indexOf('loginwithfacebook')>0;
        console.log('cameFromNonHttpFacebookClick',cameFromNonHttpFacebookClick);

        const httpsUrl = `${window.location.origin.replace('http', 'https')}?loginwithfacebook=true`;
         const facebook = https ?  (<button id="facebook-login-button" className="login-button" onClick={ ()=>{ window.location.href = httpsUrl; } }>Facebook</button>) :( <FacebookLogin
            appId={FACEBOOK_APP_ID}
            autoLoad={false}
            fields="name,email,picture"
            callback={this.facebookResponse}
            render={renderProps => (
                <button id="facebook-login-button" className="login-button" onClick={renderProps.onClick}>Facebook</button>
            )}
        />);

         if (!loginwithfacebookinitialized && cameFromNonHttpFacebookClick){
             loginwithfacebookinitialized = true;
             setTimeout(()=>{
                 document.getElementById("facebook-login-button").click();
             },1000)
         }

        return (
            <div className="login-page">
                <div id="login-header">
                   Log in to <b> P&#1465;o&#1462;ker&#1456;S&#1463;tats</b> using
                </div>
                <div>
                    <div>
                        {google}
                    </div>
                    <br/>
                    <div>
                        {facebook}
                    </div>
                </div>
                <div className="errorSection">
                    {this.state.error ? this.state.error : ''}
                </div>
            </div>
        );

    }
}

export default Login;

