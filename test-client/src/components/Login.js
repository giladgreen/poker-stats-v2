import { FACEBOOK_APP_ID, GOOGLE_CLIENT_ID } from '../../../config';
import React, { Component } from 'react';
import FacebookLogin from 'react-facebook-login';
import { GoogleLogin } from 'react-google-login';
import login from '../actions/login';
import Loader from "../containers/Loading";
const ONE_DAY = 1000 * 60 * 60 * 24;

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
            buttonText="Login with Google"
            onSuccess={this.googleResponse}
            onFailure={this.onFailure}
        />);
        const facebook = window.location.protocol === 'http:' ? <span>(use the <a href="https://www.poker-stats.com">https version </a> to log in with facebook)</span> : ( <FacebookLogin
            appId={FACEBOOK_APP_ID}
            autoLoad={false}
            fields="name,email,picture"
            callback={this.facebookResponse} />);
        return (
            <div className="login-page">
                <div>
                    <h1>Log in to PokerStats!</h1>
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

