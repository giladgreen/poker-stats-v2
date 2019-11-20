import React, { Component } from 'react';
import { ANON_URL } from '../../../config';

import createPlayer from "../actions/createPlayer";
import deletePlayer from "../actions/deletePlayer";
import updateGame from "../actions/updateGame";
import updatePlayer from "../actions/updatePlayer";
import createGame from "../actions/createGame";
import deleteGame from "../actions/deleteGame";
import OnGoingGame from "./OnGoingGame";

class Group extends Component {

    constructor() {
        super();
        this.state = { newPlayerName:'', newGameDate:(new Date()).AsDatePicker().datePickerToDate().AsDatePicker() ,player:null, buyIn: 50, cashOut: 50};
    }



    scrollTop = () => {
        window.scrollTo(0, 0);
    }

    handleNewPlayerNameChange = (event) =>{
        this.setState({newPlayerName: event.target.value});
    };

    handleNewGameDateChange = (event) =>{
        this.setState({newGameDate: event.target.value});
    };

    editPlayer = async (player) => {
        this.setState({player});
        this.scrollTop();
    };

    addCurrentPlayerToGame = () =>{
        if (!this.state.existingPlayerId){
            return;
        }
        const {group} = this.props;
        const {game} = this.state;
        const newGame = {...game};
        newGame.playersData.push({
            buyIn: 50,
            cashOut: 0,
            gameId: game.id,
            groupId: group.id,
            playerId: this.state.existingPlayerId
        });

        this.setState({existingPlayerId:this.findPlayerNotInGame(newGame),game: newGame});
    }

    findPlayerNotInGame = (game)=>{
        const {group} = this.props;

        if (!game){
            return null;
        }
        const PLAYERS = {};
        const GAME_PLAYERS = {};
        group.players.forEach(player=>{
            PLAYERS[player.id] = player;
        });

        game.playersData.forEach(player=>{
            GAME_PLAYERS[player.playerId] = player;
        });
        const playa = group.players.find(player => !GAME_PLAYERS[player.id])

        return playa ? playa.id : null;

    }

    viewGame = async (game) => {
        this.setState({viewGame: game});
        this.scrollTop();
    }

    editGame = async (game) => {
        let existingPlayerId;
        if (game){
            existingPlayerId = this.findPlayerNotInGame(game)
        }

        this.setState({game, existingPlayerId});
        this.scrollTop();
    };

    deletePlayerById = async (playerId) => {
        if (confirm("Are you sure?")){
            try{
                await deletePlayer(this.props.group.id, playerId, this.props.provider, this.props.token);
                const groupClone = {...this.props.group};
                groupClone.players = groupClone.players.filter(player => player.id !== playerId);
                this.props.updateGroup(groupClone);
            }catch(error){
                console.error('deletePlayerById error',error);
                this.props.onFailure(error);
            }
        }
    };

    deleteGameById = async (gameId) => {
        if (confirm("Are you sure?")){
            try{
                await deleteGame(this.props.group.id, gameId, this.props.provider, this.props.token);
                const groupClone = {...this.props.group};
                groupClone.games = groupClone.games.filter(game => game.id !== gameId);
                this.props.updateGroup(groupClone);
            }catch(error){
                console.error('deleteGameById error',error);
                this.props.onFailure(error);
            }
        }
    };

    createNewGame = async () =>{
        try{
            const newGame = await createGame(this.props.group.id, this.state.newGameDate.datePickerToDate(), this.props.provider, this.props.token);
            newGame.date = new Date(newGame.date);

            const groupClone = {...this.props.group};
            groupClone.games.push(newGame);
            this.props.updateGroup(groupClone);
        }catch(error){
            console.error('createNewGame error',error);
            this.props.onFailure(error);
        }
    };

