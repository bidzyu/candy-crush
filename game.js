import { Grid } from './grid.js';
import { Score } from './score.js';

export class Game {
  constructor() {
    const gridWrapperElem = document.getElementById('grid-wrapper');
    this.gridWrapperElem = gridWrapperElem;

    this.startGame = this.startGame.bind(this);
    this.init = this.init.bind(this);
    this.stopGame = this.stopGame.bind(this);
    this.clearInit = this.clearInit.bind(this);
  }

  startGame() {
    this.init();
  }

  async stopGame() {
    await this.clearInit();
  }

  init() {
    this.score = new Score(this.gridWrapperElem);
    this.grid = new Grid(this.gridWrapperElem, this.score);
  }

  async clearInit() {
    this.score.remove();
    await this.grid.remove();
    this.score = null;
    this.grid = null;
  }
}
