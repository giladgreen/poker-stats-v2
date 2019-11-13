import { FACEBOOK_APP_ID, GOOGLE_CLIENT_ID } from '../../../config';
import React, { Component } from 'react';
import FacebookLogin from 'react-facebook-login';
import { GoogleLogin } from 'react-google-login';
import login from '../actions/login';
const ONE_DAY = 1000 * 60 * 60 * 24;

class Login extends Component {

    performLogin = async (provider, token) => {
        try{
            const result = await login(provider, token);
            return this.props.onLogin(result);
        }catch(error){
            return this.props.onFailure(error);
        }
    };

    facebookResponse = (response) => {
        this.performLogin('facebook', response.accessToken);
    };

    googleResponse = (response) => {
        this.performLogin('google', response.accessToken);    };

    render() {
        const authData = localStorage.getItem('authData');
        if (authData){
            const {provider, token, issueDate } = JSON.parse(authData);
            const timePassed = (new Date()).getTime() - (new Date(issueDate)).getTime();
            if (timePassed > ONE_DAY){
                localStorage.removeItem('authData');
            } else{
                this.performLogin(provider, token);
                return <h1>logging in..</h1>;
            }
        }

        return (
            <div className="login-page">
                <div>
                    <h1>Log in to PokerStats!</h1>
                    <h2> Log in with:</h2>
                </div>
                <div>
                    <div>
                        <FacebookLogin
                            appId={FACEBOOK_APP_ID}
                            autoLoad={false}
                            fields="name,email,picture"
                            callback={this.facebookResponse} />
                    </div>
                    <br/>
                    <div>
                        <GoogleLogin
                            clientId={GOOGLE_CLIENT_ID}
                            buttonText="Login with Google"
                            onSuccess={this.googleResponse}
                            onFailure={this.props.onFailure}
                        />
                    </div>
                </div>
            </div>
        );

    }
}

export default Login;

