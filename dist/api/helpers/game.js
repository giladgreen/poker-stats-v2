

Object.defineProperty(exports, '__esModule', { value: true });
function isGameReady(playersData) {
  if (!playersData) {
    return false;
  }
  if (playersData.length < 2) {
    return false;
  }
  if (playersData.some(player => player.cashOut < 0 || player.buyIn <= 1)) {
    return false;
  }
  let gameSum = 0;
  playersData.forEach((player) => {
    gameSum += player.cashOut;
    gameSum -= player.buyIn;
  });
  return gameSum === 0;
}
exports.default = {
  isGameReady,
};
// # sourceMappingURL=game.js.map
