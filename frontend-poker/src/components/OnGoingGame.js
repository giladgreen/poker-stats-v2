/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable jsx-a11y/img-has-alt */
import React, { Component } from 'react';
import CONSTS from '../CONSTS';
const { ANON_URL } = CONSTS;

class OnGoingGame extends Component {

    createPlayerRow = (playerData) =>{
        const { game, group: { players: groupPlayers }  } = this.props;
        const playersCount = game.playersData.length;

        const { buyIn, cashOut, playerId} = playerData;
        const { name, imageUrl='' } = groupPlayers.find(p=>p.id === playerId);
        const bottomLine = (parseInt(cashOut, 10) - parseInt(buyIn, 10));
        const buyInValue = `${buyIn>0?'+':''}${buyIn}₪`;
        const cashOutValue = `${cashOut>0?'+':''}${cashOut}₪`;
        const bottomLineValue = `${bottomLine>0?'+':''}${bottomLine}₪`;

        const onImageError = (ev)=>{
            if (imageUrl && imageUrl.length>1 && !ev.target.secondTry){
                ev.target.secondTry = true;
                ev.target.src=imageUrl;
            }else{
                ev.target.src=ANON_URL;
            }
        };

        let imgHeight = (60 / playersCount)-0.5;
        imgHeight = imgHeight>16 ? 15 : imgHeight;
        const imageStyle = {height: `${imgHeight}vh`};
        return (
            <div className="col-xs-12 activeGamePlayerRow">
                <div className="col-xs-2 col-md-1">
                     <img alt={name} className="activeGameImage" style={imageStyle}  src={imageUrl || ANON_URL}  onError={onImageError} />
                </div>
                <div className="col-xs-4 col-md-5 centeredText">
                    { name }
                </div>
                <div className="col-xs-2"> {buyInValue}</div>
                <div className="col-xs-2"> {cashOutValue}</div>
                <div className={`col-xs-2 ${bottomLine>0?'balanceWithCurrencyPositive':'balanceWithCurrencyNegative'}`}> {bottomLineValue}</div>
            </div>
        );
    }

    getPlayersDataAsList = () =>{
        const { game, group: { players:  groupPlayers}} = this.props;
        const players = game.playersData.map(player=>{
            const { name, imageUrl } = groupPlayers.find(p=>p.id === player.playerId);
            return {...player, name, imageUrl }
        }).sort((a,b) => a.index < b.index ? -1 : 1).map((player, index)=>{
            const onImageError = (ev)=>{
                if (player.imageUrl && player.imageUrl.length>1 && !ev.target.secondTry){
                    ev.target.secondTry = true;
                    ev.target.src=player.imageUrl;
                }else{
                    ev.target.src=ANON_URL;
                }
            };
            const image =  <img alt={player.name} className="activeGameCircleImage" src={player.imageUrl || ANON_URL}  onError={onImageError} />
            const positive = player.cashOut - player.buyIn > 0;
            const balance =  `${positive ? '+':''}${player.cashOut - player.buyIn}₪`;
            //cashOuts
            const inOuts = player.extra ? [
                ...(player.extra.buyIns || []).map(bi=> ({ time:bi.time, text: `${bi.time.AsExactTime(2)} +${bi.amount}₪ buy in`})),
                ...(player.extra.cashOuts || []).map(co=> ({ time:co.time, text: `${co.time.AsExactTime(2)} +${co.amount}₪ cash out`}))
            ].sort((a,b) => a.time < b.time ? -1 : 1) : [];
            return  (<div key={`player${index}`} className="mobile-player">

                        {image}
                        <span className="margin-both-sides">{player.name}:</span>

                         {inOuts.map(item => (<div key={`${player.name}-${item.time}-${item.text}`} className="gray">{item.text}  </div>))}
                         bottom line:  {balance}

            </div>);
        });

        let inouts = game.playersData.map(player=>{
            const { name, imageUrl } = groupPlayers.find(p=>p.id === player.playerId);
            return {...player, name, imageUrl };
        }).map((player)=>{
            const onImageError = (ev)=>{
                if (player.imageUrl && player.imageUrl.length>1 && !ev.target.secondTry){
                    ev.target.secondTry = true;
                    ev.target.src=player.imageUrl;
                }else{
                    ev.target.src=ANON_URL;
                }
            };
            const image =  <img alt={player.name} className="activeGameCircleImage" src={player.imageUrl || ANON_URL}  onError={onImageError} />
            //cashOuts
            const inOuts = player.extra ? [
                ...(player.extra.buyIns || []).map(bi=> ({ time:bi.time, image, timeText:bi.time.AsExactTime(2), text: `${player.name} added +${bi.amount}₪`})),
                ...(player.extra.cashOuts || []).map(co=> ({ time:co.time, image, timeText:co.time.AsExactTime(2), text: `${player.name} took ${co.amount}₪`}))
            ] : [];
           return inOuts;
        });
        inouts = inouts.reduce((all,item)=>{
            return [...all,...item]
        }, []).sort((a,b) => a.time < b.time ? -1 : 1).map((item,index) => (<div className="inout-border" key={`${index}-itemm`} >{item.timeText} {item.image} {item.text}</div>));

        return (
            <div className="mobile-players">
                {players}

                <hr/>
                {inouts}
            </div>);
    }

