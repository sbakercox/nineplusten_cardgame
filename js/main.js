document.querySelector('#gameStart').addEventListener('click', getDeck)
function getDeck(){
  const newGame = `https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1`
  const deck = localStorage.getItem('deck')

  if (!deck) {
    fetch(newGame)
      .then(res => res.json())
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
      .then(res => res.json())
      .then(data => {
        console.log(data)
      getCards()
      })
      .catch(err => {
          console.log(`error ${err}`)
      });
  }
}

document.querySelector('#dealCards').addEventListener('click', getCards)
function getCards(){
  const deck = localStorage.getItem('deck')
  const deal = `https://www.deckofcardsapi.com/api/deck/${deck}/draw/?count=4`

  fetch(deal)
      .then(res => res.json())
      .then(data => {
        clearCards()
        showCards(data.cards)
        showValues(data.cards)
        console.log(data.remaining)
      })
      .catch(err => {
          console.log(`error ${err}`)
      });
}

function clearCards() {
  let activeBotCards = document.getElementsByClassName("botCards")
  let activePlayerCards = document.getElementsByClassName("playCards")
  while(activeBotCards.length !==0){
    activeBotCards[0].remove()
  }
  while((activePlayerCards.length !==0)){
    activePlayerCards[0].remove()
  }
}

function showCards(arr) {
  let botCards = arr.filter((elm,idx) => idx % 2 === 0)
  let playerCards = arr.filter((elm,idx) => idx % 2 === 1)
  let botImgs = botCards.map((obj,idx) => botCards[idx].image)
  let playerImgs = playerCards.map((obj,idx) => playerCards[idx].image)
  botImgs.forEach((elm) => {
    let space = document.createElement("img")
    space.className = "botCards"
    space.src = elm
    document.querySelector('#botHand').appendChild(space)
  })
  playerImgs.forEach((elm) => {
    let space = document.createElement("img")
    space.className = "playCards"
    space.src = elm
    document.querySelector('#playerHand').appendChild(space)
  })
}

function showValues(arr) {
  let botCards = arr.filter((elm,idx) => idx % 2 === 0)
  let playerCards = arr.filter((elm,idx) => idx % 2 === 1)
  let botValues = botCards.map((obj,idx) => royalCards(botCards[idx].value))
  localStorage.setItem('barr', botValues)
  let playerValues = playerCards.map((obj,idx) => royalCards(playerCards[idx].value))
  localStorage.setItem('parr', playerValues)
  document.querySelector('#botTotalValue').innerText = cardValues(botValues).reduce((sum, num) => sum + num,0)
  document.querySelector('#playerTotalValue').innerText = cardValues(playerValues).reduce((sum, num) => sum + num,0)
}
// Function issue- if player starts with 2 Aces in hand, will return 22 rather than 12
function cardValues(arr) {
  let goal = 21
  let intCount = arr.map(elm => royalCards(elm))
  let intSum = intCount.reduce((sum, num) => sum + num,0)
  let newCount = intCount.map(elm => {
    if((elm == 0) && (goal - intSum >= 11)){
      return 11;
  }
    else if((elm == 0) && (goal - intSum < 11)){
      return 1;
    }
    return elm;
  })
  return newCount
}

function royalCards(val) {
  let cardNumber;
  switch (val) {
    case "KING":
    case "QUEEN":  
    case "JACK":
      cardNumber = 10  
      break;
      case "ACE":
        cardNumber = 0  
        break;
    default:
      cardNumber = Number(val)
      break;
  }
  return cardNumber
}

document.querySelector('#drawCards').addEventListener('click', drawCards)
function drawCards(){
  const deck = localStorage.getItem('deck')
  const draw = `https://www.deckofcardsapi.com/api/deck/${deck}/draw/?count=1`

  fetch(draw)
      .then(res => res.json())
      .then(data => {
        console.log(data.cards)
        addPlayerCards(data.cards)
        addPlayerValues(data.cards)
      })
      .catch(err => {
          console.log(`error ${err}`)
      });
}

function addPlayerCards(arr) {
  let newCard = arr.map((obj,idx) => arr[idx].image)
  newCard.forEach((elm) => {
    let space = document.createElement("img")
    space.className = "playCards"
    space.src = elm
    document.querySelector('#playerHand').appendChild(space)
  })
}

function addPlayerValues(arr) {
  let priorValues = localStorage.getItem('parr').split(',').map(elm => Number(elm))
  let newCardValue = arr.map((obj,idx) => royalCards(arr[idx].value))
  let newTotalValue = cardValues(priorValues.concat(newCardValue))
  localStorage.setItem('parr', newTotalValue)
  document.querySelector('#playerTotalValue').innerText = newTotalValue.reduce((sum, num) => sum + num,0)
}

document.querySelector('#splitCards').addEventListener('click', splitCards)
function splitCards(){
  
}


document.querySelector('#checkCards').addEventListener('click', winCondition)
function winCondition(){
  
}