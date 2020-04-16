// /* eslint-disable jsx-a11y/img-redundant-alt */
// /* eslint-disable jsx-a11y/img-has-alt */
// import React, { Component } from 'react';
// import 'react-input-range/lib/css/index.css';
// import socketIOClient from 'socket.io-client';
//
// const locationHost = window.location.host ||'';
// const endpoint = locationHost.indexOf('localhost') >= 0 ?  "http://127.0.0.1:5000" : "https://www.poker-stats.com";
//
// const SECOND = 1000;
// const MINUTE = 60;
// const HOUR = 60 * MINUTE;
// const DAY = 24 * HOUR;
//
//
// class OnlineGame extends Component {
//
//     getGameTime = (startDate) =>{
//         const diff = (new Date()).getTime() - startDate.getTime();
//         const totalSeconds =  Math.floor(diff / SECOND);
//         const days = Math.floor(totalSeconds / DAY);
//         let reminder = totalSeconds - days * DAY;
//         const hours = Math.floor(reminder / HOUR);
//         reminder -=  hours * HOUR;
//         const minutes =  Math.floor(reminder / MINUTE);
//         const seconds = reminder - minutes * MINUTE;
//
//         const result = {
//             days: days>9 ? `${days}` : `0${days}`,
//             hours:hours>9 ? `${hours}` : `0${hours}`,
//             minutes:minutes>9 ? `${minutes}` : `0${minutes}`,
//             seconds:seconds>9 ? `${seconds}` : `0${seconds}`,
//         };
//         return `${result.days}:${result.hours}:${result.minutes}:${result.seconds}`;
//     }
//
//     toggleRaiseButton = ()=>{
//         this.setState({raiseEnabled:!this.state.raiseEnabled, raiseValue: this.state.game ? this.state.game.bigBlind : 1})
//     };
//
//     constructor(props) {
//         super(props);
//         console.log('### gameId=', props.gameId);
//         this.state = { clockMessage: '', communityCards:[], raiseEnabled: false, raiseValue:1, userTimer:0, options:[] }
//     }
//
//     getGameClone = () =>{
//         const originalGame = this.state.game;
//         const clone = {
//             ...originalGame
//         }
//         return clone;
//     }
//
//     getActiveIndex(players){
//         let index = -1;
//         players.forEach((player,i)=>{
//             if (player.active){
//                 index = i;
//             }
//         });
//         return index;
//     }
//
//     getMyIndex(players){
//         let index = -1;
//         players.forEach((player,i)=>{
//             if (player.me){
//                 index = i;
//             }
//         });
//         return index;
//     }
//
//     getOptions = (players, index) =>{
//         return players[index].options;
//     }
//
//     onGameUpdate = (game) =>{
//         console.log('onGameUpdate',game)
//         game.startDate = game.startDate ? new Date(game.startDate) : null;
//         const communityCards = game.board || [];
//         communityCards[0] = communityCards[0] ? `./cards/${communityCards[0]}.png` : null;
//         communityCards[1] = communityCards[1] ? `./cards/${communityCards[1]}.png` : null;
//         communityCards[2] = communityCards[2] ? `./cards/${communityCards[2]}.png` : null;
//         communityCards[3] = communityCards[3] ? `./cards/${communityCards[3]}.png` : null;
//         communityCards[4] = communityCards[4] ? `./cards/${communityCards[4]}.png` : null;
//         const userTimer = game.currentTimerTime;
//         const activeIndex = this.getActiveIndex(game.players);
//         const myIndex = this.getMyIndex(game.players);
//
//         const isMyTurn = activeIndex === myIndex && myIndex!==-1;
//         const options = isMyTurn ? this.getOptions(game.players,myIndex) : [];
//
//         this.setState({game, communityCards, userTimer, isMyTurn, options,raiseEnabled: false});
//
//         if (game.startDate){
//             setImmediate(()=>{
//                 if (this.timerInterval) {
//                     clearInterval(this.timerInterval);
//                 }
//                 this.timerInterval = setInterval(()=>{
//                     let newUserTimer = this.state.userTimer;
//                     newUserTimer -= 0.1;
//                     if (newUserTimer < 0){
//                         newUserTimer = 0;
//                         setImmediate(()=>clearInterval(this.timerInterval));
//                     }
//                     this.setState({ userTimer: newUserTimer});
//                 },100)
//
//             });
//             setInterval(()=>{
//                 if (this.state.game){
//                     const clockMessage = this.getGameTime(this.state.game.startDate);
//                     this.setState({ clockMessage});
//                 }
//             },1000)
//         }
//
//
//     }
//
//     componentDidMount() {
//         const gameId = this.props.gameId;
//         this.socket = this.props.socket || socketIOClient(endpoint);
//         this.socket.on("disconnect", () => this.setState({connected: false}));
//
//         this.socket.on("connected", (data) => {
//             console.log('online game, socketId:', data.socketId);
//             this.setState({connected: true});
//         });
//         this.socket.on("gameUpdate", this.onGameUpdate);
//         this.socket.emit("getGameData", gameId);
//
//
//
//
//     }
//
//
//     // mock = ()=>{
//     //     setInterval(()=>{
//     //         const game = this.getGameClone();
//     //         game.timer = game.timer - 0.05;
//     //         if (game.timer < 0){
//     //             game.timer = game.time;
//     //         }
//     //         this.setState({ game});
//     //     },50)
//     //     setInterval(()=>{
//     //         const game = this.getGameClone();
//     //         const activeIndex = this.getActiveIndex(game.players);
//     //         const newActiveIndex = activeIndex + 1 > game.players.length - 1 ? 0 : activeIndex + 1;
//     //
//     //         game.players[activeIndex].active = false;
//     //         game.players[newActiveIndex].active = true;
//     //         this.setState({ game});
//     //     },10000)
//     // }
//
//
//
//     setRaiseValue = (newVal) =>{
//         const big = this.state.game ? this.state.game.bigBlind : 1
//         this.setState({raiseValue: newVal>=big ? parseFloat(newVal) : big});
//     }
//     getTimeLeft = ()=>{
//         const {userTimer} = this.state;
//         let minutes =  Math.floor(userTimer / MINUTE).toFixed(0);
//         let seconds = (userTimer - minutes * MINUTE).toFixed(0);
//         minutes = minutes>9 ? `${minutes}` : `0${minutes}`;
//         seconds = seconds>9 ? `${seconds}` : `0${seconds}`;
//         return `${minutes}:${seconds}`
//     }
//     /**
//      *
//      * @param op Fold/Call/Check/Raise/Rebuy
//      * @param amount - only relevant for Raise/Rebuy
//      */
//     action = (op, amount)=>{
//         if (!this.socket){
//             console.log('no active socket!');
//             return;
//         }
//         const playerId = localStorage.getItem(this.state.game.id) || '';
//
//         this.socket.emit("playerAction", {
//             op,
//             amount,
//             gameId: this.state.game.id,
//             hand:this.state.game.hand,
//             playerId
//         });
//     };
//     fold = ()=>{
//         return this.action('Fold');
//     };
//     call = ()=>{
//         return this.action('Call');
//     };
//     check = ()=>{
//         return this.action('Check');
//     };
//     raise = ()=>{
//         return this.action('Raise',this.state.raiseValue);
//     };
//
//     render() {
//         const {communityCards, clockMessage, options} = this.state;
//         const {game, userTimer} = this.state;
//         let pot='';
//         let currency='';
//         let smallBlind = 0.5;
//         let bigBlind = 1;
//         let time = 30;
//         let pres = 100;
//         let players = [];
//         if (game){
//             pot = game.pot;
//             smallBlind = game.smallBlind;
//             bigBlind = game.bigBlind;
//             players = game.players;
//             currency = game.currency;
//             time = game.time;
//             pres = (100 * userTimer / time).toFixed(0) - 1;
//             console.log('time',time)
//             console.log('userTimer',userTimer)
//             console.log('pres',pres)
//         }
//         if (this.state.game && !this.state.game.startDate){
//             console.log('game not started yet..')
//         }
//         const activeTimerStyle = {
//             "background":  `linear-gradient(to right,green 0% ${pres-25}%,red ${pres}% 100%)`,
//         };
//
//         return (
//             <div id="online-game-screen" >
//                 <div id="connection-status" className={this.state.connected ? 'connected-to-server':'disconnected-from-server'}> { this.state.connected ? 'Connected' : 'Disconnected'}</div>
//                 <div id="clock"> { clockMessage }</div>
//                 <div id="blinds-data"> { smallBlind}{currency} / {bigBlind}{currency}</div>
//                 <div id="hand-clock"> { this.getTimeLeft()}</div>
//                 <img id="table-image" src="table.png" />
//
//                 {players.map((player,index)=>{
//                     const card1 = player.cards ? `./cards/${player.cards[0]}.png` : './cards/back.png';
//                     const card2 = player.cards ? `./cards/${player.cards[1]}.png` : './cards/back.png';
//                     return  <div key={`player_${index}`} id={`player${index+1}`} className={`player ${player.active ? 'active-player' : ''}`}>
//                         <div className="player-div">
//
//                             <img className={`card left-card card1`} src={card1} />
//                             <img className={`card right-card card2`} src={card2} />
//                             <div className="player-info" >
//                                 <div className="player-name">
//                                     {player.name}
//                                 </div>
//                                 <div className="player-balance">
//                                     {player.balance}{currency}
//                                 </div>
//
//
//                             </div>
//                             { player.dealer && <div id="dealer-button" className="button"> D </div>}
//                             { player.small && <div id="small-blind-button" className="button"> SB </div>}
//                             { player.big && <div id="big-blind-button" className="button"> BB </div>}
//
//                             {player.pot && <div id={`player${index+1}-pot`} className="player-pot">{player.pot}{currency}</div>}
//                             {player.status && <div  className="player-status">{player.status}</div>}
//
//                             { player.active && <div id="active-timer-div" style={activeTimerStyle}/>}
//                         </div>
//
//                     </div>
//                 })}
//
//                 <div id="community-pot">
//                     {pot}{currency}
//                 </div>
//                 <div id="community-cards">
//                     {communityCards[0] && <img id="community-card-1" className="community-card" src={communityCards[0]} />}
//                     {communityCards[1] && <img id="community-card-2" className="community-card" src={communityCards[1]} />}
//                     {communityCards[2] && <img id="community-card-3" className="community-card" src={communityCards[2]} />}
//                     {communityCards[3] && <img id="community-card-4" className="community-card" src={communityCards[3]} />}
//                     {communityCards[4] && <img id="community-card-5" className="community-card" src={communityCards[4]} />}
//                 </div>
//                 <div id="buttons">
//                     <div id="fold-button" className={`big-button ${options.includes('Fold') ? 'active':'inactive'}-button`} onClick={this.fold}> Fold </div>
//                     <div id="check-button" className={`big-button ${options.includes('Check') ? 'active':'inactive'}-button`} onClick={this.check}> Check </div>
//                     <div id="call-button" className={`big-button ${options.includes('Call') ? 'active':'inactive'}-button`} onClick={this.call}> Call </div>
//                     <div id="toggle-raise-button" className={`big-button ${options.includes('Raise') ? 'active':'inactive'}-button`} onClick={this.toggleRaiseButton}> Raise... </div>
//                     {this.state.raiseEnabled && <div id="raise-buttons">
//                         <div id="raise-button" className="big-button active-button" onClick={this.raise}> Raise {this.state.raiseValue}{currency}</div>
//                         <div id="raise-button-add-100" className="big-button active-button raise-button-add-remove" onClick={()=> this.setRaiseValue(this.state.raiseValue+100)}> +100</div>
//                         <div id="raise-button-add-10" className="big-button active-button raise-button-add-remove" onClick={()=> this.setRaiseValue( this.state.raiseValue+10)}> +10</div>
//                         <div id="raise-button-add-1" className="big-button active-button raise-button-add-remove" onClick={()=> this.setRaiseValue( this.state.raiseValue+1)}> +1</div>
//
//
//                         <input id="raise-input" type="number" min={bigBlind} value={this.state.raiseValue} onChange={(e)=> this.setState({raiseValue: parseFloat(e.target.value)})}/>
//
//                         <div id="raise-button-sub-1" className="big-button active-button raise-button-add-remove" onClick={()=> this.setRaiseValue( this.state.raiseValue-1)}> -1</div>
//                         <div id="raise-button-sub-10" className="big-button active-button raise-button-add-remove" onClick={()=> this.setRaiseValue( this.state.raiseValue-10)}> -10</div>
//                         <div id="raise-button-sub-100" className="big-button active-button raise-button-add-remove" onClick={()=> this.setRaiseValue( this.state.raiseValue-100)}> -100</div>
//
//                         <div id="raise-button-2-3" className="big-button active-button raise-button-pot-ref" onClick={()=> this.setRaiseValue( (2* pot / 3).toFixed(0))}> 2/3 pot</div>
//                         <div id="raise-button-1-2" className="big-button active-button raise-button-pot-ref" onClick={()=> this.setRaiseValue( (pot / 2).toFixed(0))}> 1/2 pot</div>
//                         <div id="raise-button-1-3" className="big-button active-button raise-button-pot-ref" onClick={()=> this.setRaiseValue( (pot / 3).toFixed(0))}> 1/3 pot</div>
//
//                         <div id="raise-button-5x" className="big-button active-button raise-button-pot-ref" onClick={()=> this.setRaiseValue( (bigBlind * 5).toFixed(0))}> BB X 5</div>
//                         <div id="raise-button-3x" className="big-button active-button raise-button-pot-ref" onClick={()=> this.setRaiseValue( (bigBlind * 3).toFixed(0))}> BB X 3</div>
//                         <div id="raise-button-2x" className="big-button active-button raise-button-pot-ref" onClick={()=> this.setRaiseValue( (bigBlind * 2).toFixed(0))}> BB X 2</div>
//
//
//                     </div>}
//                 </div>
//
//             </div>
//         );
//
//     }
// }
//
// export default OnlineGame;
//
