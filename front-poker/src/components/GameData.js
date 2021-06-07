import React, { Component } from 'react';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';

import CONSTS from '../CONSTS';

import Size from '../sizes';
import InputRange from "react-input-range";
import ImageSlider from '../components/ImageSlider';
import goToPlayerPage from '../actions/goToPlayerPage';
const colors = ["#317F42",  "#14A9B6",  "#D9892B",  "#A23DA3",  "#A3A23D",  "#9189DF",  "#74B0A1",  "#A53542",  "#FD0724",  "#8F6947",  "#FF77E7", "#447F66",  "#55A9A7",  "#D6696B",  "#423D7A"];

const { ANON_URL, GREEN, RED, TRANSPARENT} = CONSTS;
const  {Width} = Size;
const SmartPhone = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

class GameData extends Component{

    createPlayersDataAsFakeGame = (group, max, minIndex, maxIndex, showSummaryByMoney) => {
        const { games } = group;
        this.balances = {};
        this.totalGamesCounts = {};
        this.gamesCount = {};
        const fourMonthMinIndex = showSummaryByMoney ? maxIndex - 12  < 0 ? 0 :maxIndex - 12 : minIndex;
        const sortedGames = games.sort((a,b)=> a.date < b.date ? -1 :1);
        sortedGames.slice(fourMonthMinIndex, maxIndex+1).forEach(game=>{
            game.playersData.forEach(({playerId})=>{
                if (!this.gamesCount.hasOwnProperty(playerId)){
                    this.gamesCount[playerId] = 0;
                }
                this.gamesCount[playerId] =  this.gamesCount[playerId] + (showSummaryByMoney ? 1 : (game.mvpPlayerId===playerId ? 1 : 0));
            });
        });
        sortedGames.slice(minIndex, maxIndex+1).forEach(game=>{

            game.playersData.forEach(({playerId, buyIn,cashOut})=>{

                if (!this.balances.hasOwnProperty(playerId)){
                    this.balances[playerId] = 0;
                }
                if (!this.totalGamesCounts.hasOwnProperty(playerId)){
                    this.totalGamesCounts[playerId] = 0;
                }
                if (showSummaryByMoney){
                    this.balances[playerId] =  this.balances[playerId] + cashOut - buyIn;
                } else{
                    this.balances[playerId] =  this.balances[playerId] + (playerId === game.mvpPlayerId ? 1 : 0);//TODO
                }

                this.totalGamesCounts[playerId] =  this.totalGamesCounts[playerId] + 1;
            });
        });
        this.playersCountText = Object.keys(this.balances).length;

        const playersData = Object.keys(this.gamesCount).map(id=>{
            return {
                id,
                playerId: id,
                buyIn:0,
                cashOut: this.balances[id],
                lastFourMonthGamesCount: this.gamesCount[id],
                gamesCount: this.totalGamesCounts[id],
                percentage: showSummaryByMoney ? undefined : Math.floor(this.balances[id] * 100 / this.totalGamesCounts[id])
            }
        }).sort((a,b)=> {
            return a.lastFourMonthGamesCount > b.lastFourMonthGamesCount ? -1 : (a.lastFourMonthGamesCount < b.lastFourMonthGamesCount ? 1 : (a.gamesCount < b.gamesCount ? -1 : 1))
        }).slice(0,max+1).filter(item => showSummaryByMoney ? true : item.cashOut > 0 && item.gamesCount > 0);

        return {
            playersData
        }
    };

    updateAfterSwitch(){
        const showSummaryByMoney = !this.state.showSummaryByMoney;
        const Game = this.createPlayersDataAsFakeGame(this.prop.group, this.prop.playersCount, this.state.sliderValues.min, this.state.sliderValues.max, showSummaryByMoney);
        this.setState({ Game, showSummaryByMoney });
    }
    constructor(props){
        super(props);
        this.prop = props
        const group = props.group;
        this.yearsObject = {};
        group.games.sort((a,b)=>a.date < b.date ? -1 : 1).forEach((game,index)=>{
            const year = game.date.getYear() + 1900;
            if (!this.yearsObject[year]){
                this.yearsObject[year] = {
                    from: index,
                    to: index
                }
            } else{
                this.yearsObject[year].to = index;
            }
        });

        const sliderValues ={ min: 0, max: group.games.length - 1 };
        const Game = props.IsGroupSummary ? this.createPlayersDataAsFakeGame(props.group, props.playersCount, sliderValues.min, sliderValues.max, true): props.game;
        this.state = { sliderValues, Game, isPlaying: false, showSummaryByMoney: true, IsGroupSummary: props.IsGroupSummary }
    }

