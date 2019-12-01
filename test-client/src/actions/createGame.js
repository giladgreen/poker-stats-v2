
import URL_PREFIX from '../url';

import request from 'request';

async function createGame(groupId, gameDate, provider, token){
    return new Promise((resolve,reject)=>{
        const options = {
            method:'POST',
            url: `${URL_PREFIX}/groups/${groupId}/games`,
            body:JSON.stringify({date: gameDate}),
            headers:{
                provider: provider,
                "x-auth-token": token,
                "Content-Type":'application/json'
            }
        };
        request(options, (error, response, body) =>{
            if (error || response.statusCode>=400){
                if (error){
                    console.error('request cb error', error);
                    return reject('failed to create new game');
                }else{
                    const bodyObj = JSON.parse(body) ;
                    console.error('failed to create new game');
                    return reject(bodyObj.title);
                }
            } else{
                return resolve(JSON.parse(body));
            }
        });
    })
};

export default createGame;
