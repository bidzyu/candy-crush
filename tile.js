import { CANDIES_TYPES, COLUMNS_SIZE, ROWS_SIZE } from './gameConstants.js';

export class Tile {
  constructor(x, y, grid, type = null) {
    this.tileElem = document.createElement('div');
    this.tileElem.classList.add('tile');
    if (!type) {
      this.setRandomCandy();
    } else {
      this.setTypeCandy(type);
    }

    this.setCoords(x, y);

    grid.tilesMap.set(this.tileElem, this);
  }

  setRandomCandy() {
    const index = Math.floor(Math.random() * CANDIES_TYPES.length);
    const candy = CANDIES_TYPES[index];
    const url = './img/' + candy + '.png';

    this.candyType = candy;
    this.candy = new Image();
    this.candy.src = url;

    this.tileElem.append(this.candy);
  }

  setTypeCandy(type) {
    const index = CANDIES_TYPES.indexOf(type);
    const candy = CANDIES_TYPES[index];
    const url = './img/' + candy + '.png';

    this.candyType = candy;
    this.candy = new Image();
    this.candy.src = url;

    this.tileElem.append(this.candy);
  }

  setCoords(x, y) {
    this.x = x;
    this.y = y;
    this.tileElem.style.setProperty('--x', x);
    this.tileElem.style.setProperty('--y', y);
  }
}