    getAsPokerTable = () =>{
        const { game, group: { players:  groupPlayers}} = this.props;
        const players = game.playersData.map(player=>{
            let all = player.buyIn;
            const bluesCount =  Math.floor(all/50);
            const hasBlue = bluesCount>0;
            all -= 50 * bluesCount;
            const greensCount = Math.floor(all/25);
            const hasGreen = greensCount>0;
            all -= 25 * greensCount;

            const blacksCount =  Math.floor(all/10);
            const hasBlack = blacksCount>0;
            all -= 10 * blacksCount;

            const redsCount =  Math.floor(all/5);
            const hasRed = redsCount>0;

            all -= 5 * redsCount;
            const greysCount = all;
            const hasGrey = greysCount >0;
            const { name, imageUrl } = groupPlayers.find(p=>p.id === player.playerId);
            return {...player, hasBlue, bluesCount,hasGreen, greensCount,hasBlack, blacksCount,hasRed, redsCount,hasGrey, greysCount, name, imageUrl}
        }).map((player, index)=>{
            const onImageError = (ev)=>{
                if (player.imageUrl && player.imageUrl.length>1 && !ev.target.secondTry){
                    ev.target.secondTry = true;
                    ev.target.src=player.imageUrl;
                }else{
                    ev.target.src=ANON_URL;
                }
            };
            const image =  <img alt={player.name} className="activeGameCircleImage" src={player.imageUrl || ANON_URL}  onError={onImageError} />
            const positive = player.cashOut - player.buyIn > 0;
            const balance = player.cashOut ? `${positive ? '+':''}${player.cashOut - player.buyIn}₪` : '';
                return  (<div key={`player${index}`}>
                        <div className={`player player-${(index + 1)}`}>
                            <div className="balance-value">{balance}</div>
                           <div className="bank">
                               <div className="bank-value">{ player.buyIn}</div>
                               {player.hasBlue ? <div className="jetons v-50">x{player.bluesCount}</div> :<div/>}
                               {player.hasGreen ?<div className="jetons v-25">x{player.greensCount}</div> :<div/>}
                               {player.hasBlack ?<div className="jetons v-10">x{player.blacksCount}</div> :<div/>}
                               {player.hasRed ?<div className="jetons v-5">x{player.redsCount}</div> :<div/>}
                               {player.hasGrey ?<div className="jetons v-1">x{player.greysCount}</div> :<div/>}
                           </div>
                           <div className="avatar">{image}</div>
                           <div className="name">{player.name.split(' ')[0]}</div>

                        </div>
                    </div>);
        });

       return (
           <div className="vue-container">
               <div className="table">
                   <div className="players">
                       {players}
                   </div>
                </div>
           </div>);
    };

    onEditClicked = ()=>{
        this.props.onGameEditClick();
    }
    onBackClicked = ()=>{
        if ( this.interval ){
            clearInterval(this.interval);
            this.interval = null;
        }
        this.props.onBack();
    };

    render = () =>{
        if (!this.interval ){
            this.interval = setInterval(this.props.updateOnProgressGame,5000);
            setTimeout(()=>{
                console.log('going to show the game now..');
                document.getElementById("ongoingGameTopBuffer").scrollIntoView();
            } ,1000)
        }

        const {onBack, game, group} = this.props;
        const {isAdmin} = group;
        if (!game){
            return (
                <div>
                    no game
                    <div className="backButton">
                        <button className="button" onClick={onBack}> Back</button>
                    </div>
                </div>);
        }
        const totalCashouts = game.playersData.map(pd=>pd.cashOut).reduce((total, num)=>  total + num, 0);
        const totalBuyIn = game.playersData.map(pd=>pd.buyIn).reduce((total, num)=>  total + num, 0);

        const players =  this.getAsPokerTable() ;
        const mobilePlayers = this.getPlayersDataAsList()
        const isMobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

        return (
            <div className="viewGamePopupInner" >
                <div id="ongoingGameTopBuffer" > </div>
                <div >
                    <h3 >Ongoing game..  {(typeof game.date === 'string' ? new Date(game.date) : game.date).AsGameName()}</h3>
                    <h4>{game.playersData.length} Players. {game.description} </h4>
                    <br/>
                    <div className="backButton">
                        <button className="button " onClick={this.onBackClicked}> Back</button>
                        <button className="button left-margin" onClick={this.onEditClicked}> Edit</button>
                        {isAdmin && <button onClick={this.props.deleteSelectedGame} className="button left-margin">Delete</button>}

                        { isMobile ? <div className="potInTheMiddle">{totalBuyIn-totalCashouts}₪ In Pot</div> : <div/>}
                    </div>

                </div>
                { isMobile ? mobilePlayers : players}
                { isMobile ? <div/> : <div className="potInTheMiddle">{totalBuyIn-totalCashouts}₪ In Pot</div>}

            </div>);

    }
}

export default OnGoingGame;

