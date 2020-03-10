import React, { Component } from 'react';
import GameData from './GameData';
import CONSTS from '../CONSTS';

const { ANON_URL } = CONSTS;
class GamePage extends Component {

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
        const { group, game } = this.props;
        const { isAdmin} = group;
        console.log('group',group);
        console.log('game',game);





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

        return (
            <div id="gameSummary">
                <div id="gameSummaryHeader">
                    <button onClick={this.props.back} className="button">Back</button>
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

                <GameData group={group} Game={game} />

                {isAdmin && <button onClick={this.props.edit} className="button left-margin">Edit</button>}
                {isAdmin && <button onClick={this.props.delete} className="button left-margin">Delete</button>}

                <div className="more-data-text"><u>more data:</u></div>
                <div id="gamePlayersData" className="row">

                    {gamePlayersData}
                </div>


            </div>
        );
    }
}

export default GamePage;
