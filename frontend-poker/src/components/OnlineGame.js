/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable jsx-a11y/img-has-alt */
import React, { Component } from 'react';
import 'react-input-range/lib/css/index.css';
import getGame from '../actions/getGame';
import createGame from '../actions/createGame';
import updateGame from '../actions/updateGame';
import deleteGame from '../actions/deleteGame';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuIcon from '@material-ui/icons/Menu';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import GameData from './GameData';
import GameSummary from './GameSummary';
import ImagesTab from './ImagesTab';
import ImageUploader from './ImageUploader';
import GamesTab from './GamesTab';
import PlayersTab from "./PlayersTab";

const SECOND = 1000;
const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

class OnlineGame extends Component {

    constructor(props) {
        super(props);
        const game = {
            startDate: new Date(),
            smallBlind: 0.5,
            bigBlind: 1,
            time: 10,
            board:[],
            pot: 5.5,
            timer: 10,
            players: [{
                name: "Gilad",
                balance: 300,
                cards: ['6C','9S'],
                active: true
            },{
                name: "Saar",
                balance: 50
            },{
                name: "Ran",
                balance: 400,
                dealer:true
            },{
                name: "Bar",
                balance: 180,
                pot:0.5,
                status: 'small',
                small: true,
            },{
                name: "Hagai",
                balance: 25,
                status: 'big',
                pot:1,
                big: true
            },{
                name: "Michael",
                balance: 120,
                cards: ['KC','KS'],
                status: 'call',
                pot:1
            },{
                name: "Ori",
                balance: 90,
                status: 'raise',
                pot:3
            },{
                name: "Tal",
                balance: 45,
                status:'fold'
            }]
        }

        const gameTime = this.getGameTime(game.startDate);
        this.state = { game, gameTime }

        setInterval(()=>{
            const gameTime = this.getGameTime(this.state.game.startDate);
            this.setState({ gameTime});
        },1000)

        setInterval(()=>{
            const game = this.getGameClone();
            game.timer = game.timer - 0.05;
            if (game.timer < 0){
                game.timer = game.time;
            }
            this.setState({ game});
        },50)

       this.mock();

    }

    getGameClone = ()=>{
        const game = { ...this.state.game, players: [...this.state.game.players] };
        return game;
    }
    mock = ()=>{
        setInterval(()=>{
            const game = this.getGameClone();
            const activeIndex = this.getActiveIndex(game.players);
            const newActiveIndex = activeIndex + 1 > game.players.length - 1 ? 0 : activeIndex + 1;

            game.players[activeIndex].active = false;
            game.players[newActiveIndex].active = true;
            this.setState({ game});
        },10000)
    }

    getActiveIndex(players){
        let index = -1;
        players.forEach((player,i)=>{
            if (player.active){
                index = i;
            }
        })

        return index;

    }
    getGameTime = (startDate) =>{
        const diff = (new Date()).getTime() - startDate.getTime();
        const totalSeconds =  Math.floor(diff / SECOND);
        const days = Math.floor(totalSeconds / DAY);
        let reminder = totalSeconds - days * DAY;
        const hours = Math.floor(reminder / HOUR);
        reminder -=  hours * HOUR;
        const minutes =  Math.floor(reminder / MINUTE);
        const seconds = reminder - minutes * MINUTE;

        const result = {
            days: days>9 ? `${days}` : `0${days}`,
            hours:hours>9 ? `${hours}` : `0${hours}`,
            minutes:minutes>9 ? `${minutes}` : `0${minutes}`,
            seconds:seconds>9 ? `${seconds}` : `0${seconds}`,
        };
        return `${result.days}:${result.hours}:${result.minutes}:${result.seconds}`;
    }
    render() {

        //const { group } = this.props;
        const gameTime = this.state.gameTime;
        const playerInfoWidth = 6.2;
        const currentTimerTime =  this.state.game.timer;
        const timerWidth =  `${((currentTimerTime / this.state.game.time) * playerInfoWidth)}vw`;
        return (
            <div id="online-game-tab" className="group-page">
                <div id="clock">{gameTime}</div>
                <img id="table-image" src="table.png" />

                {this.state.game.players.map((player,index)=>{
                    const card1 = player.cards ? `./cards/${player.cards[0]}.png` : './cards/back.png';
                    const card2 = player.cards ? `./cards/${player.cards[1]}.png` : './cards/back.png';
                    return  <div key={`player_${index}`} id={`player${index+1}`} className={`player ${player.active ? 'active-player' : ''}`}>
                        <div className="player-div">
                            <img className={`card left-card card1`} src={card1} />
                            <img className={`card right-card card2`} src={card2} />
                            <div className="player-info" >
                                <div className="player-name">
                                    {player.name}
                                </div>
                                <div className="player-balance">
                                    {player.balance}
                                </div>
                                { player.active && <div id="active-timer-div">
                                    <div id="active-timer" style={{width: timerWidth}}> </div>
                                </div>}

                            </div>
                            { player.dealer && <div id="dealer-button" className="button"> D </div>}
                            { player.small && <div id="small-blind-button" className="button"> SB </div>}
                            { player.big && <div id="big-blind-button" className="button"> BB </div>}
                        </div>
                    </div>
                })}



            </div>
        );

    }
}

export default OnlineGame;

