import React, { Component } from 'react';
import 'react-input-range/lib/css/index.css';
import getGame from '../actions/getGame';
import createGame from '../actions/createGame';
import createPlayer from '../actions/createPlayer';
import deletePlayer from '../actions/deletePlayer';
import updatePlayer from '../actions/updatePlayer';
import updateGame from '../actions/updateGame';
import deleteGame from '../actions/deleteGame';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuIcon from '@material-ui/icons/Menu';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import GameData from './GameData';
import GameSummary from './GameSummary';
import PlayerSummary from './PlayerSummary';
import ImagesTab from './ImagesTab';
import ImageUploader from './ImageUploader';
import GamesTab from './GamesTab';
import CONSTS from '../CONSTS';

const { ANON_URL } = CONSTS;

const baseUrl = window.location.origin === 'http://localhost:3000' ? 'http://www.poker-stats.com' : window.location.origin;
const FULL_ANON_URL = `${baseUrl}/${ANON_URL}`;
class GroupPage extends Component {

    constructor(props) {
        super(props);
        this.imageIndex = 0;
        this.imagesCount = 7;
        this.backgroundImage = `url(${props.group.imageUrl ||  `poker.jpg`})`;
        this.clearGamesTabSelections = ()=>{};


        this.state = { tabKey: 'summary', existingPlayerId: null  }
    }

    logout = ()=>{
        this.setState({showMenu: false });
        this.props.logout();
    };

    goHome = ()=>{
        this.setState({showMenu: false });
        this.props.goHome();
    };

    onKeyChange = (tabKey)=>{
        this.clearGamesTabSelections();
        this.setState({tabKey });
    };

    showCreatePlayer = () =>{
        this.setState({ newPlayer: {  name: '', email: ''} });
    }

    showPlayerData = (player) =>{
        this.setState({ playerSummary: player })
    }

    onPlayerEditClick = (editPlayer) =>{
        this.setState({ editPlayer });
    }

    handleNewPlayerChange = (existingPlayerId)=> {
        this.setState({existingPlayerId});
    };

    showImageUploaderForm = ({ gameId })=>{
        this.setState({ imageUploaderData: { gameId }});
    }

    hideImageUploaderForm = ()=>{
        this.setState({ imageUploaderData: null});
    }

    /***/

    getHeader = ()=>{

        const { group } = this.props;
        const {isAdmin} = group;

        const menuItems = [];


        if (isAdmin){
            menuItems.push(<MenuItem key="menuItem1" onClick={()=>this.props.editGroup(group)}>Edit Group</MenuItem>);
        }

        menuItems.push(<MenuItem key="menuItem5" onClick={this.goHome}>Home</MenuItem>);
        menuItems.push(<MenuItem key="menuItem6" onClick={this.logout}>Logout</MenuItem>);

        return  <div id="app-header" >
            <MenuIcon id="menuIcon" fontSize="inherit" className='menu-icon' onClick={()=>this.setState({showMenu: !this.state.showMenu})} />

            {this.state.showMenu &&
            <Menu
                id="simple-menu"
                anchorEl={ ()=>document.getElementById("menuIcon") }
                keepMounted
                open={true}
                onClose={()=>this.setState({showMenu: !this.state.showMenu})} >

                {menuItems}

            </Menu>}



            <span id="app-header-text">Group Page</span>
        </div>
    };

    createNewPlayer = () => {
        const { group, provider, token } = this.props;
        const player = {
            name: this.state.newPlayer.name,
            email: this.state.newPlayer.email,
        }
        console.log('calling create player with body:', player);
        createPlayer(group.id, player, provider, token).then((player)=>{
            this.setState({ newPlayer: null, editPlayer: null,playerSummary:null});
            this.props.updatePlayerData(player);
        });
    }