    createNewPlayer = async () =>{
        try{
            const newPlayer = await createPlayer(this.props.group.id, this.state.newPlayerName, this.props.provider, this.props.token);
            const groupClone = {...this.props.group};
            groupClone.players.push(newPlayer);
            this.props.updateGroup(groupClone);
        }catch(error){
            console.error('createNewPlayer error',error);
            this.props.onFailure(error);
        }
    };

    getNewPlayerSection = () => {
        const {isAdmin} = this.props.group;
        return isAdmin ? (<div>
            <h1> Create a new player. </h1>
            Player name: <input type="text" id="newPlayerName" value={this.state.newPlayerName} onChange={this.handleNewPlayerNameChange}/>

            <button className="button" disabled={!this.state.newPlayerName} onClick={this.createNewPlayer}> Create </button>
            <br/> <hr/><br/>

        </div>):<div/>;
    };

    getNewGameSection = () => {
        const {isAdmin} = this.props.group;
        return isAdmin ? (<div>
            <h1> Create a new game. </h1>
            Game date: <input type="date" id="newGameDate" min="2010-01-01" max="2050-01-01" value={this.state.newGameDate} onChange={this.handleNewGameDateChange}/>

            <button className="button"  onClick={this.createNewGame}> Create </button>
            <br/> <hr/><br/>

        </div>):<div/>;
    };

    getPlayers = ()=>{

        const {group} = this.props;
        const {players, games, isAdmin} = group;
        return players.map(player=>{
            let balance = 0;
            const playersGames = games.filter(game=> {
                const play = game.playersData.find(data => data.playerId === player.id);
                if (play){
                    balance += play.cashOut;
                    balance -= play.buyIn;
                }
                return play;
            });
            const gamesCount = playersGames.length;

            return {...player, gamesCount, balance};
        }).sort((a,b)=>  a.gamesCount === b.gamesCount ? ((a.balance > b.balance ? -1 : 1)) : (a.gamesCount > b.gamesCount ? -1 : 1)).map(player=>{
            const { gamesCount, balance } = player;
            const deletePlayerButton = isAdmin && (this.props.user.playerId!==player.id) && gamesCount === 0 ?  <button className="button" onClick={()=> this.deletePlayerById(player.id)}> Delete    </button> : <span/>;
            const editPlayerButton = isAdmin ?  <button className="button" onClick={()=> this.editPlayer(player)}> Edit  </button> : <span/>;

            const onImageError = (ev)=>{
                if (!ev.target.secondTry){
                    ev.target.secondTry = true;
                    ev.target.src=player.imageUrl;
                }else{
                    ev.target.src=ANON_URL;
                }
            };
            const playerName = player.name;

            const image =  <img alt={playerName} className="playersListImage" src={player.imageUrl || ANON_URL}  onError={onImageError} />;
            const balanceWithCurrency = balance > 0 ? `+${balance}₪` : `${balance}₪`;
            return (<div className="playersListItem" key={`player_${player.id}`}>
                <h3>  {image} {playerName} {editPlayerButton} {deletePlayerButton} ({gamesCount} games) <span className={balance >0 ? 'balanceWithCurrencyPositive' : 'balanceWithCurrencyNegative'}>{balanceWithCurrency}</span> </h3>
            </div>);
        })
    };

    getGames = ()=>{
        const {group} = this.props;
        const {games, isAdmin} = group;
        return games.sort((a,b)=>(a.date < b.date ? 1:-1)).map(game=>{
            const {date,description, playersData, ready, id:gameId} = game;

           //TODO: anyone can delete/edit un-finished game
           const deleteGameButton = isAdmin || !ready ?  <button className="button" onClick={()=> this.deleteGameById(gameId)}> Delete    </button> : <span/>;
           const editGameButton = isAdmin || !ready ?  <button className="button" onClick={()=> this.editGame({...game, nameAsDatePicker: game.date.AsDatePicker()})}> Edit  </button> : <span/>;
           const viewGameButton = <button className="button" onClick={()=> this.viewGame(game)}> View  </button> ;

            return (<div className={`gamesListItem ${ready ? 'gamesListItemReady': 'gamesListItemNotReady'}`} key={`games_${game.id}`}>
                <h3> * {date.AsGameName()} {description && description.length>0 ? ` - ${description}`:''} - ({playersData.length} players) {editGameButton}{deleteGameButton} {viewGameButton}</h3>
            </div>);
        })
    };

