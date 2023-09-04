import { Tile } from './tile.js';
import { COLUMNS_SIZE, ROWS_SIZE } from './gameConstants.js';

export class Cell {
  constructor(grid, x, y) {
    this.grid = grid;
    this.x = x;
    this.y = y;
    this.isEmpty = true;

    this.cellElem = document.createElement('div');
    this.cellElem.classList.add('cell');
  }

  setTiteWithType(tile) {
    this.tile = tile;
    this.isEmpty = false;
    this.grid.gridElem.append(tile.tileElem);
  }

  setTile() {
    this.tile = new Tile(this.x, this.y, this.grid);
    this.isEmpty = false;
    this.grid.gridElem.append(this.tile.tileElem);
  }

  delTile() {
    this.tile.tileElem.classList.add('no-anim');
    this.tile.tileElem.remove();
    this.tile = null;
    this.isEmpty = true;
  }

  async removeTile() {
    this.tile.tileElem.classList.add('remove');

    return new Promise((res) => {
      this.tile.tileElem.onanimationend = () => res();
    }).then(() => {
      this.tile.tileElem.remove();
      this.tile = null;
      this.isEmpty = true;
    });
  }

  async selectCellAndNeighbors() {
    if (this.grid.selectedCell === this) {
      this.unselectSelectedCellAndNeighbors();
      this.removeSelectedCellAndNeighbors();
      this.grid.addMoveTileHandler();
      return;
    }

    if (this.grid.selectedNeighbors.includes(this)) {
      this.selectOtherCell();
      await this.grid.reverseTiles();
      this.unselectSelectedCellAndNeighbors();
      let isColl = this.grid.canCollapse();

      if (!this.grid.currTilesIsCollapse()) {
        await this.grid.reverseTiles();
      }

      isColl = this.grid.canCollapse();

      while (isColl) {
        await this.grid.collapseTiles();
        await this.grid.createNewTilesAndDropDown();
        this.grid.updTilesOnGrid();
        this.grid.scoreController.increaseMul();
        isColl = this.grid.canCollapse();
      }

      this.removeSelectedCellAndNeighbors();
      this.grid.scoreController.resetMul();
      this.grid.addMoveTileHandler();
      return;
    }

    if (this.grid.selectedCell) {
      this.unselectSelectedCellAndNeighbors();
      this.removeSelectedCellAndNeighbors();
    }

    this.selectCell();
    this.selectNeighbors();
    this.grid.addMoveTileHandler();
  }

  selectCell() {
    this.cellElem.classList.add('selected');
    this.grid.selectedCell = this;
  }

  selectOtherCell() {
    this.grid.otherCell = this;
  }

  unselectCell() {
    this.cellElem.classList.remove('selected');
  }

  selectNeighbors() {
    const x = this.x;
    const y = this.y;

    if (this.isValidCellIndex(x + 1, y)) {
      const cell = this.grid.getCellByIndex(x + 1, y);
      cell.selectNeighbor();
    }
    if (this.isValidCellIndex(x - 1, y)) {
      const cell = this.grid.getCellByIndex(x - 1, y);
      cell.selectNeighbor();
    }
    if (this.isValidCellIndex(x, y + 1)) {
      const cell = this.grid.getCellByIndex(x, y + 1);
      cell.selectNeighbor();
    }
    if (this.isValidCellIndex(x, y - 1)) {
      const cell = this.grid.getCellByIndex(x, y - 1);
      cell.selectNeighbor();
    }
  }

  selectNeighbor() {
    this.cellElem.classList.add('neighbor');
    this.grid.selectedNeighbors.push(this);
  }

  unselectNeighbor() {
    this.cellElem.classList.remove('neighbor');
  }

  unselectSelectedCellAndNeighbors() {
    this.grid.selectedCell.unselectCell();
    this.grid.selectedNeighbors.forEach((neighbor) =>
      neighbor.unselectNeighbor()
    );
  }

  removeSelectedCellAndNeighbors() {
    this.grid.selectedCell = null;
    this.grid.otherCell = null;
    this.grid.selectedNeighbors = [];
  }

  isValidCellIndex(x, y) {
    return x >= 0 && x < COLUMNS_SIZE && y >= 0 && y < ROWS_SIZE;
  }
}
