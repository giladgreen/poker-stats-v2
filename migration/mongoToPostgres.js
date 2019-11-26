const models = require('../api/models');
console.log('models',models)
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
    return `${year}-${month}-${day}`;
  //  const result = new Date(year, month-1,day,0,0,0);
  //  return result;
}

async function createTables(){
    console.log('createTables start');

    try {
        await models.sequelize.query(`
        CREATE TABLE groups (
                id text PRIMARY KEY,
                name text,
                description text DEFAULT '',
                created_at timestamp without time zone NOT NULL,
                updated_at timestamp without time zone NOT NULL,
                deleted_at timestamp without time zone
            );
        `);

        await models.sequelize.query(`
        CREATE TABLE games (
                id text PRIMARY KEY,
                description text,
                date timestamp without time zone,
                group_id text REFERENCES groups(id),
                created_at timestamp without time zone NOT NULL,
                updated_at timestamp without time zone NOT NULL,
                deleted_at timestamp without time zone,
                ready boolean DEFAULT false
            );
        `);

        await models.sequelize.query(`
        CREATE TABLE players (
                id text PRIMARY KEY,
                name text,
                email text,
                image_url text,
                group_id text REFERENCES groups(id),
                created_at timestamp without time zone NOT NULL,
                updated_at timestamp without time zone NOT NULL,
                deleted_at timestamp without time zone
            );
       `);

        await models.sequelize.query(`
        CREATE TABLE games_data (
                id text PRIMARY KEY,
                game_id text REFERENCES games(id),
                player_id text REFERENCES players(id),
                cash_out integer,
                buy_in integer,
                index integer,
                group_id text REFERENCES groups(id),
                created_at timestamp without time zone NOT NULL,
                updated_at timestamp without time zone NOT NULL,
                deleted_at timestamp without time zone
            );
       `);

        await models.sequelize.query(`
        CREATE TABLE users (
                id text PRIMARY KEY,
                first_name text,
                family_name text,
                email text,
                image_url text,
                token text,
                token_expiration timestamp without time zone NOT NULL,
                created_at timestamp without time zone NOT NULL,
                updated_at timestamp without time zone NOT NULL,
                deleted_at timestamp without time zone
            );
       `);

        await models.sequelize.query(`
        CREATE TABLE users_players (
                id text PRIMARY KEY,
                player_id text,
                user_id text,
                group_id text,
                is_admin boolean,
                created_at timestamp without time zone NOT NULL,
                updated_at timestamp without time zone NOT NULL,
                deleted_at timestamp without time zone
            );
       `);

        await models.sequelize.query(`
        CREATE TABLE invitations_requests (
                id text PRIMARY KEY,
                user_id text,
                group_id text,
                Status text,
                created_at timestamp without time zone NOT NULL,
                updated_at timestamp without time zone NOT NULL,
                deleted_at timestamp without time zone
            );
       `);

    } catch (e) {
        console.error('createTables',e)
    }
    console.log('createTables end');

}

async function clearAllDataFromDB(groupId){

    const group = await models.groups.findOne({name: data.name});
    if (group){
        const groupId = group.id;
        console.log('clearAllDataFromDB start');
        await models.sequelize.query(`DELETE from games_data where group_id = '${groupId}'`);
        await models.sequelize.query(`DELETE from games where group_id = '${groupId}'`);
        await models.sequelize.query(`DELETE from players where group_id = '${groupId}'`);
        await models.sequelize.query(`DELETE from users_players where group_id = '${groupId}'`);
        await models.sequelize.query(`DELETE from games_data where group_id = '${groupId}'`);
        await models.sequelize.query(`DELETE from invitations_requests where group_id = '${groupId}'`);
        await models.sequelize.query(`DELETE from groups where id = '${groupId}'`);
        console.log('clearAllDataFromDB end');
    }else{
        console.log('clearAllDataFromDB skip');
    }


}

async function createPlayers(groupId){

    const playersToCreate = Object.values(data.players).map(({firstName, familyName,isAdmin})=>{

        return {
            name: `${firstName} ${familyName}`,
            firstName,
            familyName,
            isAdmin,
            groupId
        };
    });
    const players = await Promise.all(playersToCreate.map(player => models.players.create(player).catch(err=>{
        console.error(err)
    })));
    players.map((player, index)=>{
        mapping[Object.keys(data.players)[index]] = player.id;
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

    await Promise.all(gamesToCreate.map(game => createGame(groupId, game)));
}
async function doStuff() {
    console.log('migration start')
    console.log('################')
    await createTables();
    await clearAllDataFromDB();

    const group = await models.groups.create({name: data.name});
    const groupId = group.id;

    await createPlayers(groupId);
    await createGames(groupId);


    console.log('########')
    console.log('DONE')
}
doStuff();
