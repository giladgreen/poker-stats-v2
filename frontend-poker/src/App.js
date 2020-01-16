import React, { Component } from 'react';
import createGroup from './actions/createGroup';
import updateGroup from './actions/updateGroup';
import deleteGroup from './actions/deleteGroup';

import Login from './components/Login';
import NewEventForm from './components/NewEventForm';
import GroupPage from './components/GroupPage';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuIcon from '@material-ui/icons/Menu';
import Loading from './containers/Loading';
import UserGroups from "./components/UserGroups";
import notificationHelper from "./notificationHelper";

const {IsSubscribed, IsPushSupported, subscribeUser,unsubscribeUser} = notificationHelper;

function setupEventDates(event){
    event.startDate = new Date(event.startDate);

    event.endDate = new Date(event.endDate);
    event.lastConfirmationDate = new Date(event.lastConfirmationDate);
    event.participants.forEach(participant=>{
        participant.confirmationDate = new Date( participant.confirmationDate);
    });
    event.participants.sort((a,b)=> a.confirmationDate < b.confirmationDate ? -1 : 1);
    return event;
}

class App extends Component {

    constructor() {
        super();

        this.state = { showMenu:false, pushSupported:IsPushSupported(), subscribed:IsSubscribed(), showGroupCreationForm: false, showGroupEditForm:null, loading: false, isAuthenticated: false, user: null, groups:null, provider:'', error:null, token:null, showGroupPage: null};
    }

    onNotificationButtonClick = async() =>{
        try {
            if (this.state.subscribed) {
                await unsubscribeUser(this.state.provider, this.state.token);
                this.setState({subscribed:false, pushSupported: true, showMenu: false})
            } else {
                await subscribeUser(this.state.provider, this.state.token);
                this.setState({subscribed:true, pushSupported: true, showMenu: false})
            }
        } catch (e) {
            console.log('onNotificationButtonClick Error', e)
        }

    };

    logout = () => {
        localStorage.removeItem('authData');
        this.setState({isAuthenticated: false, user: null, events:[], error:null, showMenu:false})
        window.location.replace('https://im-in.herokuapp.com');

    };

    createGroup = () => {
        this.setState({ showGroupCreationForm: true, error:null, showMenu: false})
    };

    onCancel = () => {
        this.setState({ showGroupCreationForm: false, error:null, showGroupEditForm:null, showGroupPage:null})
    };

    onFailure = (error) => {
        console.error('App onFailure', error);
        this.setState({error })
    };

    backToMainPage = () => {
        this.setState({group:null, players:null,games:null,error:null});
    };

    onLogin = async ({userContext, provider, token, groups}) => {
        this.setState({user: userContext, groups, loading: false, isAuthenticated: true, error:null, provider, token})
    };

    getHeader = ()=>{

        {this.state.pushSupported && <div id="notification">
            <span onClick={this.onNotificationButtonClick}><u> <b>{ this.state.subscribed ? 'disable':'enable'} notifications</b></u></span>
        </div>}

        const menuItems = [];
        if (this.state.pushSupported){
            menuItems.push( <MenuItem key="menuItem1" onClick={this.onNotificationButtonClick}>{ this.state.subscribed ? 'disable':'enable'} notifications</MenuItem> )
        }
        menuItems.push(<MenuItem key="menuItem2" onClick={this.createGroup}>Create New Group</MenuItem>)
        menuItems.push(<MenuItem key="menuItem3" onClick={this.logout}>Logout</MenuItem>)


        const menuIcon =  <MenuIcon id="menuIcon" fontSize="inherit" className='menu-icon' onClick={()=>this.setState({showMenu: !this.state.showMenu})} />;
        return  <div id="app-header">
            {menuIcon}

            {this.state.showMenu &&
            <Menu
                id="simple-menu"
                anchorEl={ ()=>document.getElementById("menuIcon") }
                keepMounted
                open={true}
                onClose={()=>this.setState({showMenu: !this.state.showMenu})}
            >

                {menuItems}

            </Menu>}



            <span id="app-header-text">PokerStats</span>
        </div>
    };

    publish = (event)=>{
        this.setState({ showGroupCreationForm: false, error:null, showGroupEditForm:null, loading: true});
        setTimeout(async ()=>{
            try {
                const newEvent = await createGroup(event, this.state.provider, this.state.token);
                setupEventDates(newEvent);
                const events = [newEvent, ...this.state.events];
                this.setState({ loading: false, events, showGroupPage: newEvent});
                window.location.replace(`https://im-in.herokuapp.com?eventId=${newEvent.id}`);
                window.location.href = `https://im-in.herokuapp.com?eventId=${newEvent.id}`;

            } catch (error) {
                this.setState({ loading: false, error});
            }
        },0)
    };


    update = (group)=>{
        this.setState({ showGroupCreationForm: false, error:null, showGroupEditForm:null, loading: true});
        setTimeout(async ()=>{
            try {
                const updatedEvent = await updateGroup(group, this.state.provider, this.state.token);
                setupEventDates(updatedEvent);
                const events = this.state.events.map(event=>{
                    if (event.id === updatedEvent.id){
                        return updatedEvent;
                    } else{
                        return event;
                    }
                });
                this.setState({ loading: false, events});

            } catch (error) {
                this.setState({ loading: false, error});
            }
        },0)

    };

    delete = (groupId)=>{
        if (confirm("Are you sure?")){
            this.setState({ showGroupCreationForm: false, error:null, showGroupEditForm:null, loading: true});
            setTimeout(async ()=>{
                try {
                    const deletedEventId = await deleteGroup(groupId, this.state.provider, this.state.token);
                    const events = this.state.events.filter(event=>(event.id !== deletedEventId));
                    this.setState({ loading: false, events});

                } catch (error) {
                    console.error('error calling delete',error)
                    this.setState({ loading: false, error});
                }
            },0)
        }
    };

    goHome = () =>{
        this.setState({ showMenu:false, showGroupCreationForm: false, showGroupEditForm:null, loading: false, showGroupPage: null});
    };

    editGroup = (group) =>{
        this.setState({ showGroupCreationForm: null, showGroupEditForm:group, loading: false, showGroupPage: null})
    };

    showGroup = (group) =>{
        //TODO
    };

    render() {

        const {loading, isAuthenticated, groups, showGroupCreationForm, showGroupEditForm, showGroupPage}  = this.state;
        if (loading){
            return  <Loading/>;
        }
        if (!isAuthenticated){
            return  <Login onLogin={this.onLogin} />;
        }

        if (showGroupPage){
            return <GroupPage goHome={this.goHome} group={showGroupPage} user={this.state.user || {}}  edit={this.editGroup}  logout={this.logout}/>
        }
        if (showGroupEditForm){
            return  <NewEventForm onCancel={this.onCancel} update={this.update} delete={this.delete} event={showGroupEditForm}  logout={this.logout}/>;
        }
        if (showGroupCreationForm){
            return  <NewEventForm onCancel={this.onCancel} publish={this.publish} logout={this.logout}/>;
        }

        const header = this.getHeader();
        return (
            <div className="App container">
                <div className="errorSection">
                    {this.state.error}
                </div>
                {header}


                <div className="MainSection">

                    <UserGroups createGroup={this.createGroup} groups={groups} showGroup={this.showGroup}/>

                </div>

            </div>);

    }
}

export default App;

