async function goToPlayerPage(playerId) {

  setTimeout(()=>{
    document.getElementById("uncontrolled-tab-example-tab-players").scrollIntoView();
  } ,50);
  setTimeout(()=>{
    document.getElementById("uncontrolled-tab-example-tab-players").click();
  } ,200);
  setTimeout(()=>{
    document.getElementById(`plyr_${playerId}`).scrollIntoView();
  } ,450);
  setTimeout(()=>{
    document.getElementById(`plyr_${playerId}`).click();
  } ,650);
}

export default goToPlayerPage;
