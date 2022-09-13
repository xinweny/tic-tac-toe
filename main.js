const dom = (() => {
  const _elements = {
    cells: Array.from(document.querySelectorAll('.cell'))
  };

  const get = (element) => _elements[element];

  return { get }
})();

const Player = (marker) => {
  let _marker = marker;

  const getMarker = () => _marker;

  return { getMarker };
}

const gameBoard = (() => {
  let _board = Array(9).fill('x');

  const render = () => {
    for (let i = 0; i < _board.length; i++) {
      dom.get('cells')[i].textContent = _board[i];
    }
  };

  const placeMarker = () => {

  }

  return { };
})();

const gameController = (() => {
  const playerOne = Player('X');

  const _init = (() => {
  })();

  return {};
})();