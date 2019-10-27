import { URL_PREFIX } from '../../config.js';
import React, { Component } from 'react';
import request from 'request';
import FacebookLogin from 'react-facebook-login';
import { GoogleLogin } from 'react-google-login';
import config from './config.json';

const pokerStatsGroupsUrlPrefix = URL_PREFIX;//'http://localhost:5000/api/v2';
//const pokerStatsGroupsUrlPrefix = 'https://poker-stats.herokuapp.com/api/v2';

class App extends Component {

    constructor() {
        super();
        console.log('pokerStatsGroupsUrlPrefix',pokerStatsGroupsUrlPrefix)
        this.state = { loading: false, isAuthenticated: false, user: null, token: null, groups:[],group:null, newGroupName:'', provider:''};
    }

    logout = () => {
        this.setState({isAuthenticated: false, token: null, user: null, groups:[],group:null})
    };


    backToMainPage = () => {
        this.setState({group:null})
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
            if (response && response.headers && response.headers['x-user-context']){
                const userContextString = response.headers['x-user-context'];
                const userContext = JSON.parse(decodeURI(userContextString));
                console.log('results: body.results',  body.results);
                this.setState({loading:false, isAuthenticated: true, user: userContext, groups: JSON.parse(body).results});
            }
        });
    }
    LoginResponse = (r, name) => {
        this.setState({loading:true, isAuthenticated: true, token: r.accessToken});

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
                please wait...
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
                  <img alt="" src={this.state.user.imageUrl}  className="user-image" />
              <br/>
              <br/>
          </div>
          <div>
              x-auth-token: {this.state.token}
              <br/>
              <br/>
          </div>
          <div>
              <hr/>
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
    onGroupClicked = (group) => {
        this.setState({group, loading:true});

        const playersOptions = {
            method: 'GET',
            url: `${pokerStatsGroupsUrlPrefix}/groups/${group.id}/players/`,
            headers:{
                provider: 'google',
                "x-auth-token": this.state.token,
                "Content-Type":'application/json'
            }
        };
        const gamesOptions = {
            method: 'GET',
            url: `${pokerStatsGroupsUrlPrefix}/groups/${group.id}/games/`,
            headers:{
                provider: 'google',
                "x-auth-token": this.state.token,
                "Content-Type":'application/json'
            }
        };
        let players;
        let games;
        request(playersOptions, (error, response, body) =>{
            if (error){
                console.log('playersOptions error',error);
            }

            players = JSON.parse(body).results;
            console.log('players',players)

            const group = { ...this.state.group, players};
            this.setState({group, loading:!players || !games});
        });
        request(gamesOptions, (error, response, body) =>{
            if (error){
                console.log('gamesOptions error',error);
            }
            games = JSON.parse(body).results;
            console.log('games',games)
            const group = { ...this.state.group, games};
            this.setState({group, loading:!players || !games});
        });
    };

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
                        - {group.name}  {group.isAdmin ? ' (you are a group admin.)' : ''}   <button className="button" onClick={()=> this.onGroupClicked(group)}> see group info</button>
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
                    <br/><br/>
                </div>
                <div>
                    <hr/>
                </div>
                <div>
                    <b><u> there are {nonUserGroups.length} groups you do not belong to:</u></b>
                    <br/><br/>
                    {nonUserGroups}
                    <br/><br/><br/><br/>
                </div>
            </div> );



    };

    getGroupPage = () => {
        const {group} = this.state;
        const userInfo = this.getUserInfo() ;
        return (
            <div className="App">
                <div>
                    {userInfo}
                </div>
                <div>
                 <button className="button" onClick={()=> this.backToMainPage(group.id)}> back to all groups</button>

            </div>
                <div>

                    <h1> Group: {group.name}</h1>
                </div>
                <div>
                    <h2>  {group.players.length} players</h2>
                </div>
                <div>
                    <hr/>
                </div>
                <div>
                    <h2>  {group.games.length} games</h2>
                </div>
            </div>
        );

    }
    render() {
        if (this.state.loading){
            return this.getLoaderPage();
        }
        if (!this.state.isAuthenticated){
            return this.getLoginPage();
        }

        if (this.state.group){
            return this.getGroupPage();
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
