/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable jsx-a11y/img-has-alt */
import React, { Component } from 'react';
import 'react-input-range/lib/css/index.css';
import OnGoingGame from "./OnGoingGame";
import GameSummary from "./GameSummary";
import NewGameForm from "./NewGameForm";
import createGame from "../actions/createGame";
import updateGame from "../actions/updateGame";
import EditGameForm from "./EditGameForm";
import ShowAlert from '../containers/ShowAlert';
import ShowErrorAlert from '../containers/ShowErrorAlert';
const isMobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

class GamesTab extends Component {

    getImage=()=>{

        this.imageIndex++;

        if (this.imageIndex > this.imagesCount) {
            this.imageIndex = 1;
        }
        return `backgroundImage${this.imageIndex}.jpg`;
    };

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

    constructor(props) {
        super(props);
        this.imageIndex = 0;
        this.imagesCount = 7;
        this.backgroundImage = `url(${props.group.imageUrl ||  `poker.jpg`})`;
        this.state = { newGame: null, editGame: null, gameSummary: null, showErrorOnDeleteGame: null, showSuccessDeleteGame: null };

        setTimeout(()=>{
            props.setClearAll(this.clearAll);
        },100)

    }

    clearAll = () =>{
        this.setState({newGame: null, editGame: null, gameSummary: null})
    }

    showCreateGame = () =>{
        const str = ((new Date()).toISOString()).substring(0,10)
        this.setState({ newGame: { date:str, description: 'Hosted by ..'} })
    };

    closeCreateGameForm = () =>{
        this.setState({ newGame: null })
    };

    closeEditGameForm = () =>{
        this.setState({ editGame: null })
    };

    handleEditGameDateChange = (event) =>{
        const editGame = { ...this.state.editGame, date: event.target.value };
        this.setState({editGame});
    };

    handleEditGameDescriptionChange = (event) =>{
        const editGame = { ...this.state.editGame, description: event.target.value };
        this.setState({editGame});
    };

    handleNewPlayerChange = (existingPlayerId)=> {
        this.setState({existingPlayerId});
    };

    onGameEditClick = (game)=>{
        const editGame = {...game}
        editGame.date = typeof game.date === 'string' ? game.date.substr(0,10) : ((game.date).toISOString()).substring(0,10);
        const existingPlayerId = this.findPlayerNotInGame(editGame);

        this.setState({editGame, existingPlayerId});
    };

    showGameData = (game) =>{
        this.setState({ gameSummary: game })
    };

    updateOnProgressGame = ()=>{
        if (!this.state.gameSummary){
            return;
        }
        const {group, getGame, provider, token} = this.props;
        const onGoingGameId = this.state.gameSummary.id;
        getGame(group.id, onGoingGameId, provider, token).then((gameSummary)=>{
            gameSummary.date = new Date(gameSummary.date);
            this.setState({gameSummary});
        })
    };

    deleteSelectedGame = ()=>{
        if (confirm("Are you sure?")){
            try{
                const { group, provider, token, remoteDeleteGame, removeGroupGame } = this.props;
                const gameId = this.state.gameSummary.id;
                remoteDeleteGame(group.id, gameId, provider, token).then(()=>{
                    this.setState({ newGame: null, editGame: null, gameSummary:null, showErrorOnDeleteGame: null, showSuccessDeleteGame: true});
                    setTimeout(()=>{
                        this.setState({ showErrorOnDeleteGame: null, showSuccessDeleteGame: null});
                        removeGroupGame(gameId);
                    },100)
                }).catch((e)=>{
                    this.setState({ showErrorOnDeleteGame: true, showSuccessDeleteGame: null});
                    setTimeout(()=>{
                        this.setState({ showErrorOnDeleteGame: null, showSuccessDeleteGame: null});
                    },100)
                })
            }catch(error){
                console.error('deleteSelectedGame error', error);
            }
        }
    };

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

    isGameReady = (game)=>{
        const totalBuyIn = game.playersData.map(pd=>pd.buyIn).reduce((total, num)=>  total + num, 0);
        const totalCashOut =game.playersData.map(pd=>pd.cashOut).reduce((total, num)=>  total + num, 0);
        const diff = totalBuyIn - totalCashOut;
        const ready = diff === 0 && game.playersData.length >1;
        return { ready, diff };
    };

