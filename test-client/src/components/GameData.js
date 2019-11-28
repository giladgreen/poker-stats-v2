import React, { Component } from 'react';
import { ANON_URL, GREEN, RED, TRANSPARENT } from '../../../config';

import Size from '../sizes';
const  {Width} = Size;
class GameData extends Component{

    constructor(props){
        super(props);
    }

    getPlayerImage(playerInfo, playerWidth, margin){
        const isLoggedInPlayer = playerInfo.isMe;
        const key = `${playerInfo.playerId}_item_image`;

        const imgWidth = playerWidth - margin;
        const imgHeight = imgWidth * 1.36;
        const ImgStyleObject = {
            width:imgWidth,
            height: imgHeight,
            marginRight:margin,
        };
        if (isLoggedInPlayer){
            ImgStyleObject.border="4px solid yellow"
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

        return (<img key={key}  alt={playerName} style={ImgStyleObject} className="GamePlayerImage" src={playerInfo.imageUrl} onError={onImageError} />);
    }

    getNamesSection(playersData, playerWidth, margin, first){
        return playersData.map(playerData=>{
            console.log('playerData',playerData);
            const key = `${playerData.playerId}_item_name`;
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
                <div key={key} style={styleObject} className={className}>
                    {displayName}
                </div>
            );
        });
    }

    render(){
        const {Group, Game} = this.props;
        const {players} = Group;
        const {playersData} = Game;
        const playersInfo = playersData.map(playerData=>{
            const data = { ...playerData }
            const playerObject = players.find(player=>player.id ===data.playerId);
            data.dif = data.cashOut-data.buyIn;
            data.val = data.dif> 0 ?  `+${data.dif}` : `${data.dif}`;
            data.imageUrl = playerObject.imageUrl;
            data.isMe = playerObject.isMe;
            data.name = playerObject.name;
            return data;
        }).sort((a,b)=> a.dif > b.dif ? -1 : 1);


        const isMobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        const margin =isMobile ? 2: 5;

        const hasNegatives = playersInfo.filter(p=>p.dif<=0).length > 0;


        const playerWidth = Width / players.length;
        const PlayerImages = playersInfo.map((playerInfo)=> this.getPlayerImage(playerInfo, playerWidth, margin));

        const PlayerNames1 =  this.getNamesSection(playersInfo,playerWidth,margin,true);
        const PlayerNames2 =  this.getNamesSection(playersInfo,playerWidth,margin,false);

        const CurrencySign = '₪';
        const PlayerBalance = playersInfo.map(playerInfo=>{
            const key = `${playerInfo.playerId}_item_balance`;
            const {val} = playerInfo;
            const styleObject = {
                width:playerWidth-margin,
                marginRight:margin,
            };
            return  (
                <div key={key} style={styleObject} className="GamePlayerBalace"  >
                    {val}<span className="GamePlayerBalaceCurrencySign">{CurrencySign}</span>
                </div>
            );
        });

        const PlayerRankingBalance= hasNegatives ? <div/> :( playersInfo.map(playerInfo=>{
            const key = `${playerInfo.playerId}_item_Rankingbalance`;

            const styleObject = {
                width:playerWidth-margin,
                marginRight:margin,
            }
            return  (
                <div key={key} style={styleObject} className="GamePlayerBalace"  >
                    {playerInfo.val}
                </div>
            );
        }));

        const maxPositive = playersInfo[0].dif;

        const positiveRatio =  100/maxPositive;
        let GamePlayerPositives = playersInfo.map((playerInfo)=>{

            const key = `$playerInfo.playerId}_item_positiveDiv`;
            let imageUrl = playerInfo.dif > 0 ? GREEN : TRANSPARENT;
            const height =  playerInfo.dif>0 ? positiveRatio* playerInfo.dif : 100;
            const barsStyleObject = {
                marginTop:(100 - height),
                width:playerWidth-margin,
                marginRight:margin,
                height
            }

            return  (
                <img key={key} className="barItemPositive" style={barsStyleObject} src={imageUrl}  />
            );
        });
        const maxNegative = playersInfo[playersInfo.length-1].dif;
        const negativeRatio =   100 / maxNegative;

        let GamePlayerNegatives = playersInfo.map(playerInfo=>{
            let imageUrl = playerInfo.dif < 0 ? RED: TRANSPARENT;
            const key = `${playerInfo.playerId}_item_negativeDiv`;
            const height = playerInfo.dif>0 ? 100 : negativeRatio* playerInfo.dif;

            const barsStyleObject = {
                marginTop:-1*(100 - height),
                width:playerWidth-margin,
                marginRight:margin,
                height
            }
            return  (
                <img key={key} className="barItemNegative" style={barsStyleObject} src={imageUrl}  />
            );
        });

        GamePlayerPositives = (<div className="GamePlayerBars" >
            {GamePlayerPositives}
        </div>);

        GamePlayerNegatives = hasNegatives ? (<div className="GamePlayerBars" >
            {GamePlayerNegatives}
        </div>) : <div/>

        return (
            <div className="allPlayersSummary col-xs-12">
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
                <br/>
                <br/>
                {GamePlayerPositives}
                {PlayerRankingBalance}
                {GamePlayerNegatives}
                <br/>
                <br/>  <br/>
                <br/>
            </div>
        );


    }
}

export default GameData;

