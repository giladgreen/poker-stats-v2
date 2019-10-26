import React, { Component } from 'react';
import request from 'request';
import FacebookLogin from 'react-facebook-login';
import { GoogleLogin } from 'react-google-login';
import config from './config.json';
const pokerStatsGroupsUrlPrefix = 'http://localhost:5000/api/v2';
//const pokerStatsGroupsUrlPrefix = 'https://poker-stats.herokuapp.com/api/v2';

class App extends Component {

    constructor() {
        super();
        this.state = { connecting: false, isAuthenticated: false, user: null, token: null, groups:[], newGroupName:'', provider:''};
    }

    logout = () => {
        this.setState({isAuthenticated: false, token: null, user: null})
    };
    setProvider = (provider) => {
        this.setState({provider})
    };

    onFailure = (error) => {
        alert(error);
    };


    performLogin = (name, token) => {
        const options = {
            url: `${pokerStatsGroupsUrlPrefix}/groups/`,
            headers:{
                provider: name,
                "x-auth-token": token
            }
        };

        request(options, (error, response, body) =>{
            console.log('body', JSON.parse(body));
            if (response && response.headers && response.headers['x-user-context']){
                const userContextString = response.headers['x-user-context'];
                const userContext = JSON.parse(decodeURI(userContextString));
                console.log('results: body.results',  body.results);
                this.setState({connecting:false, isAuthenticated: true, user: userContext, groups: JSON.parse(body).results});
            }
        });
    }
    LoginResponse = (r, name) => {
        this.setState({connecting:true, isAuthenticated: true, token: r.accessToken});

        this.performLogin(name, r.accessToken);


    };
    facebookResponse = (response) => {
        this.setProvider('facebook');
        return this.LoginResponse(response, 'facebook');
    };

    googleResponse = (response) => {
        this.setProvider('google');
        return this.LoginResponse(response, 'google');
    };

    getLoginPage = () => {
        return (
            <div className="App">
                you are not connected.<br/><br/>
                <div>connect using:<br/>
                    <FacebookLogin
                        appId={config.FACEBOOK_APP_ID}
                        autoLoad={false}
                        fields="name,email,picture"
                        callback={this.facebookResponse} />OR
                    <GoogleLogin
                        clientId={config.GOOGLE_CLIENT_ID}
                        buttonText="Login"
                        onSuccess={this.googleResponse}
                        onFailure={this.onFailure}
                    />
                </div>
            </div>
        );
    };

    getLoaderPage = () => {
        return (
            <div className="App">
                Connecting...
            </div>
        );
    };

    getLogoutButton = () => {
      return (
          <button onClick={this.logout} className="button">
              Log out
          </button>
     );
    };


    getUserInfo = () => {
      const logoutButton = this.getLogoutButton();
      return  ( <div>
          <div>
              hey {this.state.user.firstName} {this.state.user.familyName}, you are connected! {logoutButton}<br/>
              email:  {this.state.user.email}<br/>

                  <img src={this.state.user.imageUrl}  className="user-image" />
              <br/>
              <br/>
          </div>
          <div>
              x-auth-token: {this.state.token}
              <br/>
              <br/>
          </div>
      </div>);
    };


    createNewGroup = () =>{
        console.log('createNewGroup', this.state.newGroupName);

        const options = {
            method:'POST',
            url: `${pokerStatsGroupsUrlPrefix}/groups/`,
            body:JSON.stringify({name:this.state.newGroupName}),
            headers:{
                provider: this.state.provider,
                "x-auth-token": this.state.token,
                "Content-Type":'application/json'
            }
        };

        request(options, (error, response, body) =>{
            if (error){
                console.log('error', error);
            }
            this.performLogin(this.state.provider, this.state.token);
        });
    };

    onGetInventionsRequestsClicked = (groupId) =>{
        console.log('onGetInventionsRequestsClicked groupid:',groupId);
        const body = JSON.stringify({
            groupId
        });
        console.log('onGetInventionsRequestsClicked body:',body);

        const options = {
            method: 'POST',
            url: `${pokerStatsGroupsUrlPrefix}/inventions-requests/`,
            headers:{
                provider: 'google',
                "x-auth-token": this.state.token,
                "Content-Type":'application/json'
            },
            body
        };
        console.log('onGetInventionsRequestsClicked options:',options);
        request(options, (error, response, body) =>{
            console.log('res error', error);
            console.log('res response', response);
            console.log('res body', body);

        });
    };

    handleNewGameNameChange = (event) =>{
        this.setState({newGroupName: event.target.value});
    }

    getNewGroupSection = () => {
        return (<div>
            Create a new group.  <br/><br/>
            group name: <input type="text" id="newGroupName" value={this.state.newGroupName} onChange={this.handleNewGameNameChange}/>
            <br/>
            <button className="button" onClick={this.createNewGroup}> Create </button>
            <br/><br/> <br/><br/>

        </div>);
    }
    getGroupsInfo = () => {

        const {groups} = this.state;
        if (!groups || groups.length === 0){
            return (<div>
                <b><u>No groups. </u></b> <br/><br/> <br/><br/>
                {this.getNewGroupSection()}
            </div>);
        }
        const userGroups = groups.filter(group => group.userInGroup).map(group =>{
            return (<div key={`userInGroup_${group.id}`}>
                        - {group.name}  {group.isAdmin ? ' (you are a group admin.)' : ''}
                        <br/><br/>
                    </div>);
        });

        const nonUserGroups = groups.filter(group => !group.userInGroup).map(group =>{
            return (<div key={`userNotInGroup_${group.id}`}>
                    -  {group.name}  <button className="button" onClick={()=> this.onGetInventionsRequestsClicked(group.id)}> ask invitation to this group</button>
                    <br/><br/>
                </div>);
        });
        return (
            <div>
                {this.getNewGroupSection()}
                <div>
                    <b><u> you belong to {userGroups.length} groups:</u></b>
                    <br/><br/>
                    {userGroups}
                    <br/><br/><br/><br/>
                </div>
                <div>
                    <b><u> there are {nonUserGroups.length} groups you do not belong to:</u></b>
                    <br/><br/>
                    {nonUserGroups}
                    <br/><br/><br/><br/>
                </div>
            </div> );



    };

    render() {
        if (this.state.connecting){
            return this.getLoaderPage();
        }
        if (!this.state.isAuthenticated){
            return this.getLoginPage();
        }



        const userInfo = this.getUserInfo() ;
        const groupsInfo = this.getGroupsInfo();

        return (
            <div className="App">
                <div>
                    {userInfo}
                </div>
                <div>
                    {groupsInfo}
                </div>
            </div>
        );
    }
}

export default App;
