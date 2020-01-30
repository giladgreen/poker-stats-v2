import React, { Component } from 'react';
import {LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const SmartPhone = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

const body = document.getElementsByTagName('body')[0];
const windowWidth = window.innerWidth || document.documentElement.clientWidth || body.clientWidth;
const Width = windowWidth;

console.log('Width',Width)
import CONSTS from '../CONSTS';
const { ANON_URL } = CONSTS;

class PlayerSummary extends Component {

    render() {
        const player = this.props.player;
        const group = this.props.group;
        const { isAdmin} = group;
        const playerId = player.id;

        const playerGames = group.games.map(game => {
            const playerData = game.playersData.find(p => p.playerId === playerId);
            return playerData ? {game, playerData} : false;
        }).filter(x => !!x);

        const playerGamesDivs = playerGames.map(({game, playerData}) => {
            return <div key={game.date} className="player-game-data">
                {(typeof game.date === 'string' ? new Date(game.date) : game.date).AsGameName()} <span
                className="gray-seprator"> |</span>
                {SmartPhone && game.description}
                {SmartPhone && <span className="gray-seprator"> |</span>}
                {SmartPhone && <br/>}
                buy-in: {playerData.buyIn} <span className="gray-seprator"> |</span>
                cash-out: {playerData.cashOut} <span className="gray-seprator"> |</span>
                balance: {playerData.cashOut - playerData.buyIn}
                {!SmartPhone && <span className="gray-seprator"> |</span>}
                {!SmartPhone && game.description}
            </div>
        });
        let graph = <div/>;
        const playerName = player.name;
        let playerBalance = 0;
        if (playerGames.length > 0) {
            const data = [{name:" ",[playerName]:0}];


            playerGames.forEach(gameObject =>{
                const gameDate = gameObject.game.date.AsGameName();
                const game = {name:gameDate};
                const playerData = gameObject.playerData;
                playerBalance += (playerData.cashOut - playerData.buyIn);
                game[playerName] = playerBalance;
                data.push(game);
            });
            graph = (
                <div className="col-xs-11 ">
                    <LineChart className="gameGraphLineChart" width={Width} height={SmartPhone ? 260 : 500} data={data}  >
                        <XAxis dataKey="name"/>
                        <YAxis/>
                        <CartesianGrid strokeDasharray="0 40"/>

                        <Line className="graphLine" type="monotone" key={playerName} dataKey={playerName}  stroke="black"  />
                    </LineChart>
                </div>
            );

        }

        return (
            <div className="playerSummary">
                <div className="playerSummaryHeader">
                    <div>
                        name: {player.name}
                    </div>
                    <div>
                        email: {player.email}
                    </div>
                    <img alt="" className="playerPageImage" src={player.imageUrl || ANON_URL}/>

                </div>
                <div>
                    Player Balance: {playerBalance}
                </div>
                {graph}
                <div className="buttons-section">
                    <button onClick={this.props.back}>Back</button>
                    {isAdmin &&
                    <button onClick={this.props.edit} className="left-margin">Edit</button>}
                    {isAdmin && playerGames.length === 0 &&
                    <button onClick={this.props.delete} className="left-margin">Delete</button>}
                </div>
                <div className="playerGames">
                    <div><u>{playerGames.length} games:</u></div>
                    {playerGamesDivs}
                </div>

            </div>
        );
    }
}


export default PlayerSummary;

