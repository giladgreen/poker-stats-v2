

const __extends = (this && this.__extends) || (function () {
  var extendStatics = function (d, b) {
    extendStatics = Object.setPrototypeOf
            || ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; })
            || function (d, b) { for (const p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
  };
  return function (d, b) {
    if (typeof b !== 'function' && b !== null) throw new TypeError(`Class extends value ${String(b)} is not a constructor or null`);
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}());
Object.defineProperty(exports, '__esModule', { value: true });
const lib_1 = require('passport-oauth/lib');
const config_1 = require('./../../config');

const options = {
  clientID: config_1.GOOGLE_AUTH_CLIENT_ID,
  clientSecret: config_1.GOOGLE_AUTH_CLIENT_SECRET,
  authorizationURL: 'https://accounts.google.com/o/oauth2/auth',
  tokenURL: 'https://accounts.google.com/o/oauth2/token',
};
const GoogleTokenStrategy = /** @class */ (function (_super) {
  __extends(GoogleTokenStrategy, _super);
  function GoogleTokenStrategy() {
    const _this = _super.call(this, options, () => true) || this;
    _this.options = options || {};
    _this.options.authorizationURL = _this.options.authorizationURL || 'https://accounts.google.com/o/oauth2/auth';
    _this.options.tokenURL = _this.options.tokenURL || 'https://accounts.google.com/o/oauth2/token';
    _this.name = 'google-token';
    return _this;
  }
  GoogleTokenStrategy.prototype.authenticate = function (accessToken) {
    const _this = this;
    return new Promise(((resolve, reject) => {
      // eslint-disable-next-line no-underscore-dangle
      _this._oauth2.get('https://www.googleapis.com/oauth2/v1/userinfo', accessToken, (err, body) => {
        if (err) {
          return reject(new lib_1.InternalOAuthError('failed to fetch user profile', err));
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
    }));
  };
  return GoogleTokenStrategy;
}(lib_1.OAuth2Strategy));
exports.default = new GoogleTokenStrategy();
// # sourceMappingURL=google-auth.js.map
