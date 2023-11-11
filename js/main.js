"use strict";

const EMPTY_CELL = 0;
const MINE = "💣";
const neighbor1 = "1";
const neighbor2 = "2";
const neighbor3 = "3";
const MARK = "🚩";
const HINT = '💡'

const gLevel = { SIZE: 0, MINES: 2 };
const gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
  lives: 0,
  hints: 0
};

var gInterval
var gBoard
var gStartTime

function onInit(size) {
  gGame.hints = 3
  document.querySelector('.hint').innerHTML = `<span class="hint"><button onclick="getHint()">Get one hint ${HINT.repeat(gGame.hints)}</button></span>`
  stopTimer()
  gGame.markedCount = 0
  gGame.secsPassed = updateTimer()
  gStartTime = undefined
  document.querySelector('.timer').innerText = 'Timer off, start for start 😊'
  gGame.lives = 3
  if (size === 4) gGame.lives = 2
  gLevel.SIZE = size;
  gGame.isOn = true;
  gBoard = buildBoard(gLevel.SIZE);
  renderBoard(gBoard);
  setMinesNegsCount(gBoard);
  
  // console.table(gBoard[0]) // שורה אפס
  // console.table(gBoard[1]) // שורה ראשונה
  // console.table(gBoard[2]) // שורה שניה
  // console.table(gBoard[3]) // שורה שלישית
}

function buildBoard(Idx) {
  // Building board in my js file
  const board = [];

  for (var i = 0; i < Idx; i++) {
    board.push([]);
    for (var j = 0; j < Idx; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      };
    }
  }
  switch(gLevel.SIZE) {
    case 4:
      gLevel.MINES = 2
      break
    case 8:
      gLevel.MINES = 14
      break
    case 12:
      gLevel.MINES = 32
      break
  }

  gGame.shownCount = gLevel.SIZE * gLevel.SIZE - gLevel.MINES 

  // push mines to the board
  const sizeLength = []
  for (var x = 0; x < gLevel.SIZE; x++) sizeLength.push(x)
  for (var i = 0; i < gLevel.MINES; i++) board[getRandomItem(sizeLength)][getRandomItem(sizeLength)].isMine = true
  return board
}

function getHint(){
  if (gGame.hints === 0 || !gGame.isOn) return
  const sizeLength = []
  for (var x = 0; x < gLevel.SIZE; x++) sizeLength.push(x)
  var randomHint = gBoard[getRandomItem(sizeLength)][getRandomItem(sizeLength)]
  while(randomHint.isShown) randomHint = gBoard[getRandomItem(sizeLength)][getRandomItem(sizeLength)]
  randomHint.isShown = true
  renderBoard(gBoard)
  setTimeout(() => {
    randomHint.isShown = false;
    renderBoard(gBoard);
  }, 3000);
  gGame.hints--
  document.querySelector('.hint').innerHTML = `<span class="hint"><button onclick="getHint()">Get one hint ${HINT.repeat(gGame.hints)}</button></span>`
  if (gGame.hints === 0){
    document.querySelector('.hint').innerHTML = `<span class="hint"><button onclick="getHint()">No more hints</button></span>`
  }
}

function renderBoard(board) {
  if (!gGame.isOn) return
  var strHTML = `Lives: ${gGame.lives}`
  for (var i = 0; i < board.length; i++) {
    strHTML += "\n<tr>\n";
    for (var j = 0; j < board[i].length; j++) {
      var cell = board[i][j];
      if (!cell.isShown) {
        cell = ""
      }
      if (cell.isShown) {

        if (cell.isMarked) cell = MARK;
        else if (!cell.isMine) cell = cell.minesAroundCount;
        else if (cell.isMine) cell = MINE;
      }
      const className = `cell cell-${i}-${j}`;
      strHTML += `<td class="${className}" onclick="onCellClicked(event, ${i}, ${j})" oncontextmenu="onCellMarked(event, ${i}, ${j})">${cell}</td> \n`;
    }
    strHTML += "</tr>\n";
  }
  const elTable = document.querySelector(".board");
  elTable.innerHTML = strHTML;
}