    getNewGameSection = () => {
        const legal = this.state.newGame.date && this.state.newGame.date.length === 10;

        return (<div id="new-game-form">
                    <h2> Create a new game. </h2>
                    <div className="new-game-section">
                        Game date:
                        <input  className="left-margin" type="date" id="newGameDate" min="2010-01-01" max="2050-01-01" value={this.state.newGame.date} onChange={this.handleNewGameDateChange}/>
                    </div>
                    <div className="new-game-section">
                       description:
                        <input  type="text" id="newGameExtra" className="bordered-input left-margin left-pad" value={this.state.newGame.description} onChange={this.handleNewGameDescriptionChange}/>
                    </div>
                    <div className="new-game-section">

                      <button className="button left-margin"  onClick={()=>this.setState({newGame: null})}> Cancel </button>
                        <button className="button left-margin"  onClick={this.createNewGame} disabled={!legal}> Create </button>
                    </div>


                 </div>);
    };

    getNewPlayerSection = () => {
        const legal = this.state.newPlayer.name && this.state.newPlayer.name.length > 0;

        return (<div id="new-player-form">
                    <h2> Create a new player. </h2>

                    <div className="new-player-section">
                       name:
                        <input  type="text" id="newGameExtra" className="bordered-input left-margin left-pad" value={this.state.newPlayer.name} onChange={(event)=>{
                            const newPlayer = {...this.state.newPlayer};
                            newPlayer.name = event.target.value;
                            this.setState({newPlayer})
                        }}/>
                    </div>
                    <div className="new-player-section">
                       email:
                        <input  type="text" id="newGameExtra" className="bordered-input left-margin left-pad" value={this.state.newPlayer.email}onChange={(event)=>{
                            const newPlayer = {...this.state.newPlayer};
                            newPlayer.email = event.target.value;
                            this.setState({newPlayer})
                        }}/>
                    </div>
                    <div className="new-player-section">

                      <button className="button left-margin"  onClick={()=>this.setState({newPlayer: null})}> Cancel </button>
                        <button className="button left-margin"  onClick={this.createNewPlayer} disabled={!legal}> Create </button>
                    </div>


                 </div>);
    };

    onPlayerDeleteClick = async(playerId) =>{
        if (confirm("Are you sure?")){
            try{
                await deletePlayer(this.props.group.id, playerId, this.props.provider, this.props.token);
                this.props.updatePlayerRemoved(playerId);
                this.setState({playerSummary:null})
            }catch(error){
                console.error('deletePlayerById error',error);
            }
        }
    }

    getPlayerSummary = () =>{
        return <PlayerSummary
            player={this.state.playerSummary}
            group={this.props.group}
            back={()=>this.setState({playerSummary: null})}
            edit={()=>this.onPlayerEditClick(this.state.playerSummary)}
            delete={()=>this.onPlayerDeleteClick(this.state.playerSummary.id)}
        />
    }

    getGamesSummary = () =>{
        return <GameSummary
            game={this.state.gameSummary}
            group={this.props.group}
            back={()=>this.setState({editGame:null, gameSummary:null})}
            edit={()=>this.onGameEditClick(this.state.gameSummary)}
            delete={this.deleteSelectedGame}
        />;
    }

    saveEditedPlayer = () =>{
        const { group, provider, token } = this.props;
        const player = {
            id: this.state.editPlayer.id,
            name: this.state.editPlayer.name,
            email: this.state.editPlayer.email,
            imageUrl: this.state.editPlayer.imageUrl,
        }
        console.log('saveEditedPlayer player', player)
        updatePlayer(group.id, player.id, player, provider, token).then((p)=>{
            this.setState({ newPlayer: null, editPlayer: null,playerSummary:null});
            this.props.updatePlayerData(p);
        });
    }

    getPlayerEdit = () =>{
        return (
            <div className="playerEditForm">
                <div className="playerSummaryHeader">
                    <div>
                        name: {this.state.editPlayer.name}
                        <input  type="text" id="playerName" className="bordered-input left-margin left-pad" value={this.state.editPlayer.name} onChange={(event)=>{
                            const editPlayer = {...this.state.editPlayer};
                            editPlayer.name = event.target.value || '';
                            this.setState({editPlayer});
                        }}/>

                    </div>
                    <div>
                        email:
                        <input  type="text" id="playerEmail" className="bordered-input left-margin left-pad" value={this.state.editPlayer.email} onChange={(event)=>{
                            const editPlayer = {...this.state.editPlayer};
                            editPlayer.email = event.target.value || '';
                            this.setState({editPlayer});
                        }}/>
                    </div>
                    <div>
                        image:
                        <input  type="text" id="playerImage" className="bordered-input left-margin left-pad" value={this.state.editPlayer.imageUrl||''} onChange={(event)=>{
                            const editPlayer = {...this.state.editPlayer};
                            editPlayer.imageUrl = event.target.value || '';
                            this.setState({editPlayer});
                        }}/>
                    </div>

                    {this.state.editPlayer.imageUrl && this.state.editPlayer.imageUrl.length >0 && <img alt="" className="playerPageImage" src={this.state.editPlayer.imageUrl}/>}
                </div>

                <div className="buttons-section">
                    <button onClick={()=>this.setState({editPlayer:null})}>Back</button>
                    <button onClick={this.saveEditedPlayer} className="left-margin">Save</button>

                </div>


            </div>
        );

    }

