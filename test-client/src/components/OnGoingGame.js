import React, { Component } from 'react';
import { ANON_URL } from '../../../config';

import Size from '../sizes';
const  {Width,Height} = Size;
const widthLeftPad = (Width * 0.42);
const heightTopPad = (Height * 0.35);

const widthRatio = ((Width / 100) * 80) / 100;
const heightRatio = ((Height / 100) * 60) /100;

const baseRadius = 50;
const baseLocations = (new Array(10)).fill(0,0,10).map((item, totalPlayers) =>{
    const stepSize = 360 / totalPlayers;
    return (new Array(totalPlayers)).fill(0,0, totalPlayers).map((b, index)=>{
        const degree = (450 - (stepSize* index)) % 360;
        const x = Math.cos(degree * Math.PI / 180) * baseRadius;
        const y = Math.sin(degree * Math.PI / 180) * baseRadius;
        return {
            left: x,
            top: y
        };
    });
});

const locations = baseLocations.map(arr=>arr.map(({left, top})=>({ left: (left * widthRatio)+widthLeftPad  , top: (top* heightRatio)+heightTopPad })));


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

    createPlayerCircleElement = (playerData) => {
        const { game, group: { players:  groupPlayers} } = this.props;
        const playersCount = game.playersData.length-2;
        const { buyIn, cashOut} = playerData;
        const buyInValue = `${buyIn>0?'+':''}${buyIn}₪`;
        const cashOutValue = `${cashOut>0?'+':''}${cashOut}₪`;

        const { name, imageUrl } = groupPlayers.find(p=>p.id === playerData.playerId);
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
            <div className="activeGamePlayerCircleItem">
                <div className="centeredText">
                    { name }
                </div>
                <div>
                    <img alt={name} className="activeGameCircleImage" style={imageStyle}  src={imageUrl || ANON_URL}  onError={onImageError} />

                </div>
                <div className="centeredText">
                    { buyInValue} / { cashOutValue}
                </div>
            </div>
        );

    }

    getAsCircle = () =>{
        const { game} = this.props;
        const playersLocations = locations[game.playersData.length];
        const players = game.playersData.map(this.createPlayerCircleElement).map((player, index)=>{
            const elementStyle = {
                position: 'absolute',
                ...playersLocations[index]
            };
            return (  <div style={elementStyle} >
                {player}
            </div>);
        });

        return (
            <div className="row activeGameTextSize">
                <hr/>
                {players}
            </div>
        );
    }
    getAsTable = () =>{
        const { game} = this.props;

        const playersHeader = (
            <div className="col-xs-12 activeGameSmallHeaderTextSize">
                <div className="col-xs-6 centeredText">
                    Player
                </div>
                <div className="col-xs-2 ">
                    Buy-in
                </div>
                <div className="col-xs-2 ">
                    Cash-out
                </div>
                <div className="col-xs-2 ">
                    Balance
                </div>
            </div>
        );
        const players = game.playersData.map(this.createPlayerRow);

        return (
            <div className="row activeGameTextSize">
                <hr/>
                {playersHeader}
                <hr/>
                {players}

            </div>
        );
    }

    onBackClicked = ()=>{
        if ( this.interval ){
            clearInterval(this.interval);
            this.interval = null;
        }
        this.props.onBack();
    }
    render = () =>{
        if (!this.interval ){
            this.interval = setInterval(this.props.updateOnProgressGame,10000);
        }

        const {onBack, game} = this.props;
        if (!game){
            return (
                <div>
                    no game
                    <div className="backButton">
                        <button className="button" onClick={onBack}> Back</button>
                    </div>
                </div>);
        }
        const totalBuyIn = game.playersData.map(pd=>pd.buyIn).reduce((total, num)=>  total + num, 0);

        const players = (game.playersData.length >3 && game.playersData.length < 10) ? this.getAsCircle() : this.getAsTable();

        return (<div className="popupOuter">
            <div className="viewGamePopupInner">
                <div>
                    <h3>Ongoing game. {game.date.AsGameName()}</h3>
                    <h4>{game.description}. {game.playersData.length} Players</h4>

                    <div className="backButton">
                        <button className="button" onClick={this.onBackClicked}> Back</button>
                    </div>

                </div>
                {players}
                 <div className="potInTheMiddle">{totalBuyIn} In Pot</div>


            </div>
        </div>);

    }
}

export default OnGoingGame;

