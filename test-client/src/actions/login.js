import { URL_PREFIX } from '../../../config';
import request from 'request';


export default async (provider, token)=>{
    return new Promise((resolve,reject)=>{
        const options = {
            url: `${URL_PREFIX}/groups/`,
            headers:{
                provider,
                "x-auth-token": token,
                "Content-Type":'application/json'
            }
        };

        request(options, (error, response, body) =>{
            if (error || response.statusCode>=400){
                if (error){
                    console.log('request cb error', error)
                    return reject('failed to connect, server might be down');
                }else{
                    const bodyObj = JSON.parse(body) ;
                    console.log('request cb error body', bodyObj)
                    return reject(bodyObj.title);
                }
            }

            if (response && response.headers && response.headers['x-user-context']){
                const userContextString = response.headers['x-user-context'];
                const userContext = JSON.parse(decodeURI(userContextString));
                const groups= JSON.parse(body).results
                const authData = localStorage.getItem('authData');
                let issueDate=  new Date();
                if (authData){
                    issueDate = JSON.parse(authData).issueDate;
                }
                localStorage.setItem('authData', JSON.stringify({provider, token, issueDate }));
                return resolve({groups, userContext, provider, token});
            } else{
                console.log('request cb no header')

                return reject('server response is missing the user context');
            }
        });
    })
};