    updateSelectedPlayer = async () =>{
        const {group, provider, token} = this.props;
        const {player} = this.state;
        this.editPlayer(null);
        const playerId = player.id;
        const groupId = group.id;
        try {
            const updatedPlayer = await updatePlayer(groupId, playerId, player, provider, token);
            const groupClone = {...this.props.group};
            groupClone.players = groupClone.players.map(playerItem=>{
                if (playerId!==playerItem.id){
                    return playerItem;
                } else{
                    return updatedPlayer;
                }
            })
            this.props.updateGroup(groupClone);
        } catch (e) {
            this.props.onFailure(e);

        }
    }
    updateSelectedGame = async () =>{
        const {group, provider, token} = this.props;
        const {game} = this.state;
        game.date = new Date(game.nameAsDatePicker.datePickerToDate());
        delete game.nameAsDatePicker;
        this.editGame(null);
        const gameId = game.id;
        const groupId = group.id;
        try {
            const updatedGame = await updateGame(groupId, gameId, game, provider, token);
            updatedGame.date = new Date(updatedGame.date);
            const groupClone = {...this.props.group};
            groupClone.games = groupClone.games.map(gameItem=>{
                if (gameId!==gameItem.id){
                    return gameItem;
                } else{
                    return updatedGame;
                }
            })
            this.props.updateGroup(groupClone);
        } catch (e) {
            this.props.onFailure(e);

        }
    }

    getEditPlayerPopup = ()=> {
        const {player} = this.state;
        if (!player){
            return <div/>
        }

        return (<div className="popupOuter">
                    <div className="editPlayerPopupInner">
                        <div><h1>Edit player:</h1></div>
                        <hr/>
                        <div>
                            Player name: <input className="editPlayerInput" type="text" id="playerName" value={this.state.player.name} onChange={(event)=>this.editPlayer({...this.state.player, name: event.target.value})}/>
                        </div>
                        <div>
                            Player email: <input className="editPlayerInput"  type="text" id="playerEmail" value={this.state.player.email} onChange={(event)=>this.editPlayer({...this.state.player, email: event.target.value})}/>
                        </div>
                        <div>
                            Player image: <input className="editPlayerInput"  type="text" id="playerImage" value={this.state.player.imageUrl} onChange={(event)=>this.editPlayer({...this.state.player, imageUrl: event.target.value})}/>
                        </div>
                        <div>
                            <button className="button" onClick={this.updateSelectedPlayer}> Save</button>
                            <button className="button" onClick={()=>this.editPlayer(null)}> Cancel</button>

                        </div>
                    </div>
                </div>);
    };

    removePlayerFromGame = (playerId)=> {
        const {game} = this.state;
        const updatedGame = {...game};
        updatedGame.playersData = game.playersData.filter(item => item.playerId !== playerId);
        this.setState({ game: updatedGame})
    }
    addToBuyIn = (playerId)=> {
        const {game} = this.state;
        const updatedGame = {...game};
        updatedGame.playersData = game.playersData.map(item => {
            if (item.playerId !== playerId){
                return {...item};
            } else{
                return {...item, buyIn: item.buyIn + this.state.buyIn}
            }
        });
        this.setState({ game: updatedGame})
    }


    addToCashOut = (playerId)=> {
        const {game} = this.state;
        const updatedGame = {...game};
        updatedGame.playersData = game.playersData.map(item => {
            if (item.playerId !== playerId){
                return {...item};
            } else{
                return {...item, cashOut: item.cashOut + this.state.cashOut}
            }
        });
        this.setState({ game: updatedGame})
    }


