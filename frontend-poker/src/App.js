/* eslint-disable no-lone-blocks */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable jsx-a11y/img-has-alt */
import React, { Component } from 'react';
import moment from 'moment';
import keepAlive from './actions/keepAlive';
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

const KEEP_ALIVE_INTERVAL = 1000 * 60 * 5;

// eslint-disable-next-line
Date.prototype.AsGameName = function() {
    const stringValue = this.toISOString().substr(0,10);
    const day = stringValue.substr(8,2);
    const month = stringValue.substr(5,2);
    const year = stringValue.substr(0,4);
    return `${day}/${month}/${year}`;
};

// eslint-disable-next-line
Date.prototype.AsExactTime = function() {
    return this.toISOString().substr(11,5);
};
// eslint-disable-next-line
String.prototype.AsGameName = function() {
    const date = new Date(this);
    return date.AsGameName()
};

// eslint-disable-next-line
String.prototype.AsExactTime = function(hours) {
    return moment(this).add(hours, 'hours').toDate().AsExactTime()
};


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
        window.location.replace('https://www.poker-stats.com');

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
        setInterval(keepAlive, KEEP_ALIVE_INTERVAL)
    };

    getHeader = ()=>{


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



            <span id="app-header-text"><img src="pokerStatsLogoWithSheep.png" className="sheep-logo"/> Groups</span>
        </div>
    };

    updateExistingGroup = (group) =>{
        this.setState({ loading: true, error: null});
        setImmediate(async ()=>{
            try {
                const newGroup = await updateGroup(group.id, group, this.state.provider, this.state.token);
                const groups = [newGroup, ...this.state.groups];
                this.setState({ loading: false, groups,  showGroupEditForm:null, showGroupCreationForm:null});
            } catch (error) {
                this.setState({ loading: false, error,  showGroupEditForm:null, showGroupCreationForm:null});
            }
        })
    }
    createNewGroup = (group) =>{
        setImmediate(async ()=>{
            try {
                const newGroup = await createGroup(group, this.state.provider, this.state.token);
                const groups = [newGroup, ...this.state.groups];
                this.setState({ loading: false, groups});
            } catch (error) {
                this.setState({ loading: false, error});
            }
        })
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
            setImmediate(async ()=>{
                try {
                    const deletedGroupId = await deleteGroup(groupId, this.state.provider, this.state.token);
                    const groups = this.state.groups.filter(group=>(group.id !== deletedGroupId));
                    this.setState({ loading: false, groups,  showGroupEditForm:null, showGroupCreationForm:null });

                } catch (error) {
                    console.error('error calling delete',error)
                    this.setState({ loading: false, error,  showGroupEditForm:null, showGroupCreationForm:null});
                }
            })
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

        const showGroupPage = {...this.state.showGroupPage};
        let exist = false;
        showGroupPage.games = showGroupPage.games.map(g=>{
            if (g.id !== game.id) return g;
            exist = true;
            if (typeof game.date === 'string'){
                game.date = new Date(game.date);
            }
            return game;
        });
        if (!exist){
            if (typeof game.date === 'string'){
                game.date = new Date(game.date);
            }
            showGroupPage.games.push(game)
        }
        this.setState({showGroupPage})
    }
    removeGame = (gameId)=>{
        console.log('app game remove', gameId);
        const showGroupPage = {...this.state.showGroupPage};
        showGroupPage.games = showGroupPage.games.filter(g=>{
            return (g.id !== gameId)
        });
        this.setState({showGroupPage})
    }

    updateImage = (image)=>{
        const showGroupPage = {...this.state.showGroupPage};
        let exist = false;
        showGroupPage.images = showGroupPage.images.map(im=>{
            if (im.id !== image.id) return im;
            exist = true;
            return im;
        });
        if (!exist){
            showGroupPage.images = [image, ...showGroupPage.images]
        }
        this.setState({showGroupPage})
    }
    removeImage = (imageId)=>{
        const showGroupPage = {...this.state.showGroupPage};
        showGroupPage.images = showGroupPage.images.filter(im=>{
            return (im.id !== imageId)
        });
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
            return <GroupPage goHome={this.goHome}
                              group={showGroupPage}
                              user={this.state.user}
                              updatePlayerRemoved={this.updatePlayerRemoved}
                              updateGame={this.updateGame}
                              updatePlayerData={this.updatePlayerData}
                              editGroup={this.editGroup}
                              deleteGroup={this.delGroup}
                              removeGame={this.removeGame}
                              updateImage={this.updateImage}
                              removeImage={this.removeImage}
                              provider={this.state.provider}
                              token={ this.state.token} logout={this.logout}/>
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

                    <UserGroups createGroup={this.createGroup} groups={groups} showGroup={this.showGroup}  />

                </div>

            </div>);

    }
}

export default App;

