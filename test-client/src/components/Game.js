import React, { Component } from 'react';
import { ANON_URL } from '../../../config';
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css';
import updateGame from "../actions/updateGame";
import getGame from "../actions/getGame";
import OnGoingGame from "./OnGoingGame";
import GameData from "./GameData";

class Game extends Component {

    constructor() {
        super();
        this.state = { buyIn: { min: 0, max: 10000 },cashOut: { min: 0, max: 10000 }, playerId: null};
    }

    updateSelectedGamePlayerData = async()=>{
        const {game} = this.props;
        const updatedGame = {...game};
        updatedGame.playersData = game.playersData.map(item => {
            if (item.playerId !== this.state.playerId){
                return {...item};
            } else{
                return {...item, buyIn: this.state.buyIn, cashOut: this.state.cashOut};
            }
        });
        this.props.updateGame(updatedGame);
        this.editGamePlayer(null);
    };
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
    };

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
    };

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

    };

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
    };

    editGamePlayer = (playerId)=> {
        const {game} = this.props;
        if (game && playerId){
            const playerData = game.playersData.find(p=>p.playerId===playerId);
            this.setState({playerId, buyIn: playerData.buyIn,cashOut: playerData.cashOut });
            this.props.disableScroll();
        } else{
            this.setState({playerId});
            this.props.enableScroll();
        }
    };
    movePlayerToEnd = (playerId)=> {
        const {game} = this.props;
        const updatedGame = {...game};
        const player = game.playersData.find(item=>item.playerId === playerId);
        updatedGame.playersData = game.playersData.filter(item => item.playerId !== playerId).sort((a,b)=>a.index<b.index ? -1 : 1).map((item, index)=>{
            return {
                ...item, index
            }
        });
        updatedGame.playersData.push({...player,  index: updatedGame.playersData.length });
        this.props.updateGame(updatedGame);

    };
    removePlayerFromGame = (playerId)=> {
        if (confirm("Are you sure?")){
            const {game} = this.props;
            const updatedGame = {...game};
            updatedGame.playersData = game.playersData.filter(item => item.playerId !== playerId).sort((a,b)=>a.index<b.index ? -1 : 1).map((item, index)=>{
                return {
                    ...item, index
                }
            });
            this.props.updateGame(updatedGame);
        }
    };


    handleNewPlayerChange = (existingPlayerId)=> {
        this.setState({existingPlayerId});
    };

    isGameReady = (game)=>{
        const totalBuyIn = game.playersData.map(pd=>pd.buyIn).reduce((total, num)=>  total + num, 0);
        const totalCashOut =game.playersData.map(pd=>pd.cashOut).reduce((total, num)=>  total + num, 0);
        const diff = totalBuyIn - totalCashOut;
        const ready = diff === 0 && game.playersData.length >1;
        return { ready, diff };
    };
    getViewGamePopup = ()=> {
        const {playerId} = this.state;
        if (playerId){
            return <div/>;
        }
        const {viewGame: game} = this.props;
        if (!game){
            return <div/>
        }
        const {group} = this.props;
        const PLAYERS = {};
        group.players.forEach(player=>{
            PLAYERS[player.id] = player;
        });

        const { ready } = this.isGameReady(game);
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
                   <div className="row">
                       <div className="col-xs-4">
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
                        <div className="col-xs-8">
                            <GameData Group={group} Game={game} />
                        </div>
                   </div>

                </div>
            </div>);
        } else{

           return <OnGoingGame group={group} gameId={game.id} game={group.games.find(g=>g.id === game.id)} onBack={()=>this.props.updateViewGame(null)} updateOnProgressGame={this.updateOnProgressGame}/>
        }

    };
    getEditPlayerPopup = ()=> {
        const {playerId} = this.state;
        const {game, group} = this.props;
        if (!game || !playerId) return <div/>;

        const player = group.players.find(p=>p.id===playerId);

        const onImageError = (ev)=>{
            if (!ev.target.secondTry){
                ev.target.secondTry = true;
                ev.target.src= player.imageUrl;
            }else{
                ev.target.src=ANON_URL;
            }
        };

        const image = <img alt={player.name} className="playersListImage" src={player.imageUrl || ANON_URL}  onError={onImageError} /> ;
        const currentPlayerData = game.playersData.find(d=>d.playerId===this.state.playerId);
        const currentPlayerBuyIn = currentPlayerData.buyIn;
        const currentPlayerCashOut = currentPlayerData.cashOut;
        const maxBuyInRange = currentPlayerBuyIn+300;
        const maxCashOut = game.playersData.map(data=> data.buyIn - data.cashOut).reduce((all,item)=>(all+item),0);

        const maxCashOutRange = currentPlayerCashOut + maxCashOut;

        return (<div className="popupOuter">
                    <div className="editGamePlayerPopupInner">
                        <div>
                            <h2>edit player game data:</h2>
                            <h1>{image}{player.name}</h1>
                        </div>
                        <hr/>
                        <div>
                            buy-in:   <input className="editPlayerInput" type="number"  id="buyIn" value={this.state.buyIn} onChange={(event)=>this.setState({buyIn: parseInt(event.target.value)})}/> <button className="button saveButton" onClick={()=>this.setState({ buyIn: this.state.buyIn + 10 })}> +10 </button>
                            <br/>
                            <br/>
                            <InputRange className="InputRange"
                                step={10}
                                formatLabel={value => `${value}₪`}
                                maxValue={maxBuyInRange}
                                minValue={0}
                                value={this.state.buyIn}
                                onChange={buyIn => this.setState({ buyIn })} />

                            <br/>
                            <br/>  <br/>
                            <br/>
                        </div>
                        <div>
                            cash-out:  <input className="editPlayerInput" type="number"  id="cashOut" value={this.state.cashOut} onChange={(event)=>this.setState({cashOut: parseInt(event.target.value)})}/>  <button className="button saveButton" onClick={()=>this.setState({ cashOut: this.state.cashOut + 10 })}> +10 </button>
                            <br/>
                            <br/>
                            <InputRange className="InputRange"
                                step={10}
                                formatLabel={value => `${value}₪`}
                                maxValue={maxCashOutRange}
                                minValue={0}
                                value={this.state.cashOut}
                                onChange={cashOut => this.setState({ cashOut })} />

                        </div>
                        <div>
                            <br/> <br/>
                            balance: {this.state.cashOut - this.state.buyIn}
                        </div>
                        <div>
                            <button className="button saveButton" onClick={this.updateSelectedGamePlayerData}> Save</button>
                            <button className="button" onClick={()=> this.editGamePlayer(null)}> Cancel</button>
                        </div>
                    </div>
                </div>);
    };
    getEditGamePopup = ()=> {

        const {playerId} = this.state;
        if (playerId){
            return <div/>;
        }
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
                <button className="button" onClick={()=>this.editGamePlayer(playerData.playerId)}> edit </button>
                {image}
                {playerName} |
                buy-in: {playerData.buyIn} |
                cash-out: {playerData.cashOut} |
                balance: {playerData.cashOut - playerData.buyIn}
                <button className="button" onClick={()=>this.movePlayerToEnd(playerData.playerId)}> V </button>
                <button className="button" onClick={()=>this.removePlayerFromGame(playerData.playerId)}> remove </button>

            </div>);
        });

        const comboVals = group.players.filter(player => !GAME_PLAYERS[player.id]).map(player =>
            (
                <option key={`_comboVals_${player.id}`} value={player.id}>
                    { player.name }
                </option>
            )
        );
        const { ready, diff } = this.isGameReady(this.props.game);
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
                            <br/>
                            <h3>{ready ? '' : `game still not done (${diff>0 ? diff : -1*diff} ${diff>0 ? 'still in pot':'missing from pot'}).`}</h3>
                        </div>
                    </div>
                </div>);
    };

    render() {
        const editPlayerPopup = this.getEditPlayerPopup();
        const editGamePopup = this.getEditGamePopup();
        const viewGamePopup = this.getViewGamePopup();
        return (
            <div className="gamePage">
                {editPlayerPopup}
                {editGamePopup}
                {viewGamePopup}
            </div>);
    }
}

export default Game;

