import React, { Component } from 'react';
import InputRange from 'react-input-range';
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
import OnGoingGame from './OnGoingGame';
import PlayerSummary from './PlayerSummary';
import CONSTS from '../CONSTS';
const { ANON_URL } = CONSTS;
const baseUrl = window.location.origin === 'http://localhost:3000' ? 'http://www.poker-stats.com' : window.location.origin;
const FULL_ANON_URL = `${baseUrl}/${ANON_URL}`;
class GroupPage extends Component {

    getImage=()=>{

        this.imageIndex++;

        if (this.imageIndex > this.imagesCount) {
            this.imageIndex = 1;
        }
        return `backgroundImage${this.imageIndex}.jpg`;
    };

    constructor(props) {
        super(props);
        this.imageIndex = 0;
        this.imagesCount = 7;
        this.backgroundImage = `url(${props.group.imageUrl ||  `poker.jpg`})`;
        this.state = { tabKey: 'summary', newGame: null, editGame: null, gameSummary: null, editPlayerInGame: null, existingPlayerId: null  }
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
        this.setState({tabKey });
    };

    getHeader = ()=>{

        const { group } = this.props;
        const {isAdmin} = group;

        const menuItems = [];


        if (isAdmin){
            menuItems.push(<MenuItem key="menuItem1" onClick={()=>this.props.editGroup(group)}>Edit Group</MenuItem>);
        }

        menuItems.push(<MenuItem key="menuItem5" onClick={this.goHome}>Home</MenuItem>);
        menuItems.push(<MenuItem key="menuItem6" onClick={this.logout}>Logout</MenuItem>);

        return  <div id="app-header">
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

    createPlayersDataAsFakeGame = () => {
        const isMobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

        const max = isMobile ? 7 : 14;
        const { group: { players} } = this.props;


        let playersData = [];
        if (players.length <max){
            playersData = players.map(p=>({playerId: p.id, buyIn:0, cashOut: p.balance}));
        }else{

            let playersSortedByBalance = players.sort((a,b)=> a.balance > b.balance ? -1 :1);
            let playersSortedByGamesCount = players.sort((a,b)=> a.gamesCount > b.gamesCount ? -1 :1);
            while (playersData.length < max){
                const playerWithBalance = playersSortedByBalance[0];
                playersSortedByBalance = playersSortedByBalance.slice(1);
                if (!playersData.find(p=>p.playerId===playerWithBalance.id)) {
                    playersData.push({playerId: playerWithBalance.id, buyIn: 0, cashOut: playerWithBalance.balance})
                }
                const playerWithGamesCount = playersSortedByGamesCount[0];
                playersSortedByGamesCount = playersSortedByGamesCount.slice(1);
                if (!playersData.find(p=>p.playerId===playerWithGamesCount.id)){
                    playersData.push({playerId: playerWithGamesCount.id, buyIn:0, cashOut: playerWithGamesCount.balance })
                }
            }
        }

        return {
            playersData
        }
    };

    handleNewGameDateChange = (event) =>{
        const newGame = { ...this.state.newGame, date: event.target.value };
        this.setState({newGame});
    };
    handleNewGameDescriptionChange = (event) =>{
        const newGame = { ...this.state.newGame, description: event.target.value };
        this.setState({newGame});
    };
    handleEditGameDateChange = (event) =>{
        const editGame = { ...this.state.editGame, date: event.target.value };
        this.setState({editGame});
    };
    handleEditGameDescriptionChange = (event) =>{
        const editGame = { ...this.state.editGame, description: event.target.value };
        this.setState({editGame});
    };

    createNewGame = () => {
        const { group, provider, token } = this.props;
        const game = {
            date: `${this.state.newGame.date}T20:00:00.000Z`,
            description: this.state.newGame.description,
            playersData:[]
        }
        console.log('calling create game with body:', game)
        createGame(group.id, game, provider, token).then((g)=>{
            this.setState({ newGame: null, editGame: null, gameSummary:null});
            this.props.updateGame(g);
        });
    }
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

    showCreateGame = () =>{
        const str = ((new Date()).toISOString()).substring(0,10)
        this.setState({ newGame: { date:str, description: 'hosted by ..'} })
    }
    showCreatePlayer = () =>{
        this.setState({ newPlayer: {  name: '', email: ''} });
    }


    onGameEditClick = (game)=>{
        const editGame = {...game}
        editGame.date = typeof game.date === 'string' ? game.date.substr(0,10) : ((game.date).toISOString()).substring(0,10);
        const existingPlayerId = this.findPlayerNotInGame(editGame);

        this.setState({editGame, existingPlayerId});
    }
    showGameData = (game) =>{
        this.setState({ gameSummary: game })
    }

    showPlayerData = (player) =>{
        this.setState({ playerSummary: player })
    }

    getGamePot = (game)=>{
        return game.playersData.reduce((all, one)=>{
            return all + one.buyIn;
        }, 0);
    }
    gameDateToString = (game)=>{
        const addLeaddingZero = (num)=>{
            const str = `${num}`;
            if (str.length === 2){
                return str;
            } else{
                return `0${str}`;
            }
        };

        const isoDate = typeof  game.date === 'string' ? game.date.substr(0,10) :  game.date.toISOString();
        const year = parseInt(isoDate.substr(0, 4), 10);
        const month = addLeaddingZero(parseInt(isoDate.substr(5, 2), 10));
        const day = addLeaddingZero(parseInt(isoDate.substr(8, 2), 10));
       // const time = game.date.toTimeString();

        return `${day}/${month}/${year}`;
    }
    onPlayerEditClick = (editPlayer) =>{
        this.setState({ editPlayer });
    }

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
        // const isMobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        // const { group } = this.props;
        // const { isAdmin} = group;
        // const player = this.state.playerSummary;
        // const playerId = player.id;
        // const playerGames = group.games.map(game=>{
        //     const playerData = game.playersData.find(p=>p.playerId ===playerId);
        //     return playerData ? { game, playerData } : false;
        // }).filter(x=>!!x).map(({ game, playerData })=>{
        //     return <div key={game.date} className="player-game-data">
        //         {(typeof game.date === 'string' ? new Date(game.date) : game.date).AsGameName()}  <span className="gray-seprator"> |</span>
        //         {isMobile && game.description }
        //         {isMobile &&  <span className="gray-seprator"> |</span> }
        //         {isMobile &&  <br/> }
        //         buy-in: {playerData.buyIn}  <span className="gray-seprator"> |</span>
        //         cash-out: {playerData.cashOut}  <span className="gray-seprator"> |</span>
        //         balance: {playerData.cashOut - playerData.buyIn}
        //         {!isMobile &&   <span className="gray-seprator"> |</span>}
        //         {!isMobile &&  game.description}
        //
        //
        //     </div>
        // });
        //
        // return (
        //     <div className="playerSummary">
        //         <div className="playerSummaryHeader">
        //             <div>
        //                 name: {player.name}
        //             </div>
        //             <div>
        //                 email: {player.email}
        //             </div>
        //             <img alt="" className="playerPageImage" src={player.imageUrl || ANON_URL}/>
        //
        //         </div>
        //         <div className="playerGames">
        //             <div><u>{playerGames.length} games:</u></div>
        //             {playerGames}
        //         </div>
        //         <div className="buttons-section">
        //             <button onClick={()=>this.setState({playerSummary:null})}>Back</button>
        //             {isAdmin && <button onClick={()=>this.onPlayerEditClick(player)} className="left-margin">Edit</button>}
        //             {isAdmin && playerGames.length > 0 && <button onClick={()=>this.onPlayerDeleteClick(playerId)} className="left-margin">Delete</button>}
        //         </div>
        //
        //
        //     </div>
        // );
    }
    getGamesSummary = () =>{
        const { group } = this.props;
        const { isAdmin} = group;
        return (
            <div id="gameSummary">
                <div id="gameSummaryHeader">
                    <div>
                        Game summary: {this.gameDateToString(this.state.gameSummary)}
                    </div>
                    <div>
                        {this.state.gameSummary.description}
                    </div>
                    <div>
                        pot size:  {this.getGamePot(this.state.gameSummary)}
                    </div>
                </div>

                <GameData Group={group} Game={this.state.gameSummary} />
                <button onClick={()=>this.setState({editGame:null, gameSummary:null})} className="button">Back</button>
                {isAdmin && <button onClick={()=>this.onGameEditClick(this.state.gameSummary)} className="button left-margin">Edit</button>}
                {isAdmin && <button onClick={this.deleteSelectedGame} className="button left-margin">Delete</button>}
            </div>
        );
    }

