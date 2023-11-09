'use strict'

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
  }


function getRandomItem(arr) {

  // get random index value
  const randomIndex = Math.floor(Math.random() * arr.length);

  // get random item
  const item = arr[randomIndex];

  return item;
}

function updateTimer() {
	const currentTime = new Date().getTime()
	const elapsedTime = (currentTime - gStartTime) / 1000
	return document.querySelector('.timer').innerText = "Timer: " + elapsedTime.toFixed(3)
}

function startTimer() {
	gStartTime = new Date().getTime()
	gInterval = setInterval(updateTimer, 37)
}

function stopTimer() {
	clearInterval(gInterval)
}