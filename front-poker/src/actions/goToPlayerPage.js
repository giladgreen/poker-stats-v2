const isMobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

async function sleep(time) {
  return new Promise((acc)=>{
    setTimeout(()=>{acc()},time);
  })
}
async function goToPlayerPage(playerId) {
  const id = `plyr_${playerId}`;
  await sleep(50);
  const playersItem = document.getElementById("uncontrolled-tab-example-tab-players");
  if (!playersItem) {
    console.log('could not found item by id: uncontrolled-tab-example-tab-players');
    return
  }
  playersItem.scrollIntoView();
  await sleep(100);
  playersItem.click();
  await sleep(300);
  const playerItem = document.getElementById(id);
  if (!playerItem) {
    console.log('could not found item by id: '+id);
    return
  }
  playerItem.scrollIntoView();
  await sleep(200);
  playerItem.click();
  await sleep(100);
  window.scrollTo(0, isMobile ? 200 : 250);
}

export default goToPlayerPage;