    isGameReady = (game)=>{
        const totalBuyIn = game.playersData.map(pd=>pd.buyIn).reduce((total, num)=>  total + num, 0);
        const totalCashOut =game.playersData.map(pd=>pd.cashOut).reduce((total, num)=>  total + num, 0);
        const diff = totalBuyIn - totalCashOut;
        const ready = diff === 0 && game.playersData.length >1;
        return { ready, diff };
    };

    removePlayerFromGame = (playerId) =>{
        const editGame = this.state.editGame;
        editGame.playersData = editGame.playersData.filter(player => player.playerId !==playerId);
        const existingPlayerId = this.findPlayerNotInGame(editGame);
        this.setState({editGame, existingPlayerId})
    }
    updateSelectedGame = () =>{
        const { group, provider, token } = this.props;
        const data = {
            id: this.state.editGame.id,
            date: `${this.state.editGame.date}T20:00:00.000Z`,
            description: this.state.editGame.description,
            playersData:this.state.editGame.playersData
        };
        console.log('calling update game with body:', data);
        updateGame(group.id, data.id, data, provider, token).then((game)=>{
            this.setState({ newGame: null, editGame: null, gameSummary:game});
            this.props.updateGame(game);
        });

    };

    deleteSelectedGame = ()=>{
        if (confirm("Are you sure?")){
            try{
                const { group, provider, token } = this.props;
                const gameId = this.state.gameSummary.id;
                deleteGame(group.id, gameId, provider, token).then(()=>{
                    this.setState({ newGame: null, editGame: null, gameSummary:null});
                    this.props.removeGame(gameId);
                });
            }catch(error){
                console.error('deleteSelectedGame error', error);
            }
        }
    };

