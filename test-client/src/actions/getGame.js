
import URL_PREFIX from '../url';
import request from 'request';

async function getGame(groupId, gameId, provider, token){
    return new Promise((resolve,reject)=>{
        const options = {
            method: 'GET',
            url: `${URL_PREFIX}/groups/${groupId}/games/${gameId}`,
            headers:{
                provider,
                "x-auth-token": token,
                "Content-Type":'application/json'
            }
        };

        request(options, (error, response, body) =>{
            if (error || response.statusCode>=400){
                if (error){
                    console.error('request cb error.failed to get game data', error);
                    return reject('failed to get game data');
                }else{
                    const bodyObj = JSON.parse(body) ;
                    console.error('failed to get game data',bodyObj);
                    return reject(bodyObj.title);
                }
            }else{
                const game = JSON.parse(body);
                return resolve(game);
            }
        });
    })
};

export default getGame;
