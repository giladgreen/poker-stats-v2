
import URL_PREFIX from '../url';
import request from 'request';

async function getGroupImages(group, provider, token){
  return new Promise((resolve,reject)=>{
    const imagesOptions = {
      method: 'GET',
      url: `${URL_PREFIX}/groups/${group.id}/images/`,
      headers:{
        provider,
        "x-auth-token": token,
        "Content-Type":'application/json'
      }
    };
    let images;

   request(imagesOptions, (error, response, body) =>{
       if (error || response.statusCode>=400){
           if (error){
               console.error('request cb error.failed to get group images', error);
               return reject('failed to get group data');
           }else{
               const bodyObj = JSON.parse(body) ;
               console.error('failed to get group images',bodyObj);
               return reject(bodyObj.title);
           }
       }else{
           images = JSON.parse(body).results;
           return resolve(images);
       }

   });



  })
};

export default getGroupImages;
