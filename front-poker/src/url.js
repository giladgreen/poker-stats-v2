/* eslint-disable no-undef */
/* eslint-disable import/no-mutable-exports */
let URL_PREFIX = `${window.location.origin}/api/v2`;
if (URL_PREFIX === 'http://localhost:3000/api/v2') {
  URL_PREFIX = 'http://www.poker-stats.com/api/v2';
}
export default URL_PREFIX;