    getPlayerImage(playerInfo, playerWidth, margin){
        const isLoggedInPlayer = playerInfo.isMe;
        const key = `${playerInfo.playerId}_item_image`;

        const imgWidth = playerWidth - margin;
        const imgHeight = imgWidth * 1.1;
        const ImgStyleObject = {
            width:imgWidth,
            height: imgHeight,
            marginRight:margin,
        };
        if (isLoggedInPlayer){
            ImgStyleObject.border="1px solid yellow"
        }
        const onImageError = (ev)=>{
            if (!ev.target.secondTry){
                ev.target.secondTry = true;
                ev.target.src=playerInfo.imageUrl;
            }else{
                ev.target.src=ANON_URL;
            }
        };
        const playerName = playerInfo.name;
        const imageUrl = playerInfo.imageUrl || ANON_URL;
        return (<img key={key}  alt={playerName} style={ImgStyleObject} className="GamePlayerImage" src={imageUrl} onError={onImageError} />);
    }

    getNamesSection(playersData, playerWidth, margin, first){

        return playersData.map(playerData=>{

            const key = `${playerData.id}_item_name`;
            let displayName= playerData.name.trim();

            let className = "GamePlayerDisplayName";
            if (displayName.indexOf(' ')>0){
                const index = first ? 0 : 1;
                displayName=displayName.split(' ')[index];
            }else{
                if (!first){
                    displayName='----';
                    className +=' transparentTextColor';
                }
            }

            const styleObject = {
                width:playerWidth-margin,
                marginRight:margin,
            };

            return  (
                <div key={key} style={styleObject} className={className} onClick={()=>{goToPlayerPage(playerData.playerId)}}>
                    {displayName}
                </div>
            );
        });
    }

