// /* eslint-disable jsx-a11y/img-redundant-alt */
// /* eslint-disable jsx-a11y/img-has-alt */
//
//
//
// import React, { Component } from 'react';
// import 'react-input-range/lib/css/index.css';
// import socketIOClient from "socket.io-client";
// import OnlineGame from "./OnlineGame";
// import ShowErrorAlert from "../containers/ShowErrorAlert";
// import ShowAlert from "../containers/ShowAlert";
//
// const locationHost = window.location.host ||'';
// const endpoint = locationHost.indexOf('localhost') >= 0 ?  "http://127.0.0.1:5000" : "https://www.poker-stats.com";
//
// const ONLINE_GAME_ID = 'gameid';
//
// class OnlineMode extends Component {
//
//     constructor(props) {
//         super(props);
//         console.log('### online mode');
//         this.state = { name:'',SB:0.5,BB:1,time:40, currency:'$',buyIn:50, showErrors:false , showAlert:false, showError:false, games:[]}
//     }
//
//     componentDidMount() {
//
//         const savedExistingGameIds = (localStorage.getItem('games') || '').split(',');
//
//
//         this.socket = socketIOClient(endpoint);
//         this.socket.on("gamesData", (games) => {
//             console.log('gamesData',games);
//             this.setState({games: [...this.state.games,...games]});
//         });
//         this.socket.on("disconnect", () => this.setState({connected:false}));
//
//         this.socket.on("onerror", ({message}) => this.setState({showError:message}));
//         this.socket.on("gameCreated", (game) => {
//             const gameId = game.id;
//             const playerId = game.players[0].id;
//
//             localStorage.setItem(gameId, playerId);
//             const existingGames = (localStorage.getItem('games') || '').split(',');
//             existingGames.push(gameId);
//             localStorage.setItem('games', existingGames.join(','));
//             this.setState({wait:false, games: [...this.state.games,game]});
//         });
//         this.socket.on("connected", (data) => {
//             console.log('online mode, socketId:',data.socketId);
//             if (!this.state.connected){
//                 this.setState({connected:true})
//             }
//
//             if (!this.state.games || this.state.games.length ===0){
//                 this.socket.emit('getGames',savedExistingGameIds);
//
//             }
//
//         });
//
//
//     }
//     onCreate = ()=>{
//         if (!this.state.name || this.state.name.length === 0 ||
//             !this.state.SB || this.state.SB === 0 ||
//             !this.state.BB || this.state.BB === 0 ||
//             !this.state.time || this.state.time === 0 ||
//             !this.state.currency ||
//             !this.state.buyIn || this.state.buyIn===0){
//             this.setState({showErrors:true, showAlert: true});
//             return;
//         }
//
//         const id = `${this.state.name}_${(new Date()).getTime()}`
//         this.socket.emit("createGame",  {
//             smallBlind:this.state.SB,
//             bigBlind:this.state.BB,
//             time:this.state.time,
//             currency:this.state.currency,
//             id,
//             name:this.state.name,
//             balance:this.state.buyIn,
//         });
//
//         this.setState({showErrors:false, showAlert: false, wait:true});
//     }
//     render() {
//         console.log('mode render')
//         const search = window.location.search || '';
//         const onlineGame = search.includes(ONLINE_GAME_ID);
//         if (onlineGame){
//             const queryItems = search.substr(1).split('&');
//             const gameId = queryItems.find(qi=>qi.startsWith(ONLINE_GAME_ID)).split('=')[1];
//             return <OnlineGame gameId={gameId} socket={this.socket}/>
//         }
//         if (this.state.showAlert || this.state.showError){
//             setTimeout(()=>{
//                 this.setState({showAlert:false, showError:false});
//             },500);
//         }
//
//         return (
//             <div id="online-screen" >
//                 <div id="connection-status" className={this.state.connected ? 'connected-to-server':'disconnected-from-server'}> { this.state.connected ? 'Connected' : 'Disconnected'}</div>
//
//                 <div id="create-new-online-game-section" >
//                     <header>
//                         Create New Online Game
//                     </header>
//                     <div id="new-online-game-inputs">
//                         <div>
//                             Name: <input className={`name-input ${this.state.showErrors ? 'red-border':''}`} type="text" value={this.state.name} onChange={(e)=>this.setState({name:e.target.value})} />
//                             <br/>
//                             Small Blind: <input  step="0.5"  className={`small-blind ${this.state.showErrors ? 'red-border':''}`} type="number" value={this.state.SB} onChange={(e)=>this.setState({SB:e.target.value, BB: 2 * e.target.value})} />
//                             Big Blind: <input  step="1"  className={`big-blind ${this.state.showErrors ? 'red-border':''}`} type="number" value={this.state.BB} onChange={(e)=>this.setState({BB:e.target.value})} />
//                             <br/>
//                             Time To Action: <input  className={`time ${this.state.showErrors ? 'red-border':''}`} type="number"
//                                                    value={this.state.time}
//                                                    onChange={(e)=>this.setState({time:e.target.value})}
//                                                    step="5"
//                                                     onKeyPress={(event)=> event.charCode >= 48 && event.charCode <= 57}
//                                             /> seconds
//
//                             <br/>
//                             <br/>
//                             Initial Buy-In:  <input className={`buy-in ${this.state.showErrors ? 'red-border':''}`} type="number" value={this.state.buyIn} onChange={(e)=>this.setState({buyIn:e.target.value})} />
//                             Currency Sign: <input  className={`currency-sign ${this.state.showErrors ? 'red-border':''}`} type="text" value={this.state.currency} onChange={(e)=>this.setState({currency:e.target.value})} />
//                             <br/>
//                             <div id="signs">
//                                 <span onClick={()=>this.setState({currency:'$'})}>$</span>
//                                 <span onClick={()=>this.setState({currency:'€'})}>€</span>
//                                 <span onClick={()=>this.setState({currency:'£'})}>£</span>
//                                 <span onClick={()=>this.setState({currency:'¥'})}>¥</span>
//                                 <span onClick={()=>this.setState({currency:'₪'})}>₪</span>
//                                 <span onClick={()=>this.setState({currency:'₽'})}>₽</span>
//                             </div>
//                         </div>
//
//                     </div>
//                     <div id="create-button-div">
//                         <span id="create-button" onClick={this.onCreate}>Create</span>
//                     </div>
//
//                 </div>
//
//                 <div id="existing-games">
//                     <header>
//                         Existing Games
//                     </header>
//                     <div id="existing-games-list">
//                         {
//                             this.state.games.length === 0 ? 'No games' :
//
//                                  this.state.games.map((game,index)=>{
//                                             //console.log('game',game)
//                                             const epoc = parseInt(game.id, 10);
//                                            // console.log('epoc',epoc)
//                                            // console.log('now',(new Date()).getTime())
//                                             const date = new Date(epoc);
//                                            // console.log('date',date);
//                                    return <div key={game.id}
//                                                onClick={()=>{
//                                                    window.location = `${window.location.href}&gameid=${game.id}`;
//                                                }}
//                                                className={index % 2 ===0 ?'existing-game greyGame':'existing-game whiteGame'}>
//                                        {index+1}) {date.AsGameName()} {date.AsExactTime()}  , blinds:   {game.smallBlind} /  {game.bigBlind}
//                                         </div>
//                                 })
//
//
//                         }
//                     </div>
//                 </div>
//                 { this.state.showAlert && <ShowAlert message={"all fields are mandatory"}/>}
//                 { this.state.showError && <ShowErrorAlert message={this.state.showError}/>}
//                 {this.state.wait && <div id="please-wait">Please Wait</div>}
//             </div>
//         );
//
//     }
// }
//
// export default OnlineMode;
//
