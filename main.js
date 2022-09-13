const dom = (() => {
  const _elements = {
    cells: Array.from(document.querySelectorAll('.cell'))
  };

  const get = element => _elements[element];

  const setMarker = (index, marker) => {
    const cell = _elements['cells'][index]; 
    cell.textContent = marker;
  }

  return { get, setMarker }
})();

const Player = (marker) => {
  let _marker = marker;

  const getMarker = () => _marker;

  const setMarker = (marker) => _marker = marker;

  return { getMarker, setMarker };
}

const gameBoard = (() => {
  let _board = Array(9).fill('');

  const getBoard = () => _board;

  const render = (() => {
    for (let i = 0; i < _board.length; i++) {
      dom.get('cells')[i].textContent = _board[i];
    }
  })();

  const setMarker = function(marker) {
    if (!this.textContent) {
      const index = Number(this.dataset.index);

      _board[index] = marker;
      dom.setMarker(index, marker);
    }
  }

  return { getBoard, setMarker };
})();

const gameController = (() => {
  const _init = () => {
    for (let i = 0; i < gameBoard.getBoard().length; i++) {
      let cell = dom.get('cells')[i];
      cell.addEventListener('click', gameBoard.setMarker.bind(cell, 'a'));
    }
  };

  _init()

  return {};
})();