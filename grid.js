import { Cell } from './cell.js';
import { CANDIES_TYPES, COLUMNS_SIZE, ROWS_SIZE } from './gameConstants.js';
import { Tile } from './tile.js';

export class Grid {
  constructor(parentElem, scoreController) {
    this.parentElem = parentElem;
    this.scoreController = scoreController;

    this.grid = [];
    this.tilesMap = new Map();

    this.gridElem = document.createElement('div');
    this.gridElem.id = 'grid';
    this.gridElem.classList.add('show');
    this.fillGrid();
    this.parentElem.append(this.gridElem);

    this.moveTileHandler = this.moveTileHandler.bind(this);
    this.addMoveTileHandler = this.addMoveTileHandler.bind(this);

    (async () => {
      await this.showGrid();
      await this.fillCells();

      this.selectedCell = null;
      this.selectedNeighbors = [];

      this.addMoveTileHandler();
    })();

    // this.cellsSortedByReverseColumn = this.cellsSortByReverseColumn();
  }

  async showGrid() {
    return new Promise((res) => {
      this.gridElem.onanimationend = () => {
        this.gridElem.classList.remove('show');
        res();
      };
    });
  }

  async remove() {
    this.removeMoveTileHandler();
    this.gridElem.classList.add('remove');
    await new Promise((res) => (this.gridElem.onanimationend = () => res()));
    this.gridElem.remove();
  }

  fillGrid() {
    for (let row = 0; row < ROWS_SIZE; row++) {
      const newRow = [];

      for (let col = 0; col < COLUMNS_SIZE; col++) {
        const cell = new Cell(this, col, row);

        this.gridElem.append(cell.cellElem);

        newRow.push(cell);
      }

      this.grid.push(newRow);
    }
  }

  async fillCells() {
    let tilesGrid = this.getTilesGrid();
    while (this.hasCandysCollapses(tilesGrid)) {
      tilesGrid = this.getTilesGrid();
    }

    const promises = [];

    for (let row = 0; row < ROWS_SIZE; row++) {
      for (let col = 0; col < COLUMNS_SIZE; col++) {
        const type = tilesGrid[row][col];
        const tile = this.createShadowTile(col, -1, type);

        const cell = this.getCellByIndex(col, row);
        cell.setTiteWithType(tile);

        promises.push(
          new Promise((res) => {
            setTimeout(() => tile.setCoords(cell.x, cell.y));
            tile.tileElem.ontransitionend = () => res();
          })
        );
      }
    }

    await Promise.all(promises);
  }

  getTilesGrid() {
    const tilesGrid = [];

    for (let y = 0; y < ROWS_SIZE; y++) {
      const row = [];

      for (let x = 0; x < COLUMNS_SIZE; x++) {
        row.push(this.getRandomCandyType());
      }

      tilesGrid.push(row);
    }

    for (let y = 0; y < ROWS_SIZE; y++) {
      for (let x = 2; x < COLUMNS_SIZE; x++) {
        let candy1 = tilesGrid[y][x - 2];
        let candy2 = tilesGrid[y][x - 1];
        let candy3 = tilesGrid[y][x];

        while (this.isEqualCandys(candy1, candy2, candy3)) {
          candy3 = tilesGrid[y][x] = this.getRandomCandyType();
        }
      }
    }

    for (let y = 2; y < ROWS_SIZE; y++) {
      for (let x = 0; x < COLUMNS_SIZE; x++) {
        let candy1 = tilesGrid[y - 2][x];
        let candy2 = tilesGrid[y - 1][x];
        let candy3 = tilesGrid[y][x];

        while (this.isEqualCandys(candy1, candy2, candy3)) {
          candy3 = tilesGrid[y][x] = this.getRandomCandyType();
        }
      }
    }

    return tilesGrid;
  }

