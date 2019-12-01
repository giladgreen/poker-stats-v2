
import URL_PREFIX from '../url';
import request from 'request';

async function deletePlayer(groupId,playerId, provider, token){
    return new Promise((resolve,reject)=>{
        const options = {
            method:'DELETE',
            url: `${URL_PREFIX}/groups/${groupId}/players/${playerId}`,
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
                    return reject('failed to delete player');
                }else{
                    const bodyObj = JSON.parse(body) ;
                    console.error('failed to delete player',bodyObj);
                    return reject(bodyObj.title);
                }
            } else{
                return resolve();
            }
        });
    })
};

export default deletePlayer;
