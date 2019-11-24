import React, { Component } from 'react';
import { ANON_URL } from '../../../config';

import createPlayer from "../actions/createPlayer";
import deletePlayer from "../actions/deletePlayer";
import updateGame from "../actions/updateGame";
import updatePlayer from "../actions/updatePlayer";
import createGame from "../actions/createGame";
import deleteGame from "../actions/deleteGame";
import getGame from "../actions/getGame";
import Game from "./Game";

class Group extends Component {

    constructor() {
        super();
        this.state = { newPlayerName:'', newGameDate:(new Date()).AsDatePicker().datePickerToDate().AsDatePicker() ,player:null, buyIn: 50, cashOut: 50};
    }

    updateOnProgressGame = async()=>{
        const {group} = this.props;
        const onGoingGameId = this.state.viewGame.id;
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

    updateGame = async (game) => {
        this.setState({ game });
    }
    updateViewGame = async (viewGame) => {
        this.setState({ viewGame });
    }
    viewGame = async (game) => {
        this.setState({viewGame: game});
        this.scrollTop();
    }

    editGame = async (game) => {
        this.setState({game});
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
            newPlayer.gamesCount = 0;
            newPlayer.balance = 0;
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
        const {players, isAdmin} = group;
        return players.map(player=>{
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
            updatedPlayer.balance = player.balance;
            updatedPlayer.gamesCount = player.gamesCount;
            const groupClone = {...this.props.group};
            groupClone.players = groupClone.players.map(playerItem=>{
                if (playerId!==playerItem.id){
                    return playerItem;
                } else{
                    return updatedPlayer;
                }
            });
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
                        <div  className="editPlayerInputDiv">
                            Player name: <input className="editPlayerInput" type="text" id="playerName" value={this.state.player.name} onChange={(event)=>this.editPlayer({...this.state.player, name: event.target.value})}/>
                        </div>
                        <div  className="editPlayerInputDiv">
                            Player email: <input className="editPlayerInput"  type="text" id="playerEmail" value={this.state.player.email} onChange={(event)=>this.editPlayer({...this.state.player, email: event.target.value})}/>
                        </div>
                        <div  className="editPlayerInputDiv">
                            Player image: <input className="editPlayerInput"  type="text" id="playerImage" value={this.state.player.imageUrl} onChange={(event)=>this.editPlayer({...this.state.player, imageUrl: event.target.value})}/>

                        </div>
                        <div>
                            <img alt={this.state.player.name} className="editPlayerImage" src={ this.state.player.imageUrl} />
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

    isGameReady = (game)=>{
        const totalBuyIn = game.playersData.map(pd=>pd.buyIn).reduce((total, num)=>  total + num, 0);
        const totalCashOut =game.playersData.map(pd=>pd.cashOut).reduce((total, num)=>  total + num, 0);
        const ready = totalBuyIn === totalCashOut && game.playersData.length >1;
        return ready;
    }

    render() {
        const {group, provider, token } = this.props;
        const {isAdmin} = group;
        const {game, viewGame} = this.state;

        const editPlayerPopup = this.getEditPlayerPopup();
        const gamePopup = <Game game={game} viewGame={viewGame} group={group} provider={provider} token={token}  updateGroup={this.props.updateGroup} onFailure={this.props.onFailure} updateGame={this.updateGame} updateViewGame={this.updateViewGame}/>;
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
                <div>
                    {newGameSection}
                    <h2><u>{group.games.length} games</u></h2>
                    <div className="groupGamesList">
                        {games}
                    </div>
                </div>
                <hr/>
                <div>
                    {newPlayerSection}
                    <h2>  {group.players.length} players</h2>
                    <div className="groupPlayersList">
                        {players}
                    </div>
                </div>
                {editPlayerPopup}
                {gamePopup}
            </div>);

    }
}

export default Group;

