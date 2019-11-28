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

    performLogin = async (provider, token) => {
        try{
            const result = await login(provider, token);
            const authData = localStorage.getItem('authData');
            const issueDate  = authData ? JSON.parse(authData).issueDate : new Date();

            localStorage.setItem('authData', JSON.stringify({provider, token, issueDate }));
            this.setState({ error: null });
            return this.props.onLogin(result);
        }catch(error){
            localStorage.removeItem('authData');
            return this.onFailure(error);
        }
    };

    facebookResponse = (response) => {
        if (response.accessToken){
            this.performLogin('facebook', response.accessToken);
        }else{
            this.onFailure('login failed')
        }

    };

    googleResponse = (response) => {
        if (response.accessToken){
            this.performLogin('google', response.accessToken);
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
                this.performLogin(provider, token);
                return <Loader />;
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
                            onFailure={this.onFailure}
                        />
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

