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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("passport-oauth/lib");
// eslint-disable-next-line no-underscore-dangle
var passport_oauth_1 = __importDefault(require("passport-oauth"));
var config_1 = require("./../../config");
var options = {
    clientID: config_1.FACEBOOK_AUTH_CLIENT_ID,
    clientSecret: config_1.FACEBOOK_AUTH_CLIENT_SECRET,
    authorizationURL: 'https://www.facebook.com/v2.6/dialog/oauth',
    tokenURL: 'https://graph.facebook.com/v2.6/oauth/access_token',
};
var FacebookTokenStrategy = /** @class */ (function (_super) {
    __extends(FacebookTokenStrategy, _super);
    function FacebookTokenStrategy() {
        var _this = _super.call(this, options, function () { return true; }) || this;
        _this.options = options || {};
        _this.options.authorizationURL = 'https://accounts.google.com/o/oauth2/auth';
        _this.options.tokenURL = 'https://accounts.google.com/o/oauth2/token';
        _this.name = 'google-token';
        _this.profileURL = 'https://graph.facebook.com/v2.6/me?fields=last_name,first_name,middle_name,email,picture';
        return _this;
    }
    FacebookTokenStrategy.prototype.authenticate = function (accessToken) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                // eslint-disable-next-line no-underscore-dangle
                _this._oauth2.get(_this.profileURL, accessToken, function (error, body) {
                    if (error) {
                        return reject(new passport_oauth_1.default.InternalOAuthError('Failed to fetch user profile', error));
                    }
                    try {
                        var json = JSON.parse(body);
                        var profile = {
                            provider: 'facebook',
                            email: json.email,
                            familyName: json.last_name,
                            firstName: json.first_name,
                            imageUrl: "https://graph.facebook.com/v2.6/" + json.id + "/picture",
                            token: accessToken,
                        };
                        return resolve(profile);
                    }
                    catch (e) {
                        return reject(e);
                    }
                });
            }
            catch (error) {
                throw error;
            }
        });
    };
    return FacebookTokenStrategy;
}(lib_1.OAuth2Strategy));
exports.default = new FacebookTokenStrategy();
//# sourceMappingURL=facebook-auth.js.map