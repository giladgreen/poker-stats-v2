"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("passport-oauth/lib");
var config_1 = require("./../../config");
var options = {
    clientID: config_1.GOOGLE_AUTH_CLIENT_ID,
    clientSecret: config_1.GOOGLE_AUTH_CLIENT_SECRET,
    authorizationURL: 'https://accounts.google.com/o/oauth2/auth',
    tokenURL: 'https://accounts.google.com/o/oauth2/token',
};
var GoogleTokenStrategy = /** @class */ (function (_super) {
    __extends(GoogleTokenStrategy, _super);
    function GoogleTokenStrategy() {
        var _this = _super.call(this, options, function () { return true; }) || this;
        _this.options = options || {};
        _this.options.authorizationURL = _this.options.authorizationURL || 'https://accounts.google.com/o/oauth2/auth';
        _this.options.tokenURL = _this.options.tokenURL || 'https://accounts.google.com/o/oauth2/token';
        _this.name = 'google-token';
        return _this;
    }
    GoogleTokenStrategy.prototype.authenticate = function (accessToken) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // eslint-disable-next-line no-underscore-dangle
            console.log('*** calling auth on google with accessToken:', accessToken);
            console.log('*** get https://www.googleapis.com/oauth2/v1/userinfo');
            _this._oauth2.get('https://www.googleapis.com/oauth2/v1/userinfo', accessToken, function (err, body) {
                if (err) {
                    console.log('**************');
                    console.log('*** got error:', err);
                    console.log('**************');
                    return reject(new lib_1.InternalOAuthError('failed to fetch user profile', err));
                }
                try {
                    var json = JSON.parse(body);
                    var profile = {
                        provider: 'google',
                        email: json.email,
                        firstName: json.given_name,
                        familyName: json.family_name,
                        imageUrl: json.picture,
                        token: accessToken,
                    };
                    resolve(profile);
                }
                catch (e) {
                    reject(e);
                }
            });
        });
    };
    return GoogleTokenStrategy;
}(lib_1.OAuth2Strategy));
exports.default = new GoogleTokenStrategy();
//# sourceMappingURL=google-auth.js.map