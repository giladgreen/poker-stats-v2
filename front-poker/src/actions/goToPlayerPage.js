async function goToPlayerPage(playerId) {
  const id = `plyr_${playerId}`;
  setTimeout(()=>{
    const item = document.getElementById("uncontrolled-tab-example-tab-players");
    if (item) {
      item.scrollIntoView();
    } else {
      console.log('could not found item by id: uncontrolled-tab-example-tab-players')
    }
  } ,50);
  setTimeout(()=>{
    const item =document.getElementById("uncontrolled-tab-example-tab-players");
    if (item) {
      item.click();
    } else {
      console.log('could not found item by id: uncontrolled-tab-example-tab-players')
    }

  } ,200);
  setTimeout(()=>{
    const item =document.getElementById(id);
    if (item) {
      item.scrollIntoView();
    } else {
      console.log('could not found item by id: '+id)
    }
  } ,450);
  setTimeout(()=>{
    const item = document.getElementById(id);
    if (item) {
      item.click();
    } else {
      console.log('could not found item by id: '+id)
    }
  } ,650);
}

export default goToPlayerPage;
