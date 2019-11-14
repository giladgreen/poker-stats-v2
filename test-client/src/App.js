import React, { Component } from 'react';

import Groups from './components/Groups';
import Group from './components/Group';
import Login from './components/Login';
import Loading from './containers/Loading';
import Header from './containers/Header';
import getGroupData from './actions/getGroupData';


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
        console.error('App onFailure', error)
        this.setState({error })
    };

    updateGroupInMem = async (group) => {
        this.setState({group,error:null});
    };
    updateGroup = async (group) => {
        try {
            const updatedGroup = await getGroupData(group,this.state.provider, this.state.token)
            this.setState({group: updatedGroup,error:null});
        }catch(error){
            console.error('updateGroup error', error);
            this.setState({error});
        }
    };

    updateGroups = (groups) => {
        this.setState({groups,error:null});
    };

    backToMainPage = () => {
        this.setState({group:null, players:null,games:null,error:null});
    };

    onLogin = ({userContext, provider, token, groups}) => {
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
            <Group group={this.state.group} provider={this.state.provider} token={this.state.token} backToMainPage={this.backToMainPage} updateGroup={this.updateGroupInMem} onFailure={this.onFailure} /> :
            <Groups groups={this.state.groups} provider={this.state.provider} token={this.state.token} updateGroup={this.updateGroup} onGroupClicked={this.onGroupClicked} onFailure={this.onFailure} updateGroups={this.updateGroups}/>;

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

