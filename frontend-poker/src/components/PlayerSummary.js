import React, { Component } from 'react';
import InputRange from 'react-input-range';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';

const SmartPhone = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

const body = document.getElementsByTagName('body')[0];
const windowWidth = window.innerWidth || document.documentElement.clientWidth || body.clientWidth;
const Width = windowWidth;

console.log('Width',Width)
import CONSTS from '../CONSTS';
const { ANON_URL } = CONSTS;

class PlayerSummary extends Component {

    constructor(props){
        super(props);

        const player = this.props.player;
        const group = this.props.group;
        const playerId = player.id;

        this.playerGames = group.games.map(game => {
            const playerData = game.playersData.find(p => p.playerId === playerId);
            return playerData ? {game, playerData} : false;
        }).filter(x => !!x).sort((a,b)=>a.game.date < b.game.date ? -1 : 1);

        this.firstGame = this.playerGames.length >0 ? this.playerGames[0] : null;

        this.state = { sliderValues: { min: 0, max: this.playerGames.length - 1 } }
    }
    render() {
        const player = this.props.player;
        const group = this.props.group;
        const { isAdmin} = group;
        const playerGames =  this.playerGames;

        const firstGame = this.firstGame;

        const playerGamesDivs = playerGames.map(({game, playerData}, index) => {
            if (this.state.sliderValues.min <= index && index <= this.state.sliderValues.max){
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
            }
            return <div key={game.date}/>

        });
        let graph = <div/>;
        const playerName = player.name;
        let playerBalance = 0;
        let rangeBalance = 0;
        if (playerGames.length > 0) {
            const data = [];
            if (playerGames.length === this.state.sliderValues.max - this.state.sliderValues.min +1 || this.state.sliderValues.min === 0) {
                data.push({name:" ",[playerName]:0});
            }

            playerGames.forEach((gameObject,index) =>{
                const gameDate = gameObject.game.date.AsGameName();
                const game = {name:gameDate};
                const playerData = gameObject.playerData;
                playerBalance += (playerData.cashOut - playerData.buyIn);
                if (this.state.sliderValues.min <= index && index <= this.state.sliderValues.max){
                    rangeBalance += (playerData.cashOut - playerData.buyIn);
                    game[playerName] = playerBalance;
                    data.push(game);
                }

            });
            graph = (
                <div className="col-xs-11 ">
                    <LineChart className="gameGraphLineChart" width={SmartPhone ? Width : Width*(97/100)} height={SmartPhone ? 260 : 500} data={data}  >
                        <XAxis dataKey="name"/>
                        <YAxis/>
                        <CartesianGrid strokeDasharray="0 40"/>
                        <ReferenceLine y={0} label="Zero" stroke="red"/>

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
                    { firstGame ? (
                        <div>
                            <div>
                                playing since {firstGame.game.date.AsGameName()}
                            </div>
                            <div>
                                balance: {playerBalance} ({playerGames.length} games)
                            </div>
                        </div>
                    ) : <div>no games yet</div>}

                    <img alt="" className="playerPageImage" src={player.imageUrl || ANON_URL}/>

                </div>
                <hr/>
                {/*`${this.playerGames[value.min].game.date.AsGameName()} - ${this.playerGames[value.max].game.date.AsGameName()} `*/}
                { firstGame && (
                    <div>
                        <div><b>Date range specific data:</b><br/></div>
                        <div>From {this.playerGames[this.state.sliderValues.min].game.date.AsGameName()} to {this.playerGames[this.state.sliderValues.max].game.date.AsGameName()}</div>
                        <div>
                            <InputRange className="InputRange"
                                        step={1}
                                        formatLabel={() => ``}
                                        maxValue={this.playerGames.length - 1}
                                        minValue={0}
                                        value={this.state.sliderValues}
                                        onChange={sliderValues => this.setState({ sliderValues })} />
                        </div>
                        <div>
                            balance: {rangeBalance} ({this.state.sliderValues.max - this.state.sliderValues.min + 1} games)
                        </div>
                        <div>
                            {graph}
                        </div>
                    </div>
                )}

                <div className="buttons-section">
                    <button onClick={this.props.back}>Back</button>
                    {isAdmin &&
                    <button onClick={this.props.edit} className="left-margin">Edit</button>}
                    {isAdmin && playerGames.length === 0 &&
                    <button onClick={this.props.delete} className="left-margin">Delete</button>}
                </div>
                <div className="playerGames">

                    {playerGamesDivs}
                </div>

            </div>
        );
    }
}


export default PlayerSummary;

