export class Score {
  constructor(parent, base = 50) {
    this.parent = parent;
    this.scoreBase = base;
    this.mul = 1;

    this.scoreWrapper = document.createElement('div');
    this.scoreWrapper.classList.add('score-wrapper');
    this.scoreWrapper.textContent = 'Score: ';

    this.scoreElem = document.createElement('span');
    this.scoreElem.classList.add('score-elem');
    this.scoreElem.textContent = '0';

    this.scoreWrapper.append(this.scoreElem);
    parent.append(this.scoreWrapper);
  }

  remove() {
    this.scoreWrapper.remove();
  }

  increaseMul() {
    this.mul += 0.5;
  }

  resetMul() {
    this.mul = 1;
  }

  show() {
    this.scoreWrapper.style.display = 'block';
  }

  hide() {
    this.scoreWrapper.style.display = 'none';
  }

  async blink(newVal) {
    new Promise((res) => {
      this.scoreElem.classList.add('blink');

      this.scoreElem.ontransitionend = () => res();
    }).then(() => {
      return new Promise((res) => {
        this.scoreElem.innerHTML = newVal;
        this.scoreElem.classList.remove('blink');

        this.scoreElem.ontransitionend = () => res();
      });
    });
  }

  reset() {
    this.scoreElem.innerHTML = 0;
  }

  async increase(val = 1) {
    const newVal = +this.scoreElem.innerHTML + val * this.mul * this.scoreBase;
    await this.blink(newVal);
  }
}
