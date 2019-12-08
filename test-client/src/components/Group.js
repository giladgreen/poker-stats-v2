import React, { Component } from 'react';
import { ANON_URL } from '../../../config';

import createPlayer from "../actions/createPlayer";
import deletePlayer from "../actions/deletePlayer";
import updateGame from "../actions/updateGame";
import updatePlayer from "../actions/updatePlayer";
import updateGroup from "../actions/updateGroup";
import createGame from "../actions/createGame";
import deleteGame from "../actions/deleteGame";
import getGame from "../actions/getGame";
import Game from "./Game";
import GameData from "./GameData";
import deleteGroup from "../actions/deleteGroup";

class Group extends Component {

    constructor() {
        super();
        this.state = { inGroupEditMode:false, groupName: '',groupDescription:'', newPlayerName:'', newGameDate:(new Date()).AsDatePicker().datePickerToDate().AsDatePicker() ,player:null, buyIn: 50, cashOut: 50};
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
    };

    scrollTop = () => {
        window.scrollTo(0, 0);

    };

    handleNewPlayerNameChange = (event) =>{
        this.setState({newPlayerName: event.target.value});
    };

    handleNewGameDateChange = (event) =>{
        this.setState({newGameDate: event.target.value});
    };

    editPlayer = async (player) => {
        this.setState({player});
        this.scrollTop();
        player ? this.props.disableScroll() : this.props.enableScroll();
    };

    updateGroupData = async ()=>{
        const {group, provider, token} = this.props;
        const { groupName,groupDescription } = this.state;
        const updatedGroup = await updateGroup(group.id, { name: groupName,description: groupDescription }, provider, token);
        this.props.updateGroupNameAndDescription(updatedGroup);
        this.updateInGroupEditMode(false);
    };

    updateGame = async (game) => {
        this.setState({ game });
    };
    updateInGroupEditMode = async (inGroupEditMode) => {
        this.setState({ inGroupEditMode, groupName: this.props.group.name ,groupDescription: this.props.group.description });
        this.scrollTop();
        inGroupEditMode ? this.props.disableScroll() : this.props.enableScroll();
    };
    updateViewGame = async (viewGame) => {
        this.setState({ viewGame });
        this.scrollTop();
        viewGame ? this.props.disableScroll() : this.props.enableScroll();
    };
    viewGame = async (viewGame) => {
        this.setState({viewGame});
        this.scrollTop();
        viewGame ? this.props.disableScroll() : this.props.enableScroll();
    };

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
        return (<div>
            <h1> Create a new game. </h1>
            Game date: <input type="date" id="newGameDate" min="2010-01-01" max="2050-01-01" value={this.state.newGameDate} onChange={this.handleNewGameDateChange}/>

            <button className="button"  onClick={this.createNewGame}> Create </button>
            <br/> <hr/><br/>

        </div>);
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