  hasCandysCollapses(candysGrid) {
    const virtualGrid = candysGrid;

    // find horizontal
    for (let row = 0; row < ROWS_SIZE; row++) {
      for (let col = 0; col < COLUMNS_SIZE - 2; col++) {
        const candy1 = virtualGrid[row][col];
        const candy2 = virtualGrid[row][col + 1];
        const candy3 = virtualGrid[row][col + 2];

        if (candy1 === candy2 && candy2 === candy3) {
          return true;
        }
      }
    }

    //find vertical
    for (let row = 0; row < ROWS_SIZE - 2; row++) {
      for (let col = 0; col < COLUMNS_SIZE; col++) {
        const candy1 = virtualGrid[row][col];
        const candy2 = virtualGrid[row + 1][col];
        const candy3 = virtualGrid[row + 2][col];

        if (candy1 === candy2 && candy2 === candy3) {
          return true;
        }
      }
    }

    return false;
  }

  isValidIndex(x, y) {
    return x >= 0 && y >= 0 && x < COLUMNS_SIZE && y < ROWS_SIZE;
  }

  isEqualCandys(...args) {
    for (let i = 1; i < args.length; i++) {
      const v1 = args[i - 1];
      const v2 = args[i];

      if (v1 !== v2) {
        return false;
      }
    }

    return true;
  }

  getRandomCandyType() {
    return CANDIES_TYPES[Math.floor(Math.random() * CANDIES_TYPES.length)];
  }

  getCellByIndex(x, y, arr) {
    if (arr) {
      return arr[y][x];
    } else {
      return this.grid[y][x];
    }
  }

  async reverseTiles() {
    const cell1 = this.selectedCell;
    const cell1Tile = cell1.tile;

    const cell2 = this.otherCell;
    const cell2Tile = cell2.tile;

    await this.updTiles(cell1, cell2, cell1Tile, cell2Tile);
  }

  async updTiles(cell1, cell2, tile1, tile2) {
    cell1.tile = tile2;
    cell2.tile = tile1;

    tile1.setCoords(cell2.x, cell2.y);
    tile2.setCoords(cell1.x, cell1.y);

    const promises = [];

    const tile1Promise = new Promise(
      (res) => (tile1.tileElem.ontransitionend = () => res())
    );
    const tile2Promise = new Promise(
      (res) => (tile2.tileElem.ontransitionend = () => res())
    );

    promises.push(tile1Promise, tile2Promise);

    await Promise.all(promises);
  }

  currTilesIsCollapse() {
    const st = this.selectedCell.tile;
    const ot = this.otherCell.tile;

    let res;
    if (this.collapsesGrid) {
      res = Boolean(
        this.collapsesGrid[st.y][st.x] || this.collapsesGrid[ot.y][ot.x]
      );
    } else {
      res = false;
    }
    return res;
  }

  // cellsSortByReverseColumn() {
  //   const arr = [];

  //   for (let x = 0; x < COLUMNS_SIZE; x++) {
  //     const newCol = [];

  //     for (let y = ROWS_SIZE - 1; y >= 0; y--) {
  //       const cell = this.grid[y][x];

  //       newCol.push(cell);
  //     }

  //     arr.push(newCol);
  //   }

  //   return arr;
  // }

  updTilesOnGrid() {
    const tilesList = Array.from(this.tilesMap.values());
    // console.log(tilesList.length);

    tilesList.forEach((tile) => {
      const cell = this.getCellByIndex(tile.x, tile.y);

      cell.tile = tile;
      cell.isEmpty = false;
    });
  }

  async createNewTilesAndDropDown() {
    await this.dropDown();
  }

  async dropDown() {
    const promises = [];

    for (let col = 0; col < COLUMNS_SIZE; col++) {
      let index = ROWS_SIZE - 1;

      for (let row = ROWS_SIZE - 1; row >= 0; row--) {
        const cellWithTile = this.getCellByIndex(col, row);

        if (cellWithTile.isEmpty) continue;

        const tile = cellWithTile.tile;
        const cellWOTile = this.getCellByIndex(col, index);

        let addAnim = true;

        if (cellWithTile === cellWOTile) {
          addAnim = false;
        }

        cellWithTile.isEmpty = true;
        tile.setCoords(cellWOTile.x, cellWOTile.y);
        cellWOTile.tile = tile;
        cellWithTile.tile = null;
        index -= 1;

        if (addAnim) {
          promises.push(
            new Promise((res) => {
              tile.tileElem.ontransitionend = () => res();
            })
          );
        }
      }

      for (let row = index; row >= 0; row--) {
        const cellWOTile = this.getCellByIndex(col, row);

        const tile = this.createShadowTile(col, -1);
        const tileElem = tile.tileElem;

        this.gridElem.append(tileElem);

        cellWOTile.tile = tile;
        cellWOTile.isEmpty = false;

        promises.push(
          new Promise((res) => {
            // tile.setCoords(cellWOTile.x, cellWOTile.y);
            setTimeout(() => tile.setCoords(cellWOTile.x, cellWOTile.y));
            tileElem.ontransitionend = () => res();
          })
        );
      }
    }

    await Promise.all(promises);
    console.log('All promises resolve');
  }

