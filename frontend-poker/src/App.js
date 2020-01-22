import React, { Component } from 'react';
import createGroup from './actions/createGroup';
import updateGroup from './actions/updateGroup';
import deleteGroup from './actions/deleteGroup';
import requestInvitation from './actions/requestInvitation';
import getGroupData from './actions/getGroupData';

import Login from './components/Login';
import NewGroupForm from './components/NewGroupForm';
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

        this.state = { showMenu:false, pushSupported:IsPushSupported(), subscribed:IsSubscribed(), showGroupCreationForm: false,showCreateGameForm:false,showCreatePlayerForm:false, showGroupEditForm: null, loading: false, isAuthenticated: false, user: null, groups:null, provider:'', error:null, token:null, showGroupPage: null};
    }

    onNotificationButtonClick = async() =>{
        try {
            console.log('onNotificationButtonClick this.state.subscribed', this.state.subscribed)
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
        console.log('onCancel')
        this.setState({ showGroupCreationForm: false,showGroupEditForm:null, error:null, showMenu: false})
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



            <span id="app-header-text">Groups</span>
        </div>
    };

    updateExistingGroup = (group) =>{
        this.setState({ loading: true, error: null});
        setTimeout(async ()=>{
            try {
                const newGroup = await updateGroup(group.id, group, this.state.provider, this.state.token);
                const groups = [newGroup, ...this.state.groups];
                this.setState({ loading: false, groups,  showGroupEditForm:null, showGroupCreationForm:null});
            } catch (error) {
                this.setState({ loading: false, error,  showGroupEditForm:null, showGroupCreationForm:null});
            }
        },0)
    }
    createNewGroup = (group) =>{
        setTimeout(async ()=>{
            try {
                const newGroup = await createGroup(group, this.state.provider, this.state.token);
                const groups = [newGroup, ...this.state.groups];
                this.setState({ loading: false, groups});
            } catch (error) {
                this.setState({ loading: false, error});
            }
        },0)
    }

    saveGroup = (group)=>{
        this.setState({ showGroupCreationForm: false, error:null, loading: true});
        if (group.id){
            this.updateExistingGroup(group)
        } else{
            this.createNewGroup(group)
        }


    };

    delGroup = (groupId)=>{
        if (confirm("Are you sure?")){
            this.setState({ error:null, loading: true});
            setTimeout(async ()=>{
                try {
                    const deletedGroupId = await deleteGroup(groupId, this.state.provider, this.state.token);
                    const groups = this.state.groups.filter(group=>(group.id !== deletedGroupId));
                    this.setState({ loading: false, groups,  showGroupEditForm:null, showGroupCreationForm:null });

                } catch (error) {
                    console.error('error calling delete',error)
                    this.setState({ loading: false, error,  showGroupEditForm:null, showGroupCreationForm:null});
                }
            },0)
        }else{
            this.setState({ showGroupEditForm:null, showGroupCreationForm:null });
        }
    };

    goHome = () =>{
        this.setState({ showMenu:false, showGroupCreationForm: false, loading: false, showGroupPage: null, showGroupEditForm:null});
    };

    showGroup = async (group) =>{
        if (group.userInGroup){
            this.setState({showMenu:false, loading:true});
            getGroupData(group, this.state.provider, this.state.token).then((g)=>{

                g.players = g.players.map(player=>{
                    let balance = 0;
                    const playersGames = g.games.filter(game=> {
                        const play = game.playersData.find(data => data.playerId === player.id);
                        if (play){
                            balance += play.cashOut;
                            balance -= play.buyIn;
                        }
                        return play;
                    });
                    const gamesCount = playersGames.length;

                    return {...player, gamesCount, balance};
                }).sort((a,b)=>  a.gamesCount === b.gamesCount ? ((a.balance > b.balance ? -1 : 1)) : (a.gamesCount > b.gamesCount ? -1 : 1));


                this.setState({ showGroupPage: g, loading:false});
            }).catch((e)=>{
                this.setState({ error: e, loading:false});
            })
        } else{
            if (group.invitationRequested){
                this.setState({showMenu:false});
                alert('invitation already requested. you will get an answer in your email.');
            }else if (confirm("You sre not in this group. would you like to ask for an invitation?")){
               this.setState({loading:true});
               requestInvitation(group.id, this.state.provider, this.state.token).then(()=>{
                   this.setState({loading:false});
               })
            } else {
                this.setState({showMenu:false});
            }
        }

    };

    editGroup = (group) =>{
        console.log('editGroup')
        this.setState({ showMenu:false, showGroupEditForm: group});
    };

    createGame = (group, game) =>{
        this.setState({ showMenu:false, showCreateGameForm: { group, game }});
    };
    createPlayer = (group, player) =>{
        this.setState({ showMenu:false, showCreatePlayerForm: { group, player }});
    };

    updatePlayerData = (player)=>{
        console.log('app update player', player);
        const showGroupPage = {...this.state.showGroupPage};
        let exist = false;
        showGroupPage.players = showGroupPage.players.map(p=>{
            if (p.id !== player.id) return p;
            exist = true;
            return player;
        });
        if (!exist){
            showGroupPage.players.push(player)
        }
        this.setState({showGroupPage})
    }

    updatePlayerRemoved = (playerId)=>{
        console.log('app removed player', playerId);
        const showGroupPage = {...this.state.showGroupPage};
        showGroupPage.players = showGroupPage.players.filter(p=> p.id !== playerId);

        this.setState({showGroupPage})
    }

    updateGame = (game)=>{
        console.log('app game update', game);
        const showGroupPage = {...this.state.showGroupPage};
        let exist = false;
        showGroupPage.games = showGroupPage.games.map(g=>{
            if (g.id !== game.id) return g;
            exist = true;
            return game;
        });
        if (!exist){
            showGroupPage.games.push(game)
        }
        this.setState({showGroupPage})
    }

    render() {

        const {loading, isAuthenticated, groups, showGroupCreationForm, showGroupPage, showGroupEditForm}  = this.state;
        if (loading){
            return  <Loading/>;
        }
        if (!isAuthenticated){
            return  <Login onLogin={this.onLogin} />;
        }

        if (showGroupEditForm){
            return <NewGroupForm onCancel={this.onCancel} saveGroup={this.saveGroup} deleteGroup={this.delGroup} logout={this.logout} group={showGroupEditForm} isUpdate={true}/>;
        }

        if (showGroupPage){
            return <GroupPage goHome={this.goHome} group={showGroupPage} user={this.state.user} updatePlayerRemoved={this.updatePlayerRemoved} updateGame={this.updateGame} updatePlayerData={this.updatePlayerData}  editGroup={this.editGroup} deleteGroup={this.delGroup}  provider={this.state.provider} token={ this.state.token} logout={this.logout}/>
        }

        if (showGroupCreationForm){
            return  <NewGroupForm onCancel={this.onCancel} saveGroup={this.saveGroup} logout={this.logout}/>;
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