            const image =  <img alt={playerName} className="playersListImageBig" src={player.imageUrl || ANON_URL}  onError={onImageError} />;
            const balanceWithCurrency = balance > 0 ? `+${balance}₪` : `${balance}₪`;
            return (<div className={`playersListItem ${player.userConnected ? 'connectedUser' : ''} col-xs-1`} key={`player_${player.id}`}>
                    {image}
                    <div className="paddingLeft">
                        <h3> {playerName}</h3>
                        <div className={balance >0 ? 'balanceWithCurrencyPositive' : 'balanceWithCurrencyNegative'} >
                            <h2>{balanceWithCurrency}</h2>
                        </div>
                        <div>
                            <h2>{gamesCount} games</h2>
                        </div>
                        <div>
                            {editPlayerButton} {deletePlayerButton}
                        </div>
                    </div>

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

            return (<div className={`col-xm-1 gamesListItem ${ready ? 'gamesListItemReady': 'gamesListItemNotReady'}`} key={`games_${game.id}`}>
                <h3> {date.AsGameName()} </h3>
                <h3> {description && description.length>0 ? ` - ${description}`:''} </h3>
                <h4> {playersData.length} players </h4>
                <div> {editGameButton}{deleteGameButton} {viewGameButton}</div>
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
    };

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
            });
            this.props.updateGroup(groupClone);
        } catch (e) {
            this.props.onFailure(e);

        }
    };

    getEditGroupPopup = ()=> {
        const {inGroupEditMode} = this.state;
        if (!inGroupEditMode){
            return <div/>
        }
        return (<div className="popupOuter">
            <div className="editGroupPopupInner">
                <div><h1>Edit Group:</h1></div>
                <hr/>
                <div  className="editGroupInputDiv">
                    Group name: <input className="editGroupInput" type="text" id="groupName" value={this.state.groupName} onChange={(event)=>this.setState({groupName: event.target.value})}/>
                </div>
                <div  className="editGroupInputDiv">
                    Group Description: <input className="editGroupInput"  type="text" id="groupDescription" value={this.state.groupDescription} onChange={(event)=>this.setState({groupDescription: event.target.value})}/>
                </div>
                <div>
                    <button className="button saveButton" onClick={this.updateGroupData}> Save</button>
                    <button className="button" onClick={()=>this.updateInGroupEditMode(false)}> Cancel</button>

                </div>
            </div>
        </div>);
    };
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
    };

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
    };

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
    };

    isGameReady = (game)=>{
        const totalBuyIn = game.playersData.map(pd=>pd.buyIn).reduce((total, num)=>  total + num, 0);
        const totalCashOut =game.playersData.map(pd=>pd.cashOut).reduce((total, num)=>  total + num, 0);
        const ready = totalBuyIn === totalCashOut && game.playersData.length >1;
        return ready;
    };

    createPlayersDataAsFakeGame = () => {
        const isMobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

        const max = isMobile ? 7 : 11;
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

    deleteGroupById = async (groupId) => {
        console.log('groupId',groupId)
        if (confirm("Are you sure?")){
            try{
                await deleteGroup(groupId, this.props.provider, this.props.token);
                console.log('this.props.groups',this.props.groups)
                const groupsClone = [...this.props.groups].filter(group => group.id !== groupId);
                this.props.updateGroups(groupsClone);
                this.props.backToMainPage();
            }catch(error){
                console.error('createNewGroup error',error);
                this.props.onFailure(error);
            }
        }

    };

    render() {
        const {group, provider, token } = this.props;
        const {isAdmin} = group;
        const {game, viewGame} = this.state;
        const fakeGameData = this.createPlayersDataAsFakeGame();
        const editGroupPopup = this.getEditGroupPopup();
        const editPlayerPopup = this.getEditPlayerPopup();
        const gamePopup = <Game disableScroll={this.props.disableScroll} enableScroll={this.props.enableScroll} game={game} viewGame={viewGame} group={group} provider={provider} token={token}  updateGroup={this.props.updateGroup} onFailure={this.props.onFailure} updateGame={this.updateGame} updateViewGame={this.updateViewGame}/>;
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
                    <h1> <b><u>{group.name} </u></b></h1>
                    <h2>  {group.description}   </h2>
                    {isAdmin ? <h3>logged in as admin</h3> : <div/>}
                    {isAdmin ? <button className="button green-button" onClick={()=>this.updateInGroupEditMode(true)}> edit group </button> : <div/>}
                    {isAdmin ? <button className="button red-button" onClick={()=>this.deleteGroupById(group.id)}> delete group </button> : <div/>}
                </div>
                <div>
                    <GameData Group={group} Game={fakeGameData} IsGroupSummary={true}/>
                </div>
                <div>
                    {newGameSection}
                    <h2><u>{group.games.length} games</u></h2>
                    <div className="groupGamesList row">
                        {games}
                    </div>
                </div>
                <hr/>
                <div>
                    {newPlayerSection}
                    <h2>  {group.players.length} players</h2>
                    <div className="groupPlayersList row">
                        {players}
                    </div>
                </div>
                {editGroupPopup}
                {editPlayerPopup}
                {gamePopup}
            </div>);

    }
}

export default Group;