  createShadowTile(x, y, type) {
    return new Tile(x, y, this, type || null);
  }

  getVirtualGrid() {
    return new Array(ROWS_SIZE)
      .fill()
      .map((arr) => new Array(COLUMNS_SIZE).fill(0));
  }

  getCellCandyType(cell) {
    return cell.tile.candyType;
  }

  canCollapse() {
    const collapsesResult = this.findCollapses();
    const hasCollapses = collapsesResult.hasCollapsedElements;

    if (hasCollapses) {
      this.collapsesGrid = collapsesResult.collapsesGrid;
    } else {
      this.collapsesGrid = null;
    }

    return hasCollapses;
  }

  async collapseTiles() {
    const collapsesGrid = this.collapsesGrid;

    const promises = [];
    let scoreCounter = 0;

    collapsesGrid.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (col) {
          const cell = this.getCellByIndex(colIndex, rowIndex);
          this.tilesMap.delete(cell.tile.tileElem);
          scoreCounter++;
          promises.push(cell.removeTile());
        }
      });
    });

    promises.push(this.scoreController.increase(scoreCounter));
    await Promise.all(promises);
  }

  findCollapses() {
    const virtualGrid = this.getVirtualGrid();
    let hasCollapsedElements = false;

    // find horizontal
    for (let row = 0; row < ROWS_SIZE; row++) {
      for (let col = 0; col < COLUMNS_SIZE - 2; col++) {
        const cell1 = this.getCellByIndex(col, row);
        const cell2 = this.getCellByIndex(col + 1, row);
        const cell3 = this.getCellByIndex(col + 2, row);

        const candy1 = this.getCellCandyType(cell1);
        const candy2 = this.getCellCandyType(cell2);
        const candy3 = this.getCellCandyType(cell3);

        if (candy1 === candy2 && candy2 === candy3) {
          if (!hasCollapsedElements) {
            hasCollapsedElements = true;
          }

          virtualGrid[row][col] = 1;
          virtualGrid[row][col + 1] = 1;
          virtualGrid[row][col + 2] = 1;
        }
      }
    }

    //find vertical
    for (let row = 0; row < ROWS_SIZE - 2; row++) {
      for (let col = 0; col < COLUMNS_SIZE; col++) {
        const cell1 = this.getCellByIndex(col, row);
        const cell2 = this.getCellByIndex(col, row + 1);
        const cell3 = this.getCellByIndex(col, row + 2);

        const candy1 = this.getCellCandyType(cell1);
        const candy2 = this.getCellCandyType(cell2);
        const candy3 = this.getCellCandyType(cell3);

        if (candy1 === candy2 && candy2 === candy3) {
          if (!hasCollapsedElements) {
            hasCollapsedElements = true;
          }

          virtualGrid[row][col] = 1;
          virtualGrid[row + 1][col] = 1;
          virtualGrid[row + 2][col] = 1;
        }
      }
    }

    return {
      collapsesGrid: virtualGrid,
      hasCollapsedElements: hasCollapsedElements,
    };
  }

  addMoveTileHandler() {
    this.gridElem.addEventListener('pointerdown', this.moveTileHandler, {
      once: true,
    });
  }

  removeMoveTileHandler() {
    this.gridElem.removeEventListener('pointerdown', this.moveTileHandler, {
      once: true,
    });
  }

  moveTileHandler(event) {
    if (event.target.nodeName !== 'IMG') return;

    const tileElem = event.target.closest('.tile');
    const tile = this.tilesMap.get(tileElem);
    const cell = this.getCellByIndex(tile.x, tile.y);

    if (!tile) return;

    cell.selectCellAndNeighbors();
  }
}
