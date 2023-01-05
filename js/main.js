function freshPage(){
  localStorage.clear()
  sessionStorage.clear()
}

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
        clearHands()
        clearValues()
        prepBotHands()
        prepPlayerHands()
        showBotCards(data.cards)
        showPlayerCards(data.cards)
        showBotValues(data.cards)
        showPlayerValues(data.cards)
        console.log(data.remaining)
        reshuffle(data.remaining)
        instantWinOrLose()
      })
      .catch(err => {
          console.log(`error ${err}`)
      });
}

function clearHands() {
  let hands = document.getElementsByClassName("hands")
  while(hands.length !==0){
    hands[0].remove()
  }
}

function clearValues() {
let val = document.getElementsByClassName("cardValue")
if (val.length == 3){
  return val[2].remove()
}
}

function prepBotHands() {
  let botHandSpace = document.createElement("div")
  botHandSpace.id = "primaryBotHand"
  botHandSpace.className = "hands"
  document.querySelector('#botHand').appendChild(botHandSpace)
}

function prepPlayerHands() {
  let playerHandSpace = document.createElement("div")
  playerHandSpace.id = "primaryPlayerHand"
  playerHandSpace.className = "hands"
  document.querySelector('#playerHand').appendChild(playerHandSpace)
}

function showBotCards(arr) {
  let botCards = arr.filter((elm,idx) => idx % 2 === 0)
  let botImgs = botCards.map((obj,idx) => botCards[idx].image)
  sessionStorage.setItem('bimgs',botImgs)
  botImgs.forEach((elm) => {
    let space = document.createElement("img")
    space.className = "botCards"
    space.src = elm
    document.querySelector('#primaryBotHand').appendChild(space)
  })
}

function showPlayerCards(arr) {
  let playerCards = arr.filter((elm,idx) => idx % 2 === 1)
  let playerImgs = playerCards.map((obj,idx) => playerCards[idx].image)
  sessionStorage.setItem('pimgs',playerImgs)
  playerImgs.forEach((elm) => {
    let space = document.createElement("img")
    space.className = "playCards"
    space.src = elm
    document.querySelector('#primaryPlayerHand').appendChild(space)
  })
}

function showBotValues(arr) {
  let botCards = arr.filter((elm,idx) => idx % 2 === 0)
  let botValues = botCards.map((obj,idx) => botCards[idx].value)
  let botNewValues = botCards.map((obj,idx) => royalCards(botCards[idx].value))
  sessionStorage.setItem('bVals', botValues)
  sessionStorage.setItem('bNums', botNewValues)
  document.querySelector('#botTotalValue').innerText = cardValues(botNewValues).reduce((sum, num) => sum + num,0)
}