    getGamePot = (game)=>{
        return game.playersData.reduce((all, one)=>{
            return all + one.buyIn;
        }, 0);
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

    render(){

        const { group } = this.props;
        const {games} = group;

        if (this.state.newGame){
            return <NewGameForm group={group}
                                close={this.closeCreateGameForm}
                                newGame={this.state.newGame}
                                remoteCreateGame={createGame}
                                updateGroupGame={this.props.updateGroupGame}
                                user={this.props.user}
                                provider={this.props.provider}
                                token={this.props.token} />
        }
        if (this.state.editGame){
            return <EditGameForm editGame={this.state.editGame}
                                 group={group}
                                 close={this.closeEditGameForm}
                                 remoteUpdateGame={updateGame}
                                 updateGroupGame={this.props.updateGroupGame}
                                 updateImage={this.props.updateImage}
                                 user={this.props.user}
                                 provider={this.props.provider}
                                 token={this.props.token}
            />;
        }

        if (this.state.gameSummary){
            const game = this.state.gameSummary;
            const { ready } = this.isGameReady(game);
            if (ready) return this.getGamesSummary();
            return <OnGoingGame deleteSelectedGame={this.deleteSelectedGame}
                                updateImage={this.props.updateImage}
                                group={group}
                                user={this.props.user}
                                gameId={game.id}
                                game={game}
                                onBack={()=>this.setState({gameSummary: null})}
                                updateOnProgressGame={this.updateOnProgressGame}
                                onGameEditClick={()=>this.onGameEditClick(game)}/>


        }

        const GAMES = games.sort((a,b)=> a.date > b.date ? -1 : 1).map((game,index) => {
            const { ready } = this.isGameReady(game);
            const pot = this.getGamePot(game);
            const style = {
                backgroundImage: `url(${game.imageUrl || this.getImage()})`,
                borderRadiusTop: '50px',
            };

            const playersData = game.playersData.map(data => ({ playerId: data.playerId, bottomLine: data.cashOut - data.buyIn }));
            let mvp, mvpPlayerData, mvpName, mvpBalance, mvpImageUrl;
            if (playersData && playersData.length){
                mvp = playersData.reduce(function(a, b) {
                    return a.bottomLine > b.bottomLine ? a : b;
                });
                mvpPlayerData = group.players.find(p=>p.id === mvp.playerId);
                mvpName = mvpPlayerData ?
                    mvpPlayerData.name ? mvpPlayerData.name : ( mvpPlayerData.firstName ? `${mvpPlayerData.firstName} ${mvpPlayerData.familyName}` : null)
                    : null;
                mvpBalance = `+${mvp.bottomLine}`;
                mvpImageUrl = mvpPlayerData ? mvpPlayerData.imageUrl : null;
                if (mvpImageUrl && !game.imageUrl){
                    style.backgroundImage = `url(${mvpImageUrl}), url(${this.getImage()})`
                    style.backgroundSize = isMobile ? '60px 100px, cover': '160px 280px, cover'
                    style.backgroundRepeat = 'no-repeat, repeat'
                    style.backgroundPosition = 'right top'
                    style.backgroundBlendMode = 'luminosity, normal'
                }
            }



            return (
                <div key={game.id}
                     className={`game-item-div ${ready?'':'game-item-div-not-ready'}`}
                     onClick={()=>this.showGameData(game)}

                >
                    <div key={game.id} className="game-item-div-inner" style={style}>
                        <div><b>{this.gameDateToString(game) }</b></div>
                        <div className="group-description">{game.description } </div>
                        <div className="my-group">{pot} in pot</div>

                    </div>

                    <div className="game-extra-data">

                        <div > {game.playersData.length } players </div>
                        <div className='game-not-ready-text' >{ready ? '' : 'GAME NOT READY'} </div>
                        <div className='game-mvp-text' >
                            {ready && mvpPlayerData && mvpName ?
                                <span>
                                    <b>MVP</b>
                                    {isMobile ? <div></div> : <span></span>}
                                    <img src={mvpImageUrl} className="game-mvp"/>

                                    {mvpName} {mvpBalance}
                                </span>

                                : <span></span>}

                        </div>
                    </div>
                </div>
            );

        });
        const { showErrorOnDeleteGame, showSuccessDeleteGame } = this.state;
        return (<div id="all-games-div" >
            <div className="row">
                <div className="col-xs-6">
                    <div className="game-item-div" onClick={this.showCreateGame}>

                        <img src="plus.png" className="game-item-div-plus-sign"/>
                    </div>
                </div>

                {GAMES}
                { showErrorOnDeleteGame && <ShowErrorAlert message={"failed to remove game"}/>}

                { showSuccessDeleteGame && <ShowAlert message={"game was removed"}/>}

            </div>
        </div>)

    }
}

export default GamesTab;
