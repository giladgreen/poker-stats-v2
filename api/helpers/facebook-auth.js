const { OAuth2Strategy } = require('passport-oauth/lib');
// eslint-disable-next-line no-underscore-dangle
const _passportOauth = require('passport-oauth');

const options = {
  clientID: process.env.FACEBOOK_AUTH_CLIENT_ID || 'xxx',
  clientSecret: process.env.FACEBOOK_AUTH_CLIENT_SECRET || 'xxx',
  authorizationURL: 'https://www.facebook.com/v2.6/dialog/oauth',
  tokenURL: 'https://graph.facebook.com/v2.6/oauth/access_token',
};

class FacebookTokenStrategy extends OAuth2Strategy {
  constructor() {
    super(options, () => true);
    this.options = options || {};
    this.options.authorizationURL = 'https://accounts.google.com/o/oauth2/auth';
    this.options.tokenURL = 'https://accounts.google.com/o/oauth2/token';
    this.name = 'google-token';
    this.profileURL = 'https://graph.facebook.com/v2.6/me?fields=last_name,first_name,middle_name,email,picture';
  }

  authenticate(accessToken) {
    return new Promise((resolve, reject) => {
      try {
        // eslint-disable-next-line no-underscore-dangle
        this._oauth2.get(this.profileURL, accessToken, (error, body) => {
          if (error) {
            return reject(new _passportOauth.InternalOAuthError('Failed to fetch user profile', error));
          }
          try {
            const json = JSON.parse(body);
            const profile = {
              provider: 'facebook',
              email: json.email,
              familyName: json.last_name,
              firstName: json.first_name,
              imageUrl: `https://graph.facebook.com/v2.6/${json.id}/picture`,
              token: accessToken,
            };

            return resolve(profile);
          } catch (e) {
            return reject(e);
          }
        });
      } catch (error) {
        throw error;
      }
    });
  }
}

module.exports = new FacebookTokenStrategy();