function showPlayerValues(arr) {
  let playerCards = arr.filter((elm,idx) => idx % 2 === 1)
  let playerValues = playerCards.map((obj,idx) => playerCards[idx].value)
  let playerNewValues = playerCards.map((obj,idx) => royalCards(playerCards[idx].value))
  sessionStorage.setItem('pVals', playerValues)
  sessionStorage.setItem('pNums', playerNewValues)
  document.querySelector('#playerTotalValue').innerText = cardValues(playerNewValues).reduce((sum, num) => sum + num,0)
}
// Function below breaks if player starts with 2 Aces in hand, will return 22 rather than 12 nor does it round down when needed (look at addPlayerValues for further adjustments)
function cardValues(arr) {
  let goal = 21
  let initialCount = arr.map(elm => royalCards(elm))
  let initialSum = initialCount.reduce((sum, num) => sum + num,0)
  let newCount = initialCount.map(elm => {
    if((elm == 0) && (goal - initialSum >= 11)){
      return 11;
  }
    else if((elm == 0) && (goal - initialSum < 11)){
      return 1;
    }
    else if ((elm == 0) && (initialSum == 0)){
      return 1
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

function reshuffle(val) {
  const deck = localStorage.getItem('deck')
  const shuffle = `https://www.deckofcardsapi.com/api/deck/${deck}/shuffle/`
  if (val == 0) {
    fetch(shuffle)
      .then(res => res.json())
      .then(data => {
        console.log(data.remaining)
      })
      .catch(err => {
          console.log(`error ${err}`)
      });
  }
}

document.querySelector('#drawCards').addEventListener('click', drawCards)
function drawCards(){
  const deck = localStorage.getItem('deck')
  const draw = `https://www.deckofcardsapi.com/api/deck/${deck}/draw/?count=1`

  fetch(draw)
      .then(res => res.json())
      .then(data => {
        addPlayerCards(data.cards)
        addPlayerValues(data.cards)
        console.log(data.remaining)
        instantWinOrLose()
        reshuffle(data.remaining)
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
    document.querySelector('#primaryPlayerHand').appendChild(space)
  })
}

function addPlayerValues(arr) {
  let priorValues = sessionStorage.getItem('pNums').split(',').map(elm => Number(elm))
  let newCardValue = arr.map((obj,idx) => royalCards(arr[idx].value))
  let newTotalValue = cardValues(priorValues.concat(newCardValue))
  sessionStorage.setItem('pNums', newTotalValue)
  document.querySelector('#playerTotalValue').innerText = cardValues(newTotalValue).reduce((sum, num) => sum + num,0)
}

document.querySelector('#splitHands').addEventListener('click', splitHands)
function splitHands(){
  let handBaseVal = sessionStorage.getItem('pVals')
  let handNumVal = sessionStorage.getItem('pNums')
  if ((handNumVal.split(',').length === 2) && (handBaseVal.split(',')[0] === handBaseVal.split(',')[1])) {
     return newHand()
  }
}

function newHand() {
  secondaryHand()
  moveCards()
  adjustValue()
  drawCards()
  splitDraw()
}

function secondaryHand() {
  let additionalHandSpace = document.createElement("div")
  let additionalValueSpace = document.createElement("h4")
  additionalHandSpace.id = "additionalPlayerHand"
  additionalHandSpace.className = "hands"
  additionalValueSpace.id = "additionalPlayerValue"
  additionalValueSpace.className = "cardValue playerHand"
  document.querySelector('#playerHand').appendChild(additionalValueSpace)
  document.querySelector('#playerHand').appendChild(additionalHandSpace)
}

function moveCards() {
  let primeHandImg = document.getElementsByClassName('playCards')
  let primeHandSrc = sessionStorage.getItem('pimgs').split(',')
  let secondHandSrc = []
  secondHandSrc.push(primeHandSrc.pop())
  sessionStorage.setItem('pimgs',primeHandSrc)
  sessionStorage.setItem('pimgs2',secondHandSrc)
  primeHandImg[1].remove()
  secondHandSrc.forEach((elm) => {
    let space = document.createElement("img")
    space.className = "playCards"
    space.src = elm
    document.querySelector('#additionalPlayerHand').appendChild(space)
  })
}

function adjustValue() {
  let primeValues = sessionStorage.getItem('pNums').split(',').map(elm => Number(elm))
  let secondValues = []
  secondValues.push(primeValues.pop())
  sessionStorage.setItem('pNums', primeValues)
  sessionStorage.setItem('pNums2', secondValues)
  document.querySelector('#playerTotalValue').innerText = primeValues.reduce((sum, num) => sum + num,0) 
  document.querySelector('#additionalPlayerValue').innerText = secondValues.reduce((sum, num) => sum + num,0)
}

document.querySelector('#splitDraw').addEventListener('click', splitDraw)
function splitDraw(){
  const deck = localStorage.getItem('deck')
  const draw = `https://www.deckofcardsapi.com/api/deck/${deck}/draw/?count=1`

  fetch(draw)
      .then(res => res.json())
      .then(data => {
        addAdditionalCards(data.cards)
        addAdditionalValues(data.cards)
        console.log(data.remaining)
        instantSplitWinOrLose()
        reshuffle(data.remaining)
      })
      .catch(err => {
          console.log(`error ${err}`)
      });
}

function addAdditionalCards(arr) {
  let newCard = arr.map((obj,idx) => arr[idx].image)
  newCard.forEach((elm) => {
    let space = document.createElement("img")
    space.className = "playCards"
    space.src = elm
    document.querySelector('#additionalPlayerHand').appendChild(space)
  })
}

function addAdditionalValues(arr) {
  let priorValues = sessionStorage.getItem('pNums2').split(',').map(elm => Number(elm))
  let newCardValue = arr.map((obj,idx) => royalCards(arr[idx].value))
  let newTotalValue = cardValues(priorValues.concat(newCardValue))
  sessionStorage.setItem('pNums2', newTotalValue)
  document.querySelector('#additionalPlayerValue').innerText = cardValues(newTotalValue).reduce((sum, num) => sum + num,0)
}

document.querySelector('#checkHands').addEventListener('click', winCondition)
function winCondition(){
//  looking into async await to control the timing of the functions 
  botDraw()
  basicWin()
}

function botDraw() {
  const deck = localStorage.getItem('deck')
  const draw = `https://www.deckofcardsapi.com/api/deck/${deck}/draw/?count=1`
  let botValue = sessionStorage.getItem('bNums').split(',').map(elm => Number(elm))
  let botValueSum = cardValues(botValue).reduce((sum, num) => sum + num,0)
  if (botValueSum === 21) {

  }
  else if ((21-botValueSum)>5){
fetch(draw)
      .then(res => res.json())
      .then(data => {
        newBotCard(data.cards)
        newBotValues(data.cards)
        console.log(data.remaining)
        reshuffle(data.remaining)
        instantWinOrLose()
        botDraw()
      })
      .catch(err => {
          console.log(`error ${err}`)
      });
  }
}

function newBotCard(arr) {
  let newCard = arr.map((obj,idx) => arr[idx].image)
  newCard.forEach((elm) => {
    let space = document.createElement("img")
    space.className = "playCards"
    space.src = elm
    document.querySelector('#primaryBotHand').appendChild(space)
  })
}

function newBotValues(arr) {
  let priorValues = sessionStorage.getItem('bNums').split(',').map(elm => Number(elm))
  let newCardValue = arr.map((obj,idx) => royalCards(arr[idx].value))
  let newTotalValue = cardValues(priorValues.concat(newCardValue))
  sessionStorage.setItem('bNums', newTotalValue)
  document.querySelector('#botTotalValue').innerText = cardValues(newTotalValue).reduce((sum, num) => sum + num,0)
}

function instantWinOrLose(){
  let botValue = sessionStorage.getItem('bNums').split(',').map(elm => Number(elm))
  let botFinalValue = cardValues(botValue).reduce((sum, num) => sum + num,0)
  let playerValue = sessionStorage.getItem('pNums').split(',').map(elm => Number(elm))
  let playerFinalValue = cardValues(playerValue).reduce((sum, num) => sum + num,0)
// Change the wins results from logs to html elements
  if ((botValue.length === 2 && botFinalValue == 21) && (playerValue.length === 2 && playerFinalValue == 21)) {
    return console.log('Draw')
  }
  else if (botValue.length === 2 && botFinalValue == 21) {
    return console.log('Bot Wins')
  }
  else if (playerValue.length === 2 && playerFinalValue == 21) {
    return console.log('Player Wins')
  }
  else if (botFinalValue > 21){
    return console.log('Player Wins')
  }
  else if (playerFinalValue > 21){
    return console.log('Bot Wins')
  }
}

function basicWin() {
  let botValue = sessionStorage.getItem('bNums').split(',').map(elm => Number(elm))
  let botFinalValue = cardValues(botValue).reduce((sum, num) => sum + num,0)
  let playerValue = sessionStorage.getItem('pNums').split(',').map(elm => Number(elm))
  let playerFinalValue = cardValues(playerValue).reduce((sum, num) => sum + num,0)
// Change the wins results from logs to html elements
  if (botFinalValue == playerFinalValue) {
    return console.log('Draw')
  }
  else if ((21-playerFinalValue)<(21-botFinalValue)) {
    return console.log('Player Wins')
  }
  else if ((21-botFinalValue)<(21-playerFinalValue)) {
    return console.log('Bot Wins')  
  }
}

function instantSplitWinOrLose(){
// This function needs to check all hands for instant wins 
let botValue = sessionStorage.getItem('bNums').split(',').map(elm => Number(elm))
let botFinalValue = cardValues(botValue).reduce((sum, num) => sum + num,0)
let playerHand1Value = sessionStorage.getItem('pNums').split(',').map(elm => Number(elm))
let playerHand1FV = cardValues(playerHand1Value).reduce((sum, num) => sum + num,0)
let playerHand2Value = sessionStorage.getItem('pNums2').split(',').map(elm => Number(elm))
let playerHand2FV = cardValues(playerHand2Value).reduce((sum, num) => sum + num,0)
// Change the wins results from logs to html elements
  if ((botValue.length === 2 && botFinalValue == 21) && (playerHand1Value.length === 2 && playerHand1FV == 21) && (playerHand2Value.length === 2 && playerHand2FV == 21)) {
    return console.log('Draw')
  }
  else if (botValue.length === 2 && botFinalValue == 21) {
    return console.log('Bot Wins')
  }
  else if (playerHand1Value.length === 2 && playerHand1FV == 21) {
    return console.log('Player Hand 1 Wins')
  }
  else if (playerHand2Value.length === 2 && playerHand2FV == 21) {
    return console.log('Player Hand 2 Wins')
  }
  else if (botFinalValue > 21){
    return console.log('Player Wins')
  }
  else if (playerHand1FV > 21){
    return console.log('Player Hand 1 Lose')
  }
  else if (playerHand2FV > 21){
    return console.log('Player Hand 2 Lose')
  }
}

function splitWin() {
  let botValue = sessionStorage.getItem('bNums').split(',').map(elm => Number(elm))
  let botFinalValue = cardValues(botValue).reduce((sum, num) => sum + num,0)
  let playerHand1Value = sessionStorage.getItem('pNums').split(',').map(elm => Number(elm))
  let playerHand1FV = cardValues(playerHand1Value).reduce((sum, num) => sum + num,0)
  let playerHand2Value = sessionStorage.getItem('pNums2').split(',').map(elm => Number(elm))
  let playerHand2FV = cardValues(playerHand2Value).reduce((sum, num) => sum + num,0)
  if (botFinalValue == playerHand1FV == playerHand2FV) {
    return console.log('Draw')
  }
  else if (((21-playerHand1FV)<(21-botFinalValue)) && ((21-playerHand2FV)<(21-botFinalValue))) {
    return console.log('Player Wins')
  }
  else if (((21-botFinalValue)<(21-playerHand1FV)) &&((21-botFinalValue)<(21-playerHand2FV))) {
    return console.log('Bot Wins')  
  }
  else if (((21-playerHand1FV)<(21-botFinalValue)) && ((21-botFinalValue)<=(21-playerHand2FV))) {
    return console.log('Player Hand 1 Wins')
  }
  else if (((21-botFinalValue)<=(21-playerHand1FV)) && ((21-playerHand2FV)<(21-botFinalValue))) {
    return console.log('Player Hand 2 Wins')
  }
}