    handleNewPlayerChange = (existingPlayerId)=> {
        this.setState({existingPlayerId});
    }

    isGameReady = (game)=>{
        const totalBuyIn = game.playersData.map(pd=>pd.buyIn).reduce((total, num)=>  total + num, 0);
        const totalCashOut =game.playersData.map(pd=>pd.cashOut).reduce((total, num)=>  total + num, 0);
        const ready = totalBuyIn === totalCashOut && game.playersData.length >1;
        return ready;
    }
    getViewGamePopup = ()=> {
        const {viewGame: game} = this.state;
        if (!game){
            return <div/>
        }
        const {group} = this.props;
        const PLAYERS = {};
        group.players.forEach(player=>{
            PLAYERS[player.id] = player;
        });

        const ready = this.isGameReady(game);
        const totalBuyIn = game.playersData.map(pd=>pd.buyIn).reduce((total, num)=>  total + num, 0);

        if (ready){
            const playersData = game.playersData.map(playerData=>{
               return {
                   playerId: playerData.playerId,
                   name: PLAYERS[playerData.playerId].name,
                   imageUrl: PLAYERS[playerData.playerId].imageUrl,
                   buyIn: playerData.buyIn,
                   cashOut: playerData.cashOut,
                   balance: playerData.cashOut - playerData.buyIn
               }
            });
            playersData.sort((a,b)=> a.balance >b.balance ? -1 : 1);
            const players = playersData.map(playerData=>{
                const onImageError = (ev)=>{
                    if (!ev.target.secondTry){
                        ev.target.secondTry = true;
                        ev.target.src= playerData.imageUrl;
                    }else{
                        ev.target.src=ANON_URL;
                    }
                };
                const playerName = playerData.name;
                console.log('playerName',playerName)
                return (<div key={`_playerViewData_${playerData.playerId}`} className="viewGamePlayerSection">
                    <img alt={playerName} className="playersListImage" src={ playerData.imageUrl || ANON_URL}  onError={onImageError} />
                    {playerName} |
                    buy-in: {playerData.buyIn} |
                    cash-out: {playerData.cashOut} |
                    balance: {playerData.balance}
                </div>);
            });
            return (<div className="popupOuter">
                <div className="viewGamePopupInner">
                    <div>
                        <h1>Game Summary:</h1>
                    </div>
                    <hr/>
                    <div>
                        <h2>Game date: {game.date.AsGameName()}</h2>
                        <h2>{game.description && game.description.length>0 ? ` ${game.description}`: ''}</h2>
                        <h3>{game.playersData.length} Players</h3>
                        <h4>{totalBuyIn} In Pot</h4>
                    </div>
                    <div>
                        {players}
                    </div>
                    <div className="backButton">
                        <button className="button" onClick={()=>this.viewGame(null)}> Back</button>
                    </div>

                </div>
            </div>);
        } else{

           return <OnGoingGame group={group} gameId={game.id} game={group.games.find(g=>g.id === game.id)} onBack={()=>this.viewGame(null)}/>
        }

    }
    getEditGamePopup = ()=> {

        const {game} = this.state;
        if (!game){
            return <div/>
        }
        const {group} = this.props;
        const PLAYERS = {};
        const GAME_PLAYERS = {};
        group.players.forEach(player=>{
            PLAYERS[player.id] = player;
        });
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

            console.log('playerName',playerName)
            return (<div key={`_playerData_${playerData.playerId}`} className="editGamePlayerSection">
                {image}
                {playerName} |
                buy-in: {playerData.buyIn} |
                cash-out: {playerData.cashOut} |
                balance: {playerData.cashOut - playerData.buyIn}
                <button className="button" onClick={()=>this.removePlayerFromGame(playerData.playerId)}> remove </button>
                <button className="button" disabled={playerData.buyIn + this.state.buyIn < 0} onClick={()=>this.addToBuyIn(playerData.playerId)}> add to buy in </button>
                <button className="button" disabled={playerData.cashOut + this.state.cashOut < 0} onClick={()=>this.addToCashOut(playerData.playerId)}> add to cash out </button>
            </div>);
        });

        const comboVals = group.players.filter(player => !GAME_PLAYERS[player.id]).map(player =>
            (
                <option key={`_comboVals_${player.id}`} value={player.id}>
                    { player.name }
                </option>
            )
        );
        const ready = this.isGameReady(this.state.game);
        return (<div className="popupOuter">
                    <div className="editGamePopupInner">
                        <div>
                            <h1>Edit game:</h1>
                        </div>
                        <hr/>
                        <div>
                            Game date: <input className="editGameInput" min="2010-01-01" max="2050-01-01" type="date" id="gameDate" value={this.state.game.nameAsDatePicker} onChange={(event)=>this.editGame({...this.state.game, nameAsDatePicker: event.target.value})}/>
                        </div>
                        <div>
                            description: <input className="editGameInput"  type="text" id="gameDescription" value={this.state.game.description} onChange={(event)=>this.editGame({...this.state.game, description: event.target.value})}/>
                        </div>
                        <div>

                            <div>
                                <u>{players.length} Players:</u>
                            </div>

                            <div>
                                {players}
                            </div>
                        </div>
                        <div>
                            Buy In:
                        </div>
                        <div>
                            <input className="editPlayerInput" type="number" step={10} id="buyIn" value={this.state.buyIn} onChange={(event)=>this.setState({buyIn: parseInt(event.target.value)})}/>
                        </div>
                        <div>
                            Cash out:
                        </div>
                        <div>
                            <input className="editPlayerInput" type="number" step={10} id="cashOut" value={this.state.cashOut} onChange={(event)=>this.setState({cashOut: parseInt(event.target.value)})}/>
                        </div>
                        <hr/>
                        {
                            comboVals.length >0 ? (
                                <div>
                                    <select name="player" value={this.state.existingPlayerId} onChange={(e)=>this.handleNewPlayerChange(e.target.value)}>
                                        {comboVals}
                                    </select>
                                    <button className="button" onClick={this.addCurrentPlayerToGame}> Add</button>
                                </div>
                            ) :<div>no more players</div> }
                        <hr/>
                        <div>
                            <button className="button" onClick={this.updateSelectedGame}> Save</button>
                            <button className="button" onClick={()=>this.editGame(null)}> Cancel</button>
                        </div>
                        <div>
                            <h3>{ready ? '' : 'game still not done'}</h3>
                        </div>
                    </div>
                </div>);
    };

    render() {
        const {group} = this.props;
        const {isAdmin} = group;

        const editPlayerPopup = this.getEditPlayerPopup();
        const editGamePopup = this.getEditGamePopup();
        const viewGamePopup = this.getViewGamePopup();
        const newPlayerSection = this.getNewPlayerSection();
        const newGameSection = this.getNewGameSection();
        const players = this.getPlayers();
        const games = this.getGames();
        return (
            <div className="groupPage">
                <div>
                    <button className="button" onClick={this.props.backToMainPage}> back to all groups</button>


                </div>
                <div>
                    <h1> Group: {group.name}</h1>
                    {isAdmin ? <h3>logged in as admin</h3> : <span/>}
                </div>
                    {newGameSection}
                    <h2>  {group.games.length} games</h2>
                    <div className="groupGamesList"> {games} </div>

                <div>
                    <hr/>
                </div>
                <div>
                    <div>
                        {newPlayerSection}
                        <h2>  {group.players.length} players</h2>
                        <div className="groupPlayersList"> {players} </div>
                    </div>


                </div>
                {editPlayerPopup}
                {editGamePopup}
                {viewGamePopup}
            </div>);

    }
}

export default Group;
