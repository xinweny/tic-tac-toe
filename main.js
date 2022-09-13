const dom = (() => {
  const _elements = {
    cells: Array.from(document.querySelectorAll('.cell'))
  };

  const get = element => _elements[element];

  const setMarker = (index, marker) => {
    const cell = _elements['cells'][index]; 
    cell.textContent = marker;
  }

  return { 
    get, 
    setMarker }
})();

const Player = (marker, current) => {
  let _marker = marker;
  let _hasTurn = false;

  const getMarker = () => _marker;

  const setMarker = marker => _marker = marker;

  const hasTurn = () => _hasTurn;
  const switchTurn = () => _hasTurn = !_hasTurn;

  return { 
    getMarker,
    setMarker,
    hasTurn,
    switchTurn
  };
}

const gameBoard = (() => {
  let _board = Array(9).fill('');

  const getBoard = () => _board;

  const render = (() => {
    for (let i = 0; i < _board.length; i++) {
      dom.get('cells')[i].textContent = _board[i];
    }
  })();

  const setMarker = function(index, marker) {
    _board[index] = marker;
  }

  return { getBoard, setMarker };
})();

const gameController = (() => {
  const xPlayer = Player('X');
  const oPlayer = Player('O');
  let turn = 0;

  const getCurrentPlayer = () => (xPlayer.hasTurn()) ? xPlayer : oPlayer;

  const switchPlayerTurns = () => {
    xPlayer.switchTurn();
    oPlayer.switchTurn();
    turn += 1;
  }

  const playTurn = function() {
    if (!this.textContent) {
      const currentPlayer = getCurrentPlayer();

      const index = Number(this.dataset.index);
      const marker = currentPlayer.getMarker();

      gameBoard.setMarker(index, marker);
      dom.setMarker(index, marker);

      switchPlayerTurns();
    }
  }

  const _init = (() => {
    turn += 1;
    xPlayer.switchTurn();

    for (let i = 0; i < gameBoard.getBoard().length; i++) {
      let cell = dom.get('cells')[i];
      cell.addEventListener('click', playTurn.bind(cell));
    }
  })();

  return {};
})();