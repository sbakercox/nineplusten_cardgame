//Start game session - Will get a new deck if ID isn't present and deal out the cards or it will reshuffle the deck (deck_ID) in play and deal out cards.
document.querySelector('#gameStart').addEventListener('click', getDeck)

function getDeck(){
  const newGame = `https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1`
  const deck = localStorage.getItem('deck')

  if (!deck) {
    fetch(newGame)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
        console.log(data)
        localStorage.setItem('deck', data.deck_id)
        getCards()
      })
      .catch(err => {
          console.log(`error ${err}`)
      });
  }
  else{
    fetch(`https://www.deckofcardsapi.com/api/deck/${deck}/shuffle/`)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
        console.log(data)
        getCards()
      })
      .catch(err => {
          console.log(`error ${err}`)
      });
  }
}

//Deal cards (botHandDeal) - creates an array to hold CPU player's cards when cards are dealt
function botHandDeal(arr){
  let a = arr.map((num, ind) => {
  if (ind % 2 == 0) {
    return num;
  }
});
     for( let i = 0; i < arr.length; i++){ 
          if ( a[i] === undefined) { 
              a.splice(i, 1); 
          }  
      }
  return a
}

//Deal cards (playerHandDeal) - creates an array to hold player's cards when cards are dealt
function playerHandDeal(arr){
  let b = arr.map((num, ind) => {
  if (ind % 2 == 1) {
    return num;
  }
});
     for( let i = 0; i < arr.length; i++){ 
          if ( b[i] === undefined) { 
              b.splice(i, 1); 
          }  
      }
  return b
}

//Deal cards - Should deal out a new hand to both players showing the card images,
document.querySelector('#dealCards').addEventListener('click', getCards)

function getCards(){
  const deck = localStorage.getItem('deck')
  const url = `https://www.deckofcardsapi.com/api/deck/${deck}/draw/?count=4`

  fetch(url)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
        console.log(data)
        _playerHand = playerHandDeal(data.cards)
        _botHand = botHandDeal(data.cards)
// Need to rework these variables so they apply via function external of the fetch function.
        const pHand = document.getElementById("playerHand")
        const bHand = document.getElementById("botHand")
        let pCards = pHand.getElementsByClassName("playCards")
        let bCards = bHand.getElementsByClassName("playCards")
        if((pCards.length !== 0) && (bCards.length !== 0)){
          while((pCards.length > 0) && (bCards.length > 0)) {
            pCards[0].remove();
            bCards[0].remove();
           }         
        }
        
        showPlayerCards(_playerHand)
        showBotCards(_botHand)
        let playerVal = aceVal(_playerHand)
        let botVal = aceVal(_botHand)
        showPlayerValue(playerVal)
        showBotValue(botVal)
      })
      .catch(err => {
          console.log(`error ${err}`)
      });
}

//Show cards (showBotCards)- Iterate through the CPU player's hand and create elements for their cards to showcase them in the dom
function showBotCards(arr) {
  arr.forEach((obj, ind) => {
    let img = arr[ind].image;
    let value = arr[ind].value;
    let space = document.createElement("img")
    space.className = "playCards"
    space.src = img
    document.querySelector('#botHand').appendChild(space)
  })
}

//Show cards (showPlayerCards)- Iterate through the player's hand and create elements for their cards to showcase them in the dom
function showPlayerCards(arr) {
  arr.forEach((obj, ind) => {
    let img = arr[ind].image;
    let value = arr[ind].value;
    let space = document.createElement("img")
    space.className = "playCards"
    space.src = img
    document.querySelector('#playerHand').appendChild(space)
  })
}

//Get card values for non-ACE cards and prep logic for getting the Ace Value 
function cardVal(val){
  let cardNumber;
  let aceVal = 0;
  switch (val) {
    case "KING":
    case "QUEEN":  
    case "JACK":
      cardNumber = 10  
      break;
      case "ACE":
        cardNumber = aceVal  
        break;
    default:
      cardNumber = Number(val)
      break;
  }
  return cardNumber
}

//Get Ace card values 
function aceVal(arr) {
  let goal = 21
  let intCount = arr.map(ele => cardVal(ele.value))
  let intHand = intCount.reduce((sum, num) => sum + num,0);
  let newCount = intCount.map(ele => {
    if((ele == 0) && (goal - intHand >= 11)){
      return 11;
  }
    else if((ele == 0) && (goal - intHand < 11)){
      return 1;
    }
    return ele;
  })
  let newHand = newCount.reduce((sum, num) => sum + num,0);
return newCount
}

// Show the values of the player's hand in the dom
function showPlayerValue(arr){
  let handVal = arr.reduce((sum, num) => sum + num,0);
  document.querySelector('#p_value').innerText = handVal
}

//Shows Bot hand Value, but work on hiding value until win condition
function showBotValue(arr){
  let handVal = arr.reduce((sum, num) => sum + num,0);
  document.querySelector('#b_value').innerText = handVal
}

//Add card - Should draw a card for player/bot and add it to their hand
document.querySelector('#drawCards').addEventListener('click', drawCard)

function drawCard(){
  const deck = localStorage.getItem('deck')
  const url = `https://www.deckofcardsapi.com/api/deck/${deck}/draw/?count=1`

  fetch(url)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
        console.log(data.cards)
      })
      .catch(err => {
          console.log(`error ${err}`)
      });
}

