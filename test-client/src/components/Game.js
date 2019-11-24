import React, { Component } from 'react';
import { ANON_URL } from '../../../config';

import createPlayer from "../actions/createPlayer";
import deletePlayer from "../actions/deletePlayer";
import updateGame from "../actions/updateGame";
import updatePlayer from "../actions/updatePlayer";
import createGame from "../actions/createGame";
import deleteGame from "../actions/deleteGame";
import getGame from "../actions/getGame";
import OnGoingGame from "./OnGoingGame";

class Game extends Component {

    constructor() {
        super();
        this.state = { buyIn: 50, cashOut: 50};
    }

    updateOnProgressGame = async()=>{
        const {group} = this.props;
        const onGoingGameId = this.props.viewGame.id;
        const viewGame = await getGame(group.id, onGoingGameId, this.props.provider, this.props.token);
        viewGame.date = new Date(viewGame.date);
        const groupClone = {...this.props.group};
        groupClone.games = groupClone.games.map(game =>{
            if (game.id === viewGame.id){
                return viewGame;
            }
            return game;
        });
        this.props.updateGroup(groupClone);
    }

    addCurrentPlayerToGame = () =>{
        if (!this.state.existingPlayerId){
            return;
        }
        const {group} = this.props;
        const {game} = this.props;
        const newGame = {...game};
        newGame.playersData.push({
            buyIn: 50,
            cashOut: 0,
            gameId: game.id,
            groupId: group.id,
            playerId: this.state.existingPlayerId,
            index: newGame.playersData.length,
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

    updateSelectedGame = async () =>{
        const {group, provider, token} = this.props;
        const {game} = this.props;
        game.date = new Date(game.nameAsDatePicker.datePickerToDate());
        delete game.nameAsDatePicker;

        const gameId = game.id;
        const groupId = group.id;
        try {
            console.log('updateSelectedGame game',game);
            const updatedGame = await updateGame(groupId, gameId, game, provider, token);
            updatedGame.date = new Date(updatedGame.date);
            const groupClone = {...this.props.group};
            groupClone.games = groupClone.games.map(gameItem=>{
                if (gameId!==gameItem.id){
                    return gameItem;
                } else{
                    return updatedGame;
                }
            });
            this.props.updateGroup(groupClone);
            this.props.updateGame(null);
        } catch (e) {
            this.props.onFailure(e);

        }
    }

    removePlayerFromGame = (playerId)=> {
        const {game} = this.props;
        const updatedGame = {...game};
        updatedGame.playersData = game.playersData.filter(item => item.playerId !== playerId);
        this.props.updateGame(updatedGame);
    }
    addToBuyIn = (playerId)=> {
        const {game} = this.props;
        const updatedGame = {...game};
        updatedGame.playersData = game.playersData.map(item => {
            if (item.playerId !== playerId){
                return {...item};
            } else{
                return {...item, buyIn: item.buyIn + this.state.buyIn}
            }
        });
        this.props.updateGame(updatedGame);
    }


    addToCashOut = (playerId)=> {
        const {game} = this.props;
        const updatedGame = {...game};
        updatedGame.playersData = game.playersData.map(item => {
            if (item.playerId !== playerId){
                return {...item};
            } else{
                return {...item, cashOut: item.cashOut + this.state.cashOut}
            }
        });
        this.props.updateGame(updatedGame);
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
        const {viewGame: game} = this.props;
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

            const players = playersData.sort((a,b)=> a.balance >b.balance ? -1 : 1).map(playerData=>{
                const onImageError = (ev)=>{
                    if (!ev.target.secondTry){
                        ev.target.secondTry = true;
                        ev.target.src= playerData.imageUrl;
                    }else{
                        ev.target.src=ANON_URL;
                    }
                };
                const playerName = playerData.name;
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
                        <button className="button" onClick={()=>this.props.updateViewGame(null)}> Back</button>
                    </div>

                </div>
            </div>);
        } else{

           return <OnGoingGame group={group} gameId={game.id} game={group.games.find(g=>g.id === game.id)} onBack={()=>this.props.updateViewGame(null)} updateOnProgressGame={this.updateOnProgressGame}/>
        }

    }
    getEditGamePopup = ()=> {

        const {game} = this.props;
        if (!game){
            return <div/>
        }
        if (!this.state.existingPlayerId) {
            const existingPlayerId = this.findPlayerNotInGame(game)
            setTimeout(()=>this.setState({existingPlayerId}),100);
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
        const ready = this.isGameReady(this.props.game);
        return (<div className="popupOuter">
                    <div className="editGamePopupInner">
                        <div>
                            <h1>Edit game:</h1>
                        </div>
                        <hr/>
                        <div>
                            Game date: <input className="editGameInput" min="2010-01-01" max="2050-01-01" type="date" id="gameDate" value={this.props.game.nameAsDatePicker} onChange={(event)=>this.props.updateGame({...this.state.game, nameAsDatePicker: event.target.value})}/>
                        </div>
                        <div>
                            description: <input className="editGameInput"  type="text" id="gameDescription" value={this.props.game.description} onChange={(event)=>this.props.updateGame({...this.props.game, description: event.target.value})}/>
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
                            <button className="button" onClick={()=> this.props.updateGame(null)}> Cancel</button>
                        </div>
                        <div>
                            <h3>{ready ? '' : 'game still not done'}</h3>
                        </div>
                    </div>
                </div>);
    };

    render() {
        const editGamePopup = this.getEditGamePopup();
        const viewGamePopup = this.getViewGamePopup();
        return (
            <div className="gamePage">
                {editGamePopup}
                {viewGamePopup}
            </div>);
    }
}

export default Game;