    editGamePlayer = (playerId) =>{
        const game = this.state.editGame;
        const playerData = game.playersData.find(p=>p.playerId===playerId);
        const editPlayerInGame = { playerId, buyIn: playerData.buyIn,cashOut: playerData.cashOut };
        this.setState({editPlayerInGame });
    }
    findPlayerNotInGame = (game)=>{
        const {group} = this.props;
        const PLAYERS = {};
        const GAME_PLAYERS = {};
        group.players.forEach(player=>{
            PLAYERS[player.id] = player;
        });

        game.playersData.forEach(player=>{
            GAME_PLAYERS[player.playerId] = player;
        });
        const playa = group.players.find(player => !GAME_PLAYERS[player.id]);

        return playa ? playa.id : null;

    };
    handleNewPlayerChange = (existingPlayerId)=> {
        this.setState({existingPlayerId});
    };

    addCurrentPlayerToGame = () =>{
        if (!this.state.existingPlayerId){

            return;
        }
        const {group} = this.props;

        const editGame = {...this.state.editGame};
        editGame.playersData.push({
            buyIn: 50,
            cashOut: 0,
            gameId: editGame.id,
            groupId: group.id,
            playerId: this.state.existingPlayerId,
            index: editGame.playersData.length,
        });

        const existingPlayerId = this.findPlayerNotInGame(editGame);
        this.setState({existingPlayerId, editGame});
    };

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
    getGamesEdit = () =>{
        const isMobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        const { group } = this.props;
        const PLAYERS = {};
        const GAME_PLAYERS = {};
        group.players.forEach(player=>{
            PLAYERS[player.id] = player;
        });
        const game = this.state.editGame;

        game.playersData.forEach(player=>{
            GAME_PLAYERS[player.playerId] = player;
        });
        const players = game.playersData.map(playerData=>{
            const playerName = PLAYERS[playerData.playerId].name;
            const playerImageUrl = PLAYERS[playerData.playerId].imageUrl;
            const onImageError = (ev)=>{
                if (!ev.target.secondTry){
                    ev.target.secondTry = true;
                    ev.target.src= playerImageUrl;
                }else{
                    ev.target.src=ANON_URL;
                }
            };

            const image =  <img alt={playerName} className="playersListImage" src={playerImageUrl || ANON_URL}  onError={onImageError} /> ;

            return (<div key={`_playerData_${playerData.playerId}`} className="editGamePlayerSection">
                <button className="button edit-player-in-game-form" onClick={()=>this.editGamePlayer(playerData.playerId)}> edit </button>
                {image}
                { isMobile && <br/>}
                {playerName}
                <span className="gray-seprator"> |</span>
                { isMobile && <br/>}
                buy-in: {playerData.buyIn} <span className="gray-seprator"> |</span>
                { isMobile && <br/>}
                cash-out: {playerData.cashOut} <span className="gray-seprator"> |</span>
                { isMobile && <br/>}
                balance: {playerData.cashOut - playerData.buyIn}

                <button className="button remove-player-from-game" onClick={()=>this.removePlayerFromGame(playerData.playerId)}> remove </button>

            </div>);
        });


        const comboVals = group.players.filter(player => !GAME_PLAYERS[player.id]).map(player =>
            (
                <option key={`_comboVals_${player.id}`} value={player.id}>
                    { player.name }
                </option>
            )
        );
        const { ready, diff } = this.isGameReady(game);

        return (<div className="game-edit-div">
                    <h2> edit game. </h2>
                    <div className="new-game-section">
                        Game date:
                        <input  className="left-margin" type="date" id="newGameDate" min="2010-01-01" max="2050-01-01" value={this.state.editGame.date} onChange={this.handleEditGameDateChange}/>
                    </div>
                    <div className="new-game-section">
                        description:
                        <input  type="text" id="newGameExtra" className="bordered-input left-margin left-pad" value={this.state.editGame.description} onChange={this.handleEditGameDescriptionChange}/>
                    </div>
                    <div>
                        <div>
                            <u>{players.length} Players:</u>
                        </div>

                        <div>
                            {players}
                        </div>
                    </div>

                    <hr/>
                {
                    comboVals.length >0 ? (
                        <div>
                            <select name="player" value={this.state.existingPlayerId} onChange={(e)=>this.handleNewPlayerChange(e.target.value)}>
                                {comboVals}
                            </select>
                            <button className="button left-margin" onClick={this.addCurrentPlayerToGame}> Add</button>
                        </div>
                    ) :<div>no more players</div> }
                <hr/>
                <div>
                    <button className="button left-margin" onClick={()=> this.setState({editGame: null})}> Cancel</button>
                    <button className="button left-margin" onClick={this.updateSelectedGame}> Save</button>
                </div>
                <div>
                    <br/>
                    <h3>{ready ? '' : `game still not done (${diff>0 ? diff : -1*diff} ${diff>0 ? 'still in pot':'missing from pot'}).`}</h3>
                </div>

        </div>);
    }
    updateSelectedGamePlayerData = ()=>{
        const editGame = {...this.state.editGame}
        const { playerId, cashOut, buyIn } = this.state.editPlayerInGame;

        editGame.playersData = editGame.playersData.map(pd => {
            if (pd.playerId !== playerId) return pd;
            return {...pd, cashOut, buyIn };
        });
        this.setState({editGame,editPlayerInGame:null});
    }
    getEditPlayerInGame = ()=>{
        const game = this.state.editGame;
        const { playerId, cashOut, buyIn } = this.state.editPlayerInGame;
        const player = this.props.group.players.find(p=>p.id===playerId);



        const onImageError = (ev)=>{
            if (!ev.target.secondTry){
                ev.target.secondTry = true;
                ev.target.src= player.imageUrl;
            }else{
                ev.target.src=ANON_URL;
            }
        };

        const image = <img alt={player.name} className="playersListImageBig" src={player.imageUrl || ANON_URL}  onError={onImageError} /> ;
        const currentPlayerBuyIn = buyIn;
        const maxBuyInRange = currentPlayerBuyIn+100;
        const totalBuyIn = game.playersData.map(data=> data.buyIn).reduce((all,item)=>(all+item),0);

        const maxCashOutRange = (totalBuyIn);

        return (<div className="edit-player-in-game">
            <div>
                <h1>{image}{player.name}</h1>
            </div>
            <hr/>
            <div>
                buy-in:   <input className="editPlayerInput" type="number"  id="buyIn"
                                 value={this.state.editPlayerInGame.buyIn}
                                 onChange={(event)=>{
                                     const editPlayerInGame = {...this.state.editPlayerInGame};
                                     editPlayerInGame.buyIn=parseInt(event.target.value, 10);
                                     this.setState({ editPlayerInGame });
                                 }}/>

                                 <button className="button left-margin" onClick={()=>{
                                     const editPlayerInGame = {...this.state.editPlayerInGame};
                                     editPlayerInGame.buyIn=editPlayerInGame.buyIn - 10;
                                     if (editPlayerInGame.buyIn < 0){
                                         editPlayerInGame.buyIn = 0;
                                     }
                                     this.setState({ editPlayerInGame });
                                 }}> -10 </button>
                                <button className="button left-margin" onClick={()=>{
                                    const editPlayerInGame = {...this.state.editPlayerInGame};
                                    editPlayerInGame.buyIn=editPlayerInGame.buyIn + 10;
                                    this.setState({ editPlayerInGame });
                                }}> +10 </button>
                <br/>
                <br/>
                <InputRange className="InputRange"
                            step={10}
                            formatLabel={value => `${value}₪`}
                            maxValue={maxBuyInRange}
                            minValue={0}
                            value={this.state.editPlayerInGame.buyIn}
                            onChange={(buyIn) => {
                                const editPlayerInGame = {...this.state.editPlayerInGame};
                                editPlayerInGame.buyIn=buyIn;
                                this.setState({ editPlayerInGame });
                            }} />

                <br/>
                <br/>  <br/>
                <br/>
            </div>
            <div>
                cash-out:  <input className="editPlayerInput" type="number"  id="cashOut"
                                  value={this.state.editPlayerInGame.cashOut}
                                  onChange={(event)=>{
                                      const editPlayerInGame = {...this.state.editPlayerInGame};
                                      editPlayerInGame.cashOut=parseInt(event.target.value, 10);
                                      this.setState({ editPlayerInGame });
                                  }}/>

                                    <button className="button left-margin" onClick={()=>{
                                        const editPlayerInGame = {...this.state.editPlayerInGame};
                                        editPlayerInGame.cashOut=editPlayerInGame.cashOut - 10;
                                        if (editPlayerInGame.cashOut < 0){
                                            editPlayerInGame.cashOut = 0;
                                        }
                                        this.setState({ editPlayerInGame });
                                    }}> -10 </button>

                                    <button className="button left-margin" onClick={()=>{
                                        const editPlayerInGame = {...this.state.editPlayerInGame};
                                        editPlayerInGame.cashOut=editPlayerInGame.cashOut + 10;
                                        this.setState({ editPlayerInGame });
                                    }}> +10 </button>
                <br/>
                <br/>
                <InputRange className="InputRange"
                            step={10}
                            formatLabel={value => `${value}₪`}
                            maxValue={maxCashOutRange}
                            minValue={0}
                            value={this.state.editPlayerInGame.cashOut}
                            onChange={cashOut => {
                                const editPlayerInGame = {...this.state.editPlayerInGame};
                                editPlayerInGame.cashOut=cashOut;
                                this.setState({ editPlayerInGame });
                            }} />

            </div>
            <div>
                <br/> <br/>
                balance: {this.state.editPlayerInGame.cashOut - this.state.editPlayerInGame.buyIn}
            </div>
            <div>
                <button className="button" onClick={()=> this.setState({editPlayerInGame:null})}> Cancel</button>
                <button className="button left-margin" onClick={this.updateSelectedGamePlayerData}> Save</button>
            </div>
        </div>);
    }

