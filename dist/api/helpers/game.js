"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isGameReady(playersData) {
    if (!playersData) {
        return false;
    }
    if (playersData.length < 2) {
        return false;
    }
    if (playersData.some(function (player) { return player.cashOut < 0 || player.buyIn <= 1; })) {
        return false;
    }
    var gameSum = 0;
    playersData.forEach(function (player) {
        gameSum += player.cashOut;
        gameSum -= player.buyIn;
    });
    return gameSum === 0;
}
exports.default = {
    isGameReady: isGameReady,
};
//# sourceMappingURL=game.js.map