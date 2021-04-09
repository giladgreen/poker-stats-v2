/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable jsx-a11y/img-has-alt */
import React, { Component } from 'react';
import GameData from './GameData';
import WhoOwesWho from '../containers/WhoOwesWho';
import CONSTS from '../CONSTS';
import GrayBubbleButton from '../containers/GrayBubbleButton';
import RedBubbleButton from '../containers/RedBubbleButton';
const { ANON_URL } = CONSTS;
class GamePage extends Component {

    showWhoOwesWho = ()=>{
        this.setState({ shouldShowWhoOwesWho: !this.state.shouldShowWhoOwesWho })
    }
    constructor(props){
        super(props);
        const { group, game } = props;
        const { isAdmin} = group;
        console.log('group',group);
        console.log('game',game);
        this.state = {shouldShowWhoOwesWho: false}

        const gamePlayersData =  game.playersData.map(player=>{
            const data =  group.players.find(p=> p.id === player.playerId);
            return {
                id: player.playerId,
                name: data.name,
                imageUrl: data.imageUrl,
                cashOut: player.cashOut,
                buyIn: player.buyIn,
                balance:  player.cashOut -  player.buyIn
            }
        }).sort((a,b)=> a.name < b.name ? -1 : 1).map(((player,index) =>{

            const onImageError = (ev)=>{
                if (!ev.target.secondTry){
                    ev.target.secondTry = true;
                    ev.target.src= player.imageUrl;
                }else{
                    ev.target.src=ANON_URL;
                }
            };
            return (<div className="gamePlayerData col-xs-11 col-lg-2 row" key={`gamePlayerData${player.id}`}>
                <div  className="col-xs-3">
                    <img alt={player.name} className="gamePlayerDataImage" src={player.imageUrl || ANON_URL}  onError={onImageError} />
                </div>
                <div  className="col-xs-8">
                    <div>
                        { player.name}
                    </div>
                    <div>
                        buy-in: {player.buyIn}
                    </div>
                    <div>
                        cash-out: {player.cashOut}
                    </div>
                    <div>
                        bottom-line: {player.balance}
                    </div>
                </div>

            </div>);
        }))
        this.game = game;
        this.gamePlayersData = gamePlayersData;
        this.isAdmin = isAdmin;
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

        return `${day}/${month}/${year}`;
    }
    render(){
        const group = this.props.group;
        const game = this.game;
        const gamePlayersData = this.gamePlayersData;
        const isAdmin = this.isAdmin;

        return (
            <div id="gameSummary">
                <div id="gameSummaryHeader">
                    <GrayBubbleButton onClick={this.props.back} className="button">Back</GrayBubbleButton>
                    <div>
                        <b><u>Game summary</u></b>
                    </div>
                    <div>
                        Date: {this.gameDateToString(game)}
                    </div>
                    <div>
                        {game.description}
                    </div>
                    <div>
                        Pot size:  {this.getGamePot(game)}
                    </div>
                </div>

                <GameData group={group} game={game} />

                {isAdmin && <GrayBubbleButton onClick={this.props.edit} className="button left-margin">Edit</GrayBubbleButton>}
                {isAdmin && <RedBubbleButton onClick={this.props.delete} className="button left-margin">Delete</RedBubbleButton>}
                <GrayBubbleButton onClick={this.showWhoOwesWho} className="button left-margin"> {this.state.shouldShowWhoOwesWho ? 'Hide' :'Show'} Who Owes Who</GrayBubbleButton>
                { this.state.shouldShowWhoOwesWho && <WhoOwesWho group={group} game={game} /> }
                <div className="more-data-text"><u>more data:</u></div>
                <div id="gamePlayersData" className="row">

                    {gamePlayersData}
                </div>


            </div>
        );
    }
}

export default GamePage;
