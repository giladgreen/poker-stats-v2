async function goToPlayerPage(playerId) {
  console.log('goToPlayerPage ',playerId);
  setTimeout(()=>{
    document.getElementById("players-tab").scrollIntoView();
  } ,50);
  setTimeout(()=>{
    document.getElementById("players-tab").click();
  } ,150);
  setTimeout(()=>{
    document.getElementById(`plyr_${playerId}`).scrollIntoView();
  } ,400);
  setTimeout(()=>{
    document.getElementById(`plyr_${playerId}`).click();
  } ,600);
}

export default goToPlayerPage;
