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

const mockGame = {
    startDate: new Date(),
    smallBlind: 0.5,
    bigBlind: 1,
    time: 10,
    board:['6H','7C', 'KD'],
    pot: 5.5,
    timer: 10,
    players: [{
        name: "Gilad",
        balance: 300,
        cards: ['6C','9S'],
        active: true,    pot:211,  status: 'bla',
    },{
        name: "Saar",
        balance: 50, pot:211, status: 'bla',
    },{
        name: "Ran",
        balance: 400,
        dealer:true, pot:211, status: 'bla',
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
        pot:30
    },{
        name: "Tal",
        balance: 45,
        status:'fold', pot:211,

    }]
}


class OnlineGame extends Component {

    constructor(props) {
        super(props);
        console.log('### gameId=', props.gameId)

        const game = {

        }
        const gameTime = 'game not started yet';
        this.state = { game, gameTime, communityCards:[] }

        // setInterval(()=>{
        //     const gameTime = this.getGameTime(this.state.game.startDate);
        //     this.setState({ gameTime});
        // },1000)
        setTimeout(()=>{
            const game = mockGame;

            const communityCards = game.board || [];
            communityCards[0] = communityCards[0] ? `./cards/${communityCards[0]}.png` : './cards/back.png';
            console.log('communityCards[0]',communityCards[0])
            communityCards[1] = communityCards[1] ? `./cards/${communityCards[1]}.png` : './cards/back.png';
            communityCards[2] = communityCards[2] ? `./cards/${communityCards[2]}.png` : './cards/back.png';
            communityCards[3] = communityCards[3] ? `./cards/${communityCards[3]}.png` : './cards/back.png';
            communityCards[4] = communityCards[4] ? `./cards/${communityCards[4]}.png` : './cards/back.png';

            game.startDate=new Date();
            const gameTime = this.getGameTime(game.startDate);
            this.setState({ game, gameTime, communityCards});
            setInterval(()=>{
                const gameTime = this.getGameTime(this.state.game.startDate);
                this.setState({ gameTime});
            },1000)

            this.mock();
        },2000)

        // this.mock();

    }

    getGameClone = ()=>{
        const game = { ...this.state.game, players: [...this.state.game.players] };
        return game;
    }
    mock = ()=>{
        setInterval(()=>{
            const game = this.getGameClone();
            game.timer = game.timer - 0.05;
            if (game.timer < 0){
                game.timer = game.time;
            }
            this.setState({ game});
        },50)
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



        const {communityCards} = this.state;
        const gameTime = this.state.gameTime;
        const currentTimerTime =  this.state.game.timer;
        const pres = (100 * currentTimerTime / this.state.game.time).toFixed(0) - 5;
        const activeTimerStyle = {
            "background":  `linear-gradient(to right,green 0% ${pres-25}%,red ${pres}% 100%)`,
        }
        return (
            <div id="online-game-screen" >
                <div id="clock">{gameTime}</div>
                <img id="table-image" src="table.png" />

                {this.state.game.players && this.state.game.players.map((player,index)=>{
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


                            </div>
                            { player.dealer && <div id="dealer-button" className="button"> D </div>}
                            { player.small && <div id="small-blind-button" className="button"> SB </div>}
                            { player.big && <div id="big-blind-button" className="button"> BB </div>}

                            {player.pot && <div id={`player${index+1}-pot`} className="player-pot">{player.pot}</div>}
                            {player.status && <div  className="player-status">{player.status}</div>}

                            { player.active && <div id="active-timer-div" style={activeTimerStyle}/>}
                        </div>

                    </div>
                })}

                <div id="community-pot">
                   1250
                </div>
                <div id="community-cards">
                    <img id="community-card-1" className="community-card" src={communityCards[0]} />
                    <img id="community-card-2" className="community-card" src={communityCards[1]} />
                    <img id="community-card-3" className="community-card" src={communityCards[2]} />
                    <img id="community-card-4" className="community-card" src={communityCards[3]} />
                    <img id="community-card-5" className="community-card" src={communityCards[4]} />
                </div>
                <div id="buttons">
                    <div id="fold-button" className="big-button"> Fold </div>
                    <div id="call-button" className="big-button"> Call </div>
                    <div id="raise-button" className="big-button"> Raise </div>
                </div>

            </div>
        );

    }
}

export default OnlineGame;

