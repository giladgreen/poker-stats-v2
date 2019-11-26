// process.env.NODE_ENV = 'local';
module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  SERVER_PORT: process.env.PORT || 5000,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  FACEBOOK_AUTH_CLIENT_ID: process.env.FACEBOOK_AUTH_CLIENT_ID || '2487592561563671',
  FACEBOOK_AUTH_CLIENT_SECRET: process.env.FACEBOOK_AUTH_CLIENT_SECRET || '***',
  GOOGLE_AUTH_CLIENT_ID: process.env.GOOGLE_AUTH_CLIENT_ID || '819855379342-js3mkfftkk25qopes38dcbhr4oorup45.apps.googleusercontent.com',
  GOOGLE_AUTH_CLIENT_SECRET: process.env.GOOGLE_AUTH_CLIENT_SECRET || '***m',
  STORAGE: process.env.STORAGE || 'DB',
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://rfis:12345@localhost:5432/pokerstats',
  URL_PREFIX: process.env.URL_PREFIX || 'http://localhost:5000/api/v2' || 'http://www.poker-stats.com/api/v2',
  GOOGLE_CLIENT_ID: '819855379342-js3mkfftkk25qopes38dcbhr4oorup45.apps.googleusercontent.com',
  FACEBOOK_APP_ID: '2487592561563671',
  ANON_URL: 'https://green-pokerstats.herokuapp.com/images/anonymous2.png',
};
