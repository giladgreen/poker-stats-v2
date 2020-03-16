import React from 'react'
import _ from "lodash";

function getMappings (positivePlayers, negativePlayers){
    //console.log('getMappings ', positivePlayers.length,negativePlayers.length);
    if (positivePlayers.length === 0 || negativePlayers.length===0){
        return []
    }
    if (positivePlayers.length === 1 && negativePlayers.length===1){
        if (positivePlayers[0].balance === negativePlayers[0].balance){
            return [{
                from: negativePlayers[0],
                to: positivePlayers[0],
                amount: negativePlayers[0].balance
            }];
        } else{
            console.log('positivePlayers',positivePlayers);
            console.log('negativePlayers',negativePlayers);
            throw new Error('WTF, this does not make sense',)
        }
    }

    const intersection = _.intersectionBy(negativePlayers, positivePlayers, 'balance');
    const mapping = [];
    if (intersection && intersection.length > 0){
        for (const negativePlayer of intersection){
            const negative = negativePlayers.find(p => p.balance === negativePlayer.balance);
            const positive = positivePlayers.find(p => p.balance === negativePlayer.balance);
            if (negative && positive){
                mapping.push({
                    from: negative,
                    to: positive,
                    amount: positive.balance
                });
                negativePlayers = negativePlayers.filter(p => p.id !== negativePlayer.id);
                positivePlayers = positivePlayers.filter(p => p.id !== positive.id);
            }
        }
    }

    negativePlayers = negativePlayers.sort((a,b)=> a.balance < b.balance ? -1 : 1);
    positivePlayers = positivePlayers.sort((a,b)=> a.balance < b.balance ? -1 : 1);

    const firstNegative = negativePlayers[0];
    const firstPositive = positivePlayers[0];
    if (firstNegative.balance > firstPositive.balance){
        // firstNegative = 40
        // firstPositive = 30
        mapping.push({
            from: firstNegative,
            to: firstPositive,
            amount: firstPositive.balance
        });
        positivePlayers = positivePlayers.filter(p => p.id !== firstPositive.id);
        negativePlayers = negativePlayers.map(p => {
            if (p.id !== firstNegative.id){
                return p;
            } else{
                return { ...p, balance: firstNegative.balance - firstPositive.balance}
            }
        });

    } else if (firstNegative.balance < firstPositive.balance){
        // firstNegative = 30
        // firstPositive = 40
        mapping.push({
            from: firstNegative,
            to: firstPositive,
            amount: firstNegative.balance
        });
        negativePlayers = negativePlayers.filter(p => p.id !== firstNegative.id);

        positivePlayers = positivePlayers.map(p => {
            if (p.id !== firstPositive.id){
                return p;
            } else{
                return { ...p, balance: firstPositive.balance - firstNegative.balance}
            }
        });
    }

    return [...mapping, ...getMappings(positivePlayers, negativePlayers)];

}
function getWhoOweWhoMapping(game, group){
    const gamePlayersData = game.playersData.map(player=>{
        const data = group.players.find(p=> p.id === player.playerId);
        return {
            id: player.playerId,
            name: data.name,
            imageUrl: data.imageUrl,
            cashOut: player.cashOut,
            buyIn: player.buyIn,
            balance:  player.cashOut -  player.buyIn
        }
    });

    const positivePlayers = gamePlayersData.filter(player => player.balance > 0).sort((a,b)=> a.balance < b.balance ? -1 : 1);
    const negativePlayers = gamePlayersData.filter(player => player.balance < 0).map(player => ({...player, balance: -1 * player.balance})).sort((a,b)=> a.balance < b.balance ? -1 : 1);
    console.log('positivePlayers',positivePlayers);
    console.log('negativePlayers',negativePlayers);
    const mapping = getMappings(positivePlayers, negativePlayers).sort((a,b)=> {
        if (a.from.id < b.from.id) {
            return -1;
        } else if (a.from.id > b.from.id){
            return 1
        } else{
            return (a.amount < b.amount ? -1 : 1);
        }
    });
   // console.log('result mapping', mapping.map(item=>`from ${item.from.name} to ${item.to.name}: ${item.amount}`))
    return mapping;
}

const WhoOwesWho = (props) => {
    console.log('WW props',props)
    const {game, group} = props;
    const mappings = getWhoOweWhoMapping(game, group);
    return (
        <div>
            {mappings.map(item=> {
                return <div className='from-to-row' key={`_from_${item.from.id}_to${item.to.id}`}> <b> {item.from.name} </b> should give <b> {item.amount}₪ </b> to <b> {item.to.name} </b> </div>
            })}
        </div>

    )
}

export default WhoOwesWho;