    render(){
        const {group, IsGroupSummary, playersCount } = this.props;
        const { Game, sliderValues, showSummaryByMoney} = this.state;

        if (group.games.length  -1 < this.state.sliderValues.max){
            sliderValues.min=0;
            sliderValues.max=group.games.length -1;
            const newSliderValues = {...sliderValues};
            setTimeout(()=>{
                this.setState({sliderValues: newSliderValues});
            },1)
        }


        const {players} = group;
        const {playersData} = Game;
        if (playersData.length === 0) {
            return <div> no players yet</div>
        }
        const playersInfo = playersData.map(playerData=>{
            const data = { ...playerData }
            const playerObject = players.find(player=>player.id ===data.playerId);
            data.dif = data.cashOut-data.buyIn;
            data.val = data.dif> 0 ?  `+${data.dif}` : `${data.dif}`;
            data.imageUrl = playerObject.imageUrl;
            data.isMe = playerObject.isMe;
            data.name = playerObject.name;
            data.gamesCount =  playerObject.gamesCount;
            return data;
        }).sort((a,b)=> a.dif > b.dif ? -1 : 1).filter(d=>d.gamesCount);
        if (!playersInfo || playersInfo.length === 0){
            return <div>No data yet</div>
        }
        const isMobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        const margin = isMobile ? 2: 5;

        const hasNegatives = playersInfo.filter(p=>p.dif<=0).length > 0;

        const width = IsGroupSummary ? (isMobile ? 0.8 * Width : 0.93 * Width) : (  isMobile ? 0.80 * Width :  0.63 * Width);
        const playerWidth = playersInfo.length < 3 ? width / 4 :  width / playersInfo.length;
        const PlayerImages = playersInfo.map((playerInfo)=> this.getPlayerImage(playerInfo, playerWidth, margin));

        const PlayerNames1 =  this.getNamesSection(playersInfo,playerWidth,margin,true);
        const PlayerNames2 =  this.getNamesSection(playersInfo,playerWidth,margin,false);

        const CurrencySign = showSummaryByMoney ? '₪' : ' out of';

        const PlayerBalance = playersInfo.map(playerInfo=>{
            const key = `${playerInfo.playerId}_item_balance`;
            const val = IsGroupSummary ? this.balances[playerInfo.playerId] :playerInfo.val;
            const styleObject = {
                width:playerWidth-margin,
                marginRight:margin,
            };
            return  (
                <div key={key} style={styleObject} className="GamePlayerBalance"  >
                    <span className="GamePlayerBalanceCurrencySign">{showSummaryByMoney ? '':'mvp in '}</span> {val}<span className="GamePlayerBalanceCurrencySign">{CurrencySign}</span>
                </div>
            );
        });

        const PlayerGameCount = IsGroupSummary ? playersInfo.map(playerInfo=>{
            const key = `${playerInfo.playerId}_item_gamesCount`;
            const styleObject = {
                width:playerWidth-margin,
                marginRight:margin,
            };


            return  (
                <div key={key} style={styleObject} className="GamePlayerGamesCount"  >
                    {this.totalGamesCounts[playerInfo.playerId]} games
                </div>
            );
        }):[];
        const PlayerPercentages = IsGroupSummary ? playersInfo.map(playerInfo=>{
            const key = `${playerInfo.playerId}_item_percentage`;
            const styleObject = {
                width:playerWidth-margin,
                marginRight:margin,
            };
            return  (
                <div key={key} style={styleObject} className="GamePlayerGamesCount"  >
                      <div className="GamePlayersGamesCount"> {`(${playerInfo.percentage}%)`} </div>
                </div>
            );
        }):[];

        const PlayerRankingBalance= hasNegatives ? <div/> :( playersInfo.map(playerInfo=>{
            const key = `${playerInfo.playerId}_item_Rankingbalance`;

            const styleObject = {
                width:playerWidth-margin,
                marginRight:margin,
            }
            return  (
                <div key={key} style={styleObject} className="GamePlayerBalance"  >
                    {playerInfo.val}
                </div>
            );
        }));

        const maxPositive =  playersInfo[0].dif;

        const positiveRatio = maxPositive === 0 ? 10 : 100/maxPositive;
        let GamePlayerPositives = playersInfo.map((playerInfo)=>{

            const key = `${playerInfo.playerId}_item_positiveDiv`;
            let imageUrl = playerInfo.dif > 0 ? GREEN : TRANSPARENT;
            const height =  playerInfo.dif>0 ? positiveRatio* playerInfo.dif : 150;
            const barsStyleObject = {
                marginTop:(150 - height),
                width:playerWidth-margin,
                marginRight:margin,
                height
            }

            return  (
                <img alt="" key={key} className="barItemPositive" style={barsStyleObject} src={imageUrl}  />
            );
        });
        const maxNegative = playersInfo[playersInfo.length-1].dif;
        const negativeRatio = maxNegative ===0 ? 10 :   100 / maxNegative;

        let GamePlayerNegatives = playersInfo.map(playerInfo=>{
            let imageUrl = playerInfo.dif < 0 ? RED: TRANSPARENT;
            const key = `${playerInfo.playerId}_item_negativeDiv`;

            const height = playerInfo.dif>0 ? 150 : negativeRatio* playerInfo.dif;

            const barsStyleObject = {
                marginTop:-1*(150 - height),
                width:playerWidth-margin,
                marginRight:margin,
                height
            };
            return  (
                <img alt="" key={key} className="barItemNegative" style={barsStyleObject} src={imageUrl}  />
            );
        });

        GamePlayerPositives = (<div className="GamePlayerBars" >
            {GamePlayerPositives}
        </div>);

        GamePlayerNegatives = hasNegatives ? (<div className="GamePlayerBars" >
            {GamePlayerNegatives}
        </div>) : <div/>


        const playersIdsToGamesCountObjMapper = {};
        const playersIdsToBalanceObjMapper = {};
        const filterGames = group.games
            .sort((a,b)=>a.date < b.date ? -1 : 1)
            .filter((game,index) => sliderValues.min <= index && index <= sliderValues.max);

        filterGames.forEach(game=>{
            game.playersData.forEach(({playerId, buyIn,cashOut})=>{
                if (!playersIdsToGamesCountObjMapper.hasOwnProperty(playerId)){
                    playersIdsToGamesCountObjMapper[playerId] = 0;
                }
                if (!playersIdsToBalanceObjMapper.hasOwnProperty(playerId)){
                    playersIdsToBalanceObjMapper[playerId] = 0;
                }
                playersIdsToGamesCountObjMapper[playerId] += 1;
                playersIdsToBalanceObjMapper[playerId] =  playersIdsToBalanceObjMapper[playerId] + cashOut - buyIn;
            });
        });
        const playersToShow = Object.keys(playersIdsToGamesCountObjMapper).map((id,index)=>{
                const name = group.players.find(p=>p.id===id).name;
                return {
                    playerId:id,
                    gamesCount:playersIdsToGamesCountObjMapper[id],
                    name,
                    id,
                    balance: playersIdsToBalanceObjMapper[id],
                }
            }).sort((a,b)=>a.gamesCount< b.gamesCount ? 1 : -1).slice(0,playersCount).map((item,index)=>{
                return {
                    ...item,
                    color:  colors[index]
                }
        })

        const playersIdsToNameObjMapper = {};

        const data = [];
        const zeros = { name:""};
        playersToShow.forEach(playersInfo => {
            playersIdsToNameObjMapper[playersInfo.playerId] = playersInfo.name;
            zeros[playersInfo.name]=0;
        });
        data.push(zeros);

        filterGames
            .forEach((game)=>{
                const prevData = data[data.length-1];
                const gamePlayers = game.playersData.filter(player => playersIdsToNameObjMapper[player.playerId]).map(player => ({name: playersIdsToNameObjMapper[player.playerId], dif: player.cashOut - player.buyIn }));
               const gameData = {
                   name: game.date.AsGameName()
               };
                gamePlayers.forEach(({name,dif})=>{
                    const prevValue = prevData[name];
                    gameData[name] = dif + prevValue;
                });

               playersToShow.forEach(playersInfo => {
                   if (!gameData.hasOwnProperty(playersInfo.name)){
                       const prevValue = prevData[playersInfo.name];
                       gameData[playersInfo.name] = prevValue;
                   }
               });



                data.push(gameData)
            });
        const lines = playersToShow.map(playerInfo=> <Line key={`line${playerInfo.name}`} className="graphLine" type="monotone" dataKey={playerInfo.name} stroke={playerInfo.color} />);
        const menu = playersToShow.sort((a,b)=>a.balance > b.balance ? -1 : 1).map(({id, name,color, balance})=> {
            const style = {
                color,
            }

            return (<div key={`menu${color}${name}`} className="menuItem" style={style} > {name}: {balance} ({playersIdsToGamesCountObjMapper[id]} games) </div>);
        });
        const yearsButtons = Object.keys(this.yearsObject).sort().map(year=>{
            return <button key={`year-${year}`}
                           className="year-button"
                           onClick={()=> {
                               const newState= { isPlaying:false, sliderValues: { min: this.yearsObject[year].from, max: this.yearsObject[year].to }};
                               if (this.props.IsGroupSummary){
                                   newState.Game = this.createPlayersDataAsFakeGame(this.props.group, this.props.playersCount, this.yearsObject[year].from, this.yearsObject[year].to, this.state.showSummaryByMoney );
                               }
                               this.setState(newState)
                           }}>{year}</button>
        });
        yearsButtons.push( <button key={`all-years`}
                                   className="year-button"
                                   onClick={()=> {
                                       const newState= { isPlaying:false, sliderValues: { min: 0, max: group.games.length -1 }};
                                       newState.Game = this.createPlayersDataAsFakeGame(this.prop.group, this.prop.playersCount, newState.sliderValues.min, newState.sliderValues.max, this.state.showSummaryByMoney);

                                       this.setState(newState)
                                   }}>All</button>)


        const playStopButton = <button key={`play-all`}
                                  className="year-button"
                                  onClick={()=> {
                                      const newState= {};
                                      if (!this.state.isPlaying) {
                                          newState.sliderValues = { min: 0, max: 4 };
                                          newState.isPlaying = true;
                                          const update = ()=>{
                                              const innerNewState = { sliderValues: { min: 0, max: this.state.sliderValues.max + 1 }};
                                              if (innerNewState.sliderValues.max > group.games.length -1){
                                                  innerNewState.sliderValues.max = 4;
                                              }
                                              innerNewState.Game = this.createPlayersDataAsFakeGame(group, this.props.playersCount, 0,  this.state.sliderValues.max, this.state.showSummaryByMoney );

                                              if (this.state.isPlaying) {
                                                  this.setState(innerNewState);
                                                  setTimeout(update,70)
                                              }
                                          }

                                          setTimeout(update,1500)


                                      }else{
                                          newState.isPlaying = false;
                                      }
                                      this.setState(newState)
                                  }}>{ this.state.isPlaying ? 'Stop' : 'Play'}</button>

        const graph = (
            <div >

                {playStopButton}
                <LineChart className="gameGraphLineChart" width={SmartPhone ? Width : Width*(88/100)} height={SmartPhone ? 260 : 500} data={data}  >
                    <XAxis dataKey="name"/>
                    <YAxis/>
                    <CartesianGrid strokeDasharray="0 40"/>
                    <ReferenceLine y={0} label="Zero" stroke="red"/>

                    {lines}
                </LineChart>
                <div>
                    {yearsButtons}
                </div>
                <div className="menu">
                     {menu}
                </div>
            </div>
        );
        const gamesDates = IsGroupSummary ? (
            <div className="black" >
            {sliderValues.max - sliderValues.min +1 } games ({group.games[sliderValues.min].date.AsGameName()} - {group.games[sliderValues.max].date.AsGameName()})
        </div>):<div/>;

        let playersCountText = IsGroupSummary ?  this.playersCountText : playersData.length;
        return (
            <div className={`allPlayersSummary ${IsGroupSummary ? 'groupSummary': ''}`}

            >

                {
                    (this.props.IsGroupSummary && (sliderValues.min > 0 || sliderValues.max < this.props.group.games.length-1)) &&
                    <div className="black">
                        <b>(filtered data)</b>
                    </div>
                }
                {gamesDates}
                <div className="black">
                    { playersCountText } players
                </div>

                <div>
                  <span className="white">xx</span>
                </div>

                <div className="GamePlayerNames">
                    {PlayerNames1}
                </div>

                <div className="GamePlayerNames">
                    {PlayerNames2}
                </div>

                <div className="GamePlayerImages">
                    {PlayerImages}
                </div>
                <div className="GamePlayerBalance">
                    {PlayerBalance}
                </div>
                {IsGroupSummary ?<div className="GamePlayersGamesCount"> {PlayerGameCount} </div> : <div/> }
                {IsGroupSummary && !showSummaryByMoney ? <div className="GamePlayersGamesCount"> {PlayerPercentages} </div> : <div/> }
                <br/>
                <br/>
                {GamePlayerPositives}
                {PlayerRankingBalance}
                {GamePlayerNegatives}

                <div>
                    {this.state.IsGroupSummary ? <button onClick={()=>this.updateAfterSwitch()}> { this.state.showSummaryByMoney ? 'switch to games won mode':'switch back'}</button> : <span></span>}
                </div>
                <hr/>
                { IsGroupSummary && group.games.length>0 && (
                    <div className="black">
                        <div

                        ><b>Date range specific data:</b><br/></div>
                        <div>From { group.games[sliderValues.min].date.AsGameName()} to { group.games[sliderValues.max].date.AsGameName()}</div>
                        <div>
                            <InputRange className="InputRange"
                                        step={1}
                                        formatLabel={() => ``}
                                        maxValue={ group.games.length - 1}
                                        minValue={0}
                                        value={sliderValues}
                                        onChange={sliderValues => {
                                            if (sliderValues.min < sliderValues.max){
                                                const newState = { sliderValues };
                                                if (IsGroupSummary){
                                                    newState.Game = this.createPlayersDataAsFakeGame(group, this.props.playersCount, sliderValues.min, sliderValues.max, this.state.showSummaryByMoney);
                                                }
                                                this.setState(newState);
                                            }
                                        }} />
                        </div>
                        <div>
                            {graph}
                        </div>


                    </div>)
                }

                {!IsGroupSummary &&
                <ImageSlider group={group} gameId={Game.id}/>
                }
            </div>
        );


    }
}

export default GameData;