function onCellMarked(cell, i, j) { // Right click - turns flag
  if (gStartTime === undefined) startTimer()
  if (gBoard[i][j].isMarked == true || 
    (gBoard[i][j].isMarked == false && gBoard[i][j].isShown == false)){
      gBoard[i][j].isShown = !gBoard[i][j].isMarked
      gBoard[i][j].isMarked = !gBoard[i][j].isMarked
      renderBoard(gBoard)
  }
  if (gBoard[i][j].isMine && gBoard[i][j].isMarked) {
      gGame.markedCount ++
      checkVictory()
      console.log(MINE) // need to continue from here
  }
  cell.preventDefault() // Cancel the other place mark
  return
}

function checkVictory(){
  if (gGame.markedCount === gLevel.MINES || gGame.shownCount === 0){
    gGame.isOn = false
    stopTimer()
    document.querySelector('.timer').innerText = 'WINNER! 🤩 ' + updateTimer()
    for (var i = 0; i < gBoard.length; i++) {
      for (var j = 0; j < gBoard[i].length; j++) {
        gBoard[i][j].isShown = true
      }
    }
  }
  renderBoard(gBoard)
  return
}

function onCellClicked(elEvent, a, b) { // Left click
  if (gStartTime === undefined && gGame.lives === 3 | 2) startTimer()
  if (gBoard[a][b].isMarked) return
  if (gBoard[a][b].isMine && !gBoard[a][b].isShown){ // got bombed
    gGame.lives--
    renderBoard(gBoard)
    if (gGame.lives <= 0) return minesIsShown(); // bombed with no lives)
    }
  if (gBoard[a][b].isShown) return;
  if (!gBoard[a][b].isMine) gGame.shownCount--
  gBoard[a][b].isShown = true;
  if (gBoard[a][b].minesAroundCount === 0) {
    expandShown(a, b)
  }
  renderBoard(gBoard)
  checkVictory()
}

function expandShown(row, col) {
  for (var i = row - 1; i <= row + 1; i++) {
    for (var j = col - 1; j <= col + 1; j++) {
      if (i < 0 || i >= gBoard.length || j < 0 || j >= gBoard[0].length){
        continue;
      }
      if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
        gBoard[i][j].isShown = true
        gGame.shownCount--
        renderBoard(gBoard);
        if (gBoard[i][j].minesAroundCount === 0) {
          expandShown(i, j);
        }
      }
    }
  }
}

function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      for (var x = i - 1; x <= i + 1; x++) {
        if (x < 0 || x >= board.length) continue;
        for (var y = j - 1; y <= j + 1; y++) {
          // console.log(`i: ${i}, j: ${j}, x: ${x}, y: ${y} board.length: ${board.length}`)
          if (y < 0 || y >= board[x].length) continue;
          if (i === x && j === y) continue;
          if (board[x][y].isMine) {
            board[i][j].minesAroundCount++;
          }
        }
      }
    }
  }
  renderBoard(board);
}

function minesIsShown() { // happen when lives is 0 finish the game.
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      if (gBoard[i][j].isMine) {
        gBoard[i][j].isShown = true;
      }
    }
  }
  if (gGame.isOn){
    stopTimer()
    document.querySelector('.timer').innerText = 'You lose 😥. ' + updateTimer()
  }
  renderBoard(gBoard)
  gGame.isOn = false
  return;
}

function changingTheme(themeMode){
  if (themeMode === 'Dark'){
    document.body.style.backgroundColor = 'darkslategray'
    document.body.style.color = 'rgb(0, 0, 0)'
  }
  else if (themeMode === 'Bright'){
    document.body.style.backgroundColor = 'rgb(172, 237, 237)'
    document.body.style.color = 'rgb(235, 101, 101)'
  }
}