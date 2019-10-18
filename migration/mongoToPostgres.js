const models = require('../api/models');
const {createGame} = require('../api/services/games');
const data = require('./data');
const mapping = {};
function convertDate(date){
    if (!date || date ==='null') {
        return new Date();
    }
    const day = parseInt(date.substr(0,2));
    const month = parseInt(date.substr(3,2));
    const year = parseInt(date.substr(6,4));
    const result = new Date(`${year}-${month}-${day}`);
    return result;
}

async function clearAllDataFromDB(){
    await models.sequelize.query('DELETE from games_data');
    await models.sequelize.query('DELETE from games');
    await models.sequelize.query('DELETE from players');
    await models.sequelize.query('DELETE from groups');
}

async function createPlayers(groupId){

    const playersToCreate = Object.values(data.players).map(({firstName, familyName, email, phone, imageUrl, birthdate})=>{
        const birthday = new Date(convertDate(birthdate));
        return {
            firstName,
            familyName,
            email,
            phone,
            imageUrl,
            birthday,
            groupId
        };
    });
    const players = await Promise.all(playersToCreate.map(player => models.players.create(player).catch(err=>{
        console.log(err)
    })));
    console.error('## players created:', players.length);
    players.forEach((player, index)=>{
        mapping[Object.values(data.players)[index].id] = player.id;
        console.error('##     ', player.firstName, ' ', player.familyName);
    });
}
async function createGames(groupId) {
    const gamesToCreate = data.games.map(({name, extraData, players})=>{
        const playersData = players.map(({id, exit,enter}) =>{
            const playerId = mapping[id];
            if (!playerId) {
                console.error('!!!!!!!!!!! player id not found in mapping', { id })
            }
            const buyIn = parseInt(enter);
            const cashOut = parseInt(exit);

            return {
                playerId,
                buyIn,
                cashOut,
            } ;
        });
        return {
            date: convertDate(name),
            description: extraData,
            playersData,
            groupId
        };
    });

    const games = await Promise.all(gamesToCreate.map(game => createGame(groupId, game)));

    console.error('## games created:', games.length);
    games.forEach((game, index)=>{
        console.error(`##  ${(index+1)})   `, game.description, ' ', game.date);
    });
}
async function doStuff() {

    await clearAllDataFromDB();

    const group = await models.groups.create({name: data.name});
    const groupId = group.id;
    console.error('## group created:', data.name);

    await createPlayers(groupId);
    await createGames(groupId);


    console.log('########')
    console.log('DONE')
}
doStuff();
