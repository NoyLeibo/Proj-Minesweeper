"use strict"

const EMPTY_CELL = 0
const MINE = "💣"
const neighbor1 = "1"
const neighbor2 = "2"
const neighbor3 = "3"

const gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0
}

const gLevel = { SIZE: 0, MINES: 2 }

var gBoard

function onInit(size) {
  gLevel.SIZE = size
  gGame.isOn = true
  gBoard = buildBoard(gLevel.SIZE)
  renderBoard(gBoard)
  setMinesNegsCount(gBoard)
  // console.table(gBoard[0]) // שורה אפס
  // console.table(gBoard[1]) // שורה ראשונה
  // console.table(gBoard[2]) // שורה שניה
  // console.table(gBoard[3]) // שורה שלישית
}

function buildBoard(Idx) {
  // Building board in my js file
  const board = []

  for (var i = 0; i < Idx; i++) {
    board.push([])
    for (var j = 0; j < Idx; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: true
      }
    }
  }
  const RANDOM_NUM = getRandomInt(0 , gLevel.SIZE * gLevel.SIZE)
  for (var i = 0; i < RANDOM_NUM; i++){
    board[getRandomInt(0, gLevel.SIZE)][getRandomInt(0, gLevel.SIZE)].isMine = true
  }
  return board
}

function renderBoard(board, cell) {
  var strHTML = ""
  console.log(cell)

  for (var i = 0; i < board.length; i++) {
    strHTML += "<tr>\n"
    for (var j = 0; j < board[i].length; j++) {
      var cell = board[i][j]
      if (!cell.isShown) {
        cell = ""
      } else if (cell.isShown) {
        cell = cell.minesAroundCount
      }
      const className = `cell cell-${i}-${j}`
      strHTML += `<td class="${className}" onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu="onCellMarked(this, ${i}, ${j})">${cell}</td> \n`
    }
    strHTML += "</tr>\n"
  }

  const elTable = document.querySelector(".board")
  elTable.innerHTML = strHTML
}

function onCellMarked(event, cell, i, j) {
  // console.log(cell)
}

function onCellClicked(elEvent, a, b) {
  if (gBoard[a][b].isShown) return
  if (gBoard[a][b].isMine) return loseGame

  gBoard[a][b].isShown = true
  renderBoard(gBoard)

  if (gBoard[a][b].minesAroundCount === 0) {
    expandShown(a, b)
  }
}

function loseGame(){
  renderBoard(gBoard, MINE)
}

function expandShown(row, col) {
  for (var i = row - 1; i <= row + 1; i++) {
    for (var j = col - 1; j <= col + 1; j++) {
      if (i < 0 || i >= gBoard.length || j < 0 || j >= gBoard[0].length) continue
      if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
        gBoard[i][j].isShown = true
        renderBoard(gBoard)
        if (gBoard[i][j].minesAroundCount === 0) {
          expandShown(i, j)
        }
      }
    }
  }
}

function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      for (var x = i - 1; x <= i + 1; x++) {
        if (x < 0 || x >= board.length) continue
        for (var y = j - 1; y <= j + 1; y++) {
          // console.log(`i: ${i}, j: ${j}, x: ${x}, y: ${y} board.length: ${board.length}`)
          if (y < 0 || y >= board[x].length) continue
          if (i === x && j === y) continue
          if (board[x][y].isMine) {
            board[i][j].minesAroundCount++
          }
        }
      }
    }
  }
  renderBoard(board)
}