    updateOnProgressGame = ()=>{
        const {group} = this.props;
        const onGoingGameId = this.state.gameSummary.id;
        getGame(group.id, onGoingGameId, this.props.provider, this.props.token).then((gameSummary)=>{
            gameSummary.date = new Date(gameSummary.date);
            this.setState({gameSummary});
        })
    };

    getGamesTab = () =>{
        const { group } = this.props;
        const {games} = group;

        if (this.state.newGame){
            return this.getNewGameSection()
        }
        if (this.state.editGame){
            if (this.state.editPlayerInGame){
                return this.getEditPlayerInGame()
            }
            return this.getGamesEdit();
        }

        if (this.state.gameSummary){
            const game = this.state.gameSummary;
            const { ready } = this.isGameReady(game);
            if (ready) return this.getGamesSummary();

            return <OnGoingGame deleteSelectedGame={this.deleteSelectedGame}  group={group} user={this.props.user} gameId={game.id} game={game} onBack={()=>this.setState({gameSummary: null})} updateOnProgressGame={this.updateOnProgressGame} onGameEditClick={()=>this.onGameEditClick(game)}/>


        }

        const GAMES = games.sort((a,b)=> a.date > b.date ? -1 : 1).map(game => {
            const { ready } = this.isGameReady(game);
            const pot = this.getGamePot(game);
            const style = {
                backgroundImage: `url(${game.imageUrl || this.getImage()})`,
                borderRadiusTop: '50px',
            };

            return (
                        <div key={game.id} className={`game-item-div ${ready?'':'game-item-div-not-ready'}`}  onClick={()=>this.showGameData(game)}>
                            <div key={game.id} className="game-item-div-inner" style={style}>
                                <div><b>{this.gameDateToString(game) }</b></div>
                                <div className="group-description">{game.description } </div>
                                <div className="my-group">{pot} in pot</div>

                            </div>

                            <div className="game-extra-data">

                                <div > {game.playersData.length } players </div>
                                <div className='game-not-ready-text' >{ready ? '' : 'GAME NOT READY'} </div>
                            </div>
                        </div>
                   );

        });



        return (<div id="all-games-div" >
            <div className="row">
                <div className="col-xs-6">
                    <div className="game-item-div plus-sign" onClick={this.showCreateGame}>
                        +
                    </div>
                </div>

                {GAMES}

            </div>
        </div>)

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

        const PLAYERS = players.sort((a,b)=> a.gamesCount > b.gamesCount ? -1 : 1).map(player => {

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
                    <div className="player-item-div plus-sign" onClick={this.showCreatePlayer}>
                        +
                    </div>
                </div>

                {PLAYERS}

            </div>
        </div>)

    }

    render() {


        const { group } = this.props;

        const fakeGameData = this.createPlayersDataAsFakeGame();


        const header = this.getHeader();

        const style = {
            backgroundImage: this.backgroundImage,
        };

        const gamesTab = this.getGamesTab();
        const playersTab = this.getPlayersTab();
        return (
            <div id="container" className="group-page">
                {header}
                <div id="group-image-title" className="group-image-title" style={style}>
                    <div className="row">
                        <div className="col-xs-8 event-page-title">
                            <div>{group.name}</div>
                            <div  className="event-page-description">{group.description}</div>

                        </div>
                    </div>
                </div>

                <div id="group-page-data">
                    <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example" activeKey={this.state.tabKey} onSelect={this.onKeyChange}>
                        <Tab eventKey="summary" title="summary">
                            <GameData Group={group} Game={fakeGameData} IsGroupSummary={true}/>
                        </Tab>
                        <Tab eventKey="games" title="Games">
                            <div id="games-tab">
                                {gamesTab}
                            </div>

                        </Tab>
                        <Tab eventKey="players" title="Players">
                            <div id="players-tab">
                                {playersTab}
                            </div>
                        </Tab>


                    </Tabs>
                </div>


            </div>
        );

    }
}

export default GroupPage;

