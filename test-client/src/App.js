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

const keys = {37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault)
        e.preventDefault();
    e.returnValue = false;
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

function disableScroll() {
    if (window.addEventListener) // older FF
        window.addEventListener('DOMMouseScroll', preventDefault, false);
    document.addEventListener('wheel', preventDefault, {passive: false}); // Disable scrolling in Chrome
    window.onwheel = preventDefault; // modern standard
    window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
    window.ontouchmove  = preventDefault; // mobile
    document.onkeydown  = preventDefaultForScrollKeys;
}

function enableScroll() {
    if (window.removeEventListener)
        window.removeEventListener('DOMMouseScroll', preventDefault, false);
    document.removeEventListener('wheel', preventDefault, {passive: false}); // Enable scrolling in Chrome
    window.onmousewheel = document.onmousewheel = null;
    window.onwheel = null;
    window.ontouchmove = null;
}

function deleteAllCookies() {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

class App extends Component {

    constructor() {
        super();
        this.state = { loading: false, isAuthenticated: false, user: null, groups:[], group:null, provider:'', error:null, token:null};
    }

    logout = () => {
        localStorage.removeItem('authData');
        this.setState({isAuthenticated: false, user: null, groups:[],group:null, error:null})
        try {
            sessionStorage.clear();
            localStorage.clear();
            deleteAllCookies();
        } catch (e) {
            console.log('ERROR',e)
        }

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

    updateGroupNameAndDescription = ({name, description}) => {
        const {group}  = this.state;
        const updatedGroup = {...group};
        updatedGroup.name = name;
        updatedGroup.description = description;
        this.setState({group: updatedGroup});
    };

    render() {
        const {loading, isAuthenticated, group}  = this.state;
        if (loading){
            return  <Loading/>;
        }
        if (!isAuthenticated){
            return  <Login onLogin={this.onLogin} />;
        }

        const mainSection = group ?
            <Group  groups={this.state.groups} updateGroupNameAndDescription={this.updateGroupNameAndDescription} disableScroll={disableScroll} enableScroll={enableScroll}  user={this.state.user} group={this.state.group} provider={this.state.provider} token={this.state.token} backToMainPage={this.backToMainPage} updateGroup={this.updateGroup} updateGroups={this.updateGroups} onFailure={this.onFailure} /> :
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

