function isGameReady(playersData:any) {
  if (!playersData) {
    return false;
  }
  if (playersData.length < 2) {
    return false;
  }

  if (playersData.some((player:any) => player.cashOut < 0 || player.buyIn <= 1)) {
    return false;
  }
  let gameSum = 0;
  playersData.forEach((player:any) => {
    gameSum += player.cashOut;
    gameSum -= player.buyIn;
  });

  return gameSum === 0;
}

export default {
  isGameReady,
};
