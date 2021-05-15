import { OAuth2Strategy, InternalOAuthError } from 'passport-oauth/lib';
import { GOOGLE_AUTH_CLIENT_ID, GOOGLE_AUTH_CLIENT_SECRET } from './../../config';

const options = {
  clientID: GOOGLE_AUTH_CLIENT_ID,
  clientSecret: GOOGLE_AUTH_CLIENT_SECRET,
  authorizationURL: 'https://accounts.google.com/o/oauth2/auth',
  tokenURL: 'https://accounts.google.com/o/oauth2/token',
};

class GoogleTokenStrategy extends OAuth2Strategy {
  constructor() {
    super(options, () => true);
    this.options = options || {};
    this.options.authorizationURL = this.options.authorizationURL || 'https://accounts.google.com/o/oauth2/auth';
    this.options.tokenURL = this.options.tokenURL || 'https://accounts.google.com/o/oauth2/token';
    this.name = 'google-token';
  }

  authenticate(accessToken:string) {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-underscore-dangle
      console.log('*** calling auth on google with accessToken:',accessToken)
      console.log('*** get https://www.googleapis.com/oauth2/v1/userinfo')
      this._oauth2.get('https://www.googleapis.com/oauth2/v1/userinfo', accessToken, (err:any, body:any) => {
        if (err) {
          console.log('**************')
          console.log('*** got error:',err)
          console.log('**************')
          return reject(new InternalOAuthError('failed to fetch user profile', err));
        }
        try {
          const json = JSON.parse(body);
          const profile = {
            provider: 'google',
            email: json.email,
            firstName: json.given_name,
            familyName: json.family_name,
            imageUrl: json.picture,
            token: accessToken,
          };
          resolve(profile);
        } catch (e) {
          reject(e);
        }
      });
    });
  }
}

export default new GoogleTokenStrategy();
