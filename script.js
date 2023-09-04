import { Game } from './game.js';
import { setCellSize, ROWS_SIZE, COLUMNS_SIZE } from './gameConstants.js';

const gameMenuWrapperElem = document.getElementById('game-menu-wrapper');
const gameMenuElem = document.getElementById('game-menu');
const startGameBtn = document.getElementById('start-game-btn');
const gameSizeForm = document.getElementById('game-size');
const showMenuBtn = document.getElementById('show-menu-btn');

let baseRadioElem = document.querySelector('.game-size-radio:checked');
let selectedSizeElem = document.querySelector(
  "label[for='" + baseRadioElem.id + "']"
);
selectedSizeElem.classList.add('selected-game-size');
let cellSize = +baseRadioElem.value;

gameSizeForm.addEventListener('pointerdown', selectGameSize);

const game = new Game();

addStartGameHandler();

async function startGame() {
  new Promise((res) => {
    gameMenuElem.classList.add('remove');

    gameMenuElem.onanimationend = () => res();
  }).then(() => {
    gameMenuElem.classList.remove('remove');
    hideMenu();
    setCellSize(cellSize);
    game.startGame();
    setTimeout(() => {
      showMenuBtn.style.display = 'block';
      addShowMenuHandler();
    }, 1500);
  });
}

async function stopGame() {
  await game.stopGame();

  gameMenuElem.classList.add('show');
  gameMenuElem.onanimationend = () => gameMenuElem.classList.remove('show');
  showMenu();
  addStartGameHandler();
  showMenuBtn.style.display = '';
}

function addStartGameHandler() {
  startGameBtn.addEventListener('pointerdown', startGame, { once: true });
}

function addShowMenuHandler() {
  showMenuBtn.addEventListener('pointerdown', stopGame, { once: true });
}

function hideMenu() {
  gameMenuWrapperElem.style.display = 'none';
}

function showMenu() {
  gameMenuWrapperElem.style.display = '';
}

function selectGameSize(event) {
  const label = event.target.closest('label');
  if (!label) {
    return;
  }

  selectedSizeElem.classList.remove('selected-game-size');
  selectedSizeElem = label;
  selectedSizeElem.classList.add('selected-game-size');

  const input = document.getElementById(label.getAttribute('for'));
  const value = +input.value;
  cellSize = value;
}
