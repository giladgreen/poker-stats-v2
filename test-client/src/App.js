import React, { Component } from 'react';

import Groups from './components/Groups';
import Group from './components/Group';
import Login from './components/Login';
import Loading from './containers/Loading';
import Header from './containers/Header';

String.prototype.datePickerToDate = function() {
    const stringValue =  this;//2017-11-23
    const day = stringValue.substr(8,2);
    const month = stringValue.substr(5,2);
    const year = stringValue.substr(0,4);
    return new Date(year, month-1, day, 12, 0, 0);
};


Date.prototype.AsDatePicker = function() {
    return this.toISOString().substr(0,10);
};

Date.prototype.AsGameName = function() {
    const stringValue = this.toISOString().substr(0,10);
    const day = stringValue.substr(8,2);
    const month = stringValue.substr(5,2);
    const year = stringValue.substr(0,4);
    return `${day}/${month}/${year}`;
};


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

    updateGroup = async (group) => {
        this.setState({group,user:group.userContext, error:null});
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

    render() {

        const {loading, isAuthenticated, group}  = this.state;
        if (loading){
            return  <Loading/>;
        }
        if (!isAuthenticated){
            return  <Login onFailure={this.onFailure} onLogin={this.onLogin} />;
        }

        const mainSection = group ?
            <Group  user={this.state.user} group={this.state.group} provider={this.state.provider} token={this.state.token} backToMainPage={this.backToMainPage} updateGroup={this.updateGroup} onFailure={this.onFailure} /> :
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