    getPlayersTab = () =>{
        const { group } = this.props;
        const {players} = group;

        if (this.state.newPlayer){
            return this.getNewPlayerSection()
        }
        if (this.state.editPlayer){
            return this.getPlayerEdit();
        }

        if (this.state.playerSummary){
            return this.getPlayerSummary()
        }

        const PLAYERS = players.sort((a,b)=> a.gamesCount > b.gamesCount ? -1 : 1).map((player,index) => {

            const style = {
                backgroundImage: `url(${player.imageUrl || FULL_ANON_URL})`,
                borderRadiusTop: '50px',
            };



            return (
                        <div key={player.id} className={`player-item-div`}  onClick={()=>this.showPlayerData(player)}>
                            <div key={player.id} className="player-item-div-inner" style={style}>
                                <div><b>{player.name}</b></div>
                                {  player.gamesCount ?
                                    (<div>
                                        <div>  {player.gamesCount} games</div>
                                        <div>  {player.balance}₪ </div>
                                    </div>) :
                                    <div>no games yet</div> }
                            </div>
                        </div>
                   );

        });



        return (<div id="all-games-div" >
            <div className="row">
                <div className="col-xs-6">
                    <div className="player-item-div plus-sign"

                         onClick={this.showCreatePlayer}>
                        +
                    </div>
                </div>

                {PLAYERS}

            </div>
        </div>)

    }

    render() {

        const { group } = this.props;

        if (this.state.imageUploaderData){
            return <ImageUploader group={group} {...this.state.imageUploaderData} close={this.hideImageUploaderForm} uploadImage={this.uploadImage}/>
        }

        const isMobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

        const max = isMobile ? 7 : 8;

        const header = this.getHeader();

        const style = {
            backgroundImage: this.backgroundImage,
        };

        const playersTab = this.getPlayersTab();

        return (
            <div id="container" className="group-page">
                {header}

                <div id="group-image-title" className="group-image-title" style={style} >
                    <div className="row">
                        <div className="col-xs-8 event-page-title" >
                            <div>{group.name}</div>
                            <div  className="event-page-description">{group.description}</div>

                        </div>
                    </div>
                </div>


                <div id="group-page-data"  >
                    <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example" activeKey={this.state.tabKey} onSelect={this.onKeyChange}>
                        <Tab eventKey="summary" title="summary" >
                            <GameData group={group}
                                      playersCount={max}
                                      IsGroupSummary={true}/>
                        </Tab>
                        <Tab eventKey="games" title="Games" >
                            <div id="games-tab">
                                <GamesTab group={group}
                                          remoteCreateGame={createGame}
                                          remoteUpdateGame={updateGame}
                                          remoteDeleteGame={deleteGame}
                                          getGame={getGame}
                                          removeGroupGame={this.props.removeGame}
                                          updateGroupGame={this.props.updateGame}
                                          setClearAll={ (func)=> { this.clearGamesTabSelections = func }}
                                          user={this.props.user}
                                          provider={this.props.provider}
                                          token={this.props.token}/>
                            </div>

                        </Tab>
                        <Tab eventKey="players" title="Players" >
                            <div id="players-tab">
                                {playersTab}
                            </div>
                        </Tab>

                        <Tab eventKey="images" title="Images" >
                            <div id="images-tab">
                                <ImagesTab group={group} />
                            </div>
                        </Tab>


                    </Tabs>
                </div>


            </div>
        );

    }
}

export default GroupPage;

