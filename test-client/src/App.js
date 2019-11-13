import { URL_PREFIX } from '../../config.js';
import React, { Component } from 'react';
import request from 'request';

import Groups from './components/Groups';
import Login from './components/Login';
import Loading from './containers/Loading';
import Header from './containers/Header';

class App extends Component {


    constructor() {
        super();
        this.state = { loading: false, isAuthenticated: false, user: null, groups:[], group:null, provider:'', error:null, token:null};
    }

    logout = () => {
        localStorage.removeItem('authData');
        this.setState({isAuthenticated: false, user: null, groups:[],group:null, error:null})
    };


    onFailure = (error) => {
        console.log('App onFailure', error)
        this.setState({error })
    };

    createNewGroup = (newGroupName) =>{

        const options = {
            method:'POST',
            url: `${URL_PREFIX}/groups/`,
            body:JSON.stringify({name:newGroupName}),
            headers:{
                provider: this.state.provider,
                "x-auth-token": this.state.token,
                "Content-Type":'application/json'
            }
        };

        request(options, (error, response, body) =>{

            if (response.statusCode>=400){
                const bodyObj = JSON.parse(body) ;
                console.log('error', bodyObj);
                this.setState({error: bodyObj.title});
            }else{
                this.setState({ loading: false, isAuthenticated: false});
            }
        });
    };

    onGroupClicked = (group) => {
        this.setState({group, loading:true, error:null});

        const playersOptions = {
            method: 'GET',
            url: `${URL_PREFIX}/groups/${group.id}/players/`,
            headers:{
                provider: this.state.provider,
                "x-auth-token": this.state.token,
                "Content-Type":'application/json'
            }
        };
        const gamesOptions = {
            method: 'GET',
            url: `${URL_PREFIX}/groups/${group.id}/games/`,
            headers:{
                provider: this.state.provider,
                "x-auth-token": this.state.token,
                "Content-Type":'application/json'
            }
        };
        let players;
        let games;
        request(playersOptions, (error, response, body) =>{
            if (response.statusCode>=400){
                const bodyObj = JSON.parse(body) ;
                console.log('error', bodyObj);
                this.setState({error: bodyObj.title});
            }else{
                players = JSON.parse(body).results;
                const group = { ...this.state.group, players};
                this.setState({group, loading:!players || !games, error:null});
            }


        });
        request(gamesOptions, (error, response, body) =>{
            if (response.statusCode>=400){
                const bodyObj = JSON.parse(body) ;
                console.log('error', bodyObj);
                this.setState({error: bodyObj.title});
            }else{
                games = JSON.parse(body).results;
                const group = { ...this.state.group, games};
                this.setState({group, loading:!players || !games, error:null});
            }

        });
    };

    updateGroups = (groups) => {
        this.setState({groups});
    };

    backToMainPage = () => {
        this.setState({group:null, players:null,games:null});
    };

    onLogin = ({userContext, provider, token, groups}) => {
        console.log('on login', 'userContext',userContext, 'groups',groups);
        this.setState({user: userContext, groups, loading: false, isAuthenticated: true, error:null, provider, token})
    };

    GroupPage = () => {
        const {group} = this.state;
        return (
            <div className="App">
                <div>
                    <button className="button" onClick={this.backToMainPage}> back to all groups</button>

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
            </div>);
    };

    render() {

        const {loading, isAuthenticated, group}  = this.state;
        if (loading){
            return  <Loading/>;
        }
        if (!isAuthenticated){
            return  <Login onFailure={this.onFailure} onLogin={this.onLogin} />;
        }

        const mainSection = group ?
            this.GroupPage() :
            <Groups groups={this.state.groups} createNewGroup={this.createNewGroup}  onGroupClicked={this.onGroupClicked} onFailure={this.onFailure} updateGroups={this.updateGroups}/>;


        return (
            <div className="App">
                <Header user={this.state.user} logout={this.logout}/>
                <div className="errorSection">
                    {this.state.error}
                </div>
                <div className="MainSection">
                    {mainSection}
                </div>
            </div>);

    }
}

export default App;

