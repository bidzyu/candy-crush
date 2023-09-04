export const CANDIES_TYPES = [
  'Blue',
  'Orange',
  'Green',
  'Yellow',
  'Red',
  'Purple',
];
export let ROWS_SIZE = 9;
export let COLUMNS_SIZE = 9;

export function setCellSize(val) {
  ROWS_SIZE = val;
  COLUMNS_SIZE = val;
  document.body.style.setProperty('--cell-count', val);
}
