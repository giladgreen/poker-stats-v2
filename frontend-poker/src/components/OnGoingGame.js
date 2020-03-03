import React, { Component } from 'react';
import CONSTS from '../CONSTS';
const { ANON_URL } = CONSTS;

class OnGoingGame extends Component {

    createPlayerRow = (playerData) =>{
        const { game, group: { players: groupPlayers }  } = this.props;
        const playersCount = game.playersData.length;

        const { buyIn, cashOut, playerId} = playerData;
        const { name, imageUrl='' } = groupPlayers.find(p=>p.id === playerId);
        const bottomLine = (parseInt(cashOut) - parseInt(buyIn));
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
            return {...player, name, imageUrl}
        }).map((player, index)=>{
            console.log('player',player)
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
            return  (<div key={`player${index}`} className="mobile-player">

                        {image}
                        <span className="margin-both-sides">{player.name}:</span>

                        {balance}

            </div>);
        });

        return (
            <div className="mobile-players">
                {players}
            </div>);
    }
    getAsPokerTable = () =>{
        const { game, group: { players:  groupPlayers}} = this.props;
        const players = game.playersData.map(player=>{
            let all = player.buyIn;
            const blues =  (50 * (Math.floor(all/50)));
            all = all - blues;
            const hasBlue = blues>0;
            const greens =  (25 * (Math.floor(all/25)));
            all = all - greens;
            const hasGreen = greens>0;
            const blacks =  (10 * (Math.floor(all/10)));
            all = all - blacks;
            const hasBlack = blacks>0;
            const reds =  (5 * (Math.floor(all/5)));
            all = all - reds;
            const hasRed = reds>0;
            const hasGray = all >0;
            const { name, imageUrl } = groupPlayers.find(p=>p.id === player.playerId);
            return {...player, hasBlue,hasGreen,hasBlack,hasRed,hasGray, name, imageUrl}
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
                               {player.hasBlue ? <div className="jetons v-50"></div> :<div/>}
                               {player.hasGreen ?<div className="jetons v-25"></div> :<div/>}
                               {player.hasBlack ?<div className="jetons v-10"></div> :<div/>}
                               {player.hasRed ?<div className="jetons v-5"></div> :<div/>}
                               {player.hasGray ?<div className="jetons v-1"></div> :<div/>}
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
            this.interval = setInterval(this.props.updateOnProgressGame,10000);
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
            <div className="viewGamePopupInner">
                <div>
                    <h3>Ongoing game. {(typeof game.date === 'string' ? new Date(game.date) : game.date).AsGameName()}</h3>
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

