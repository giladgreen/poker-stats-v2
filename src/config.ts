// process.env.NODE_ENV = 'local';
export const NODE_ENV= process.env.NODE_ENV;
export const SERVER_PORT= process.env.PORT || 5001;
export const EMAIL_USER= process.env.EMAIL_USER;
export const EMAIL_PASSWORD= process.env.EMAIL_PASSWORD;
export const FACEBOOK_AUTH_CLIENT_ID= process.env.FACEBOOK_AUTH_CLIENT_ID || '2487592561563671';
export const FACEBOOK_AUTH_CLIENT_SECRET= process.env.FACEBOOK_AUTH_CLIENT_SECRET || '***';
export const GOOGLE_AUTH_CLIENT_ID= process.env.GOOGLE_AUTH_CLIENT_ID || '819855379342-js3mkfftkk25qopes38dcbhr4oorup45.apps.googleusercontent.com';
export const GOOGLE_AUTH_CLIENT_SECRET= process.env.GOOGLE_AUTH_CLIENT_SECRET || '***m';
export const STORAGE= process.env.STORAGE || 'DB';
export const DATABASE_URL= process.env.DATABASE_URL || 'postgres://rfis:12345@localhost:5432/pokerstats';
export const URL_PREFIX= process.env.URL_PREFIX;
export const GOOGLE_CLIENT_ID= '819855379342-js3mkfftkk25qopes38dcbhr4oorup45.apps.googleusercontent.com';
export const FACEBOOK_APP_ID= '2487592561563671';
export const ANON_URL= 'https=//res.cloudinary.com/www-poker-stats-com/image/upload/v1620552184/anonymous2.png';
export const GREEN= 'https=//res.cloudinary.com/www-poker-stats-com/image/upload/v1620552183/green.png';
export const RED= 'https=//res.cloudinary.com/www-poker-stats-com/image/upload/v1620552183/red.png';
export const WHITE= 'https=//green-pokerstats.herokuapp.com/images/white.png';
export const TRANSPARENT= 'https://res.cloudinary.com/www-poker-stats-com/image/upload/v1620552183/transparent.png';

console.log('DATABASE_URL',DATABASE_URL)
