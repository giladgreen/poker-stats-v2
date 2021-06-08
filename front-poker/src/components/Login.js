
import React, { Component } from 'react';

import FacebookLogin from  'react-facebook-login/dist/facebook-login-render-props';
import { GoogleLogin } from 'react-google-login';

import login from '../actions/login';

import Loader from "../containers/Loading";
import { version } from '../../package.json';

const ONE_DAY = 1000 * 60 * 60 * 24;
const GOOGLE_CLIENT_ID= '819855379342-js3mkfftkk25qopes38dcbhr4oorup45.apps.googleusercontent.com';
const FACEBOOK_APP_ID= '2487592561563671';
const protocol = window.location.protocol;
const isHttps = protocol==='https:';
const showFB =  isHttps;
const tryConnectToFB =  isHttps && !!window.location.search && window.location.search.includes('fb=true') ;
const httpsUrl = 'https://www.poker-stats.com?fb=true';
class Login extends Component {

    constructor() {
        super();
        this.state = { error: null };
        if (tryConnectToFB) {
            setTimeout(()=>{
                try {
                    const fbButton = document.getElementById("fbButton");
                    if (fbButton) {
                        fbButton.click(); // Click on the checkbox
                    }
                } catch (e) {
                    console.log('e',e)
                }

            },1000)
        }
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


        } catch(error) {
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
        const google = (<GoogleLogin

            clientId={GOOGLE_CLIENT_ID}
            onSuccess={this.googleResponse}
            onFailure={this.onFailure}
            render={renderProps => (
                <div className="login-button login-button-google" onClick={renderProps.onClick}> LOGIN WITH GOOGLE</div>
            )}
        />);

         const facebook = showFB ? (<FacebookLogin
            disableMobileRedirect={true}
            appId={FACEBOOK_APP_ID}
            autoLoad={false}
            fields="name,email,picture"
            callback={this.facebookResponse}
            render={renderProps => (
                <div id="fbButton" className="login-button login-button-fb" onClick={renderProps.onClick}> LOGIN WITH FACEBOOK</div>
            )}
         />) :  <div className="login-button login-button-fb" onClick={()=>{ window.location = httpsUrl}}> LOGIN WITH FACEBOOK</div>;

        return (
            <div id="login-page">
                <div id="version">
                    version: {version}
                </div>
                <div>
                    <img id="sheep-img" src="sheep.png" alt='sheep'/>
                </div>

                <div>
                    <img id="pokerStatsLogo" src="pokerStatsLogo.png" alt='Chips'/>
                </div>

                <div>
                    <img id="chips-img" src="https://res.cloudinary.com/www-poker-stats-com/image/upload/v1618731943/Casino-Poker-Chips-croped.png" alt='Chips'/>

                </div>


                {google}
                {facebook}
                <div id="loginErrorSection">
                    {this.state.error ? this.state.error : ''}
                </div>


            </div>
        );

    }
}

export default Login;

