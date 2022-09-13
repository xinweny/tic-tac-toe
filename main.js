const dom = (() => {
  const _elements = {
    cells: Array.from(document.querySelectorAll('.cell')),
    turnDisplay: document.getElementById('turn-display'),
    endMessage: document.querySelector('.end-msg p'),
    resetButton: document.getElementById('reset-btn')
  };

  const get = element => _elements[element];

  const setMarker = (cell, marker) => cell.textContent = marker;

  const clearMarkers = () => {
    for (const cell of _elements.cells) {
      cell.textContent = undefined;
    }
  }

  const setText = (element, text) => _elements[element].textContent = text;

  const clearText = element => _elements[element].textContent = undefined;

  return { 
    get, 
    setMarker,
    clearMarkers,
    setText,
    clearText
  }
})();

const Player = (marker) => {
  let _marker = marker;
  let _hasTurn = false;
  let _winner = false;

  const getMarker = () => _marker;

  const setMarker = marker => _marker = marker;

  const hasTurn = () => _hasTurn;

  const setAsFirst = () => _hasTurn = true;

  const switchTurn = () => _hasTurn = !_hasTurn;

  const isWinner = () => _winner;

  const winGame = () => _winner = true;

  return { 
    getMarker,
    setMarker,
    hasTurn,
    setAsFirst,
    switchTurn,
    isWinner,
    winGame
  };
}

const gameBoard = (() => {
  let _board = new Array(9);

  const getBoard = () => _board;

  const _render = (() => {
    for (let i = 0; i < _board.length; i++) {
      dom.get('cells')[i].textContent = _board[i];
    }
  })();

  const setMarker = (index, marker) => {
    _board[index] = marker;
  }

  const clearBoard = () => {
    _board = new Array(9);
  }

  return { 
    getBoard, 
    setMarker,
    clearBoard 
  };
})();

const gameController = (() => {
  const xPlayer = Player('X');
  const oPlayer = Player('O');

  const _winPositions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  let _winner = undefined;

  const getCurrentPlayer = () => (xPlayer.hasTurn()) ? xPlayer : oPlayer;

  const switchPlayerTurns = () => {
    xPlayer.switchTurn();
    oPlayer.switchTurn();

    const currentPlayer = getCurrentPlayer();
    dom.setText('turnDisplay', `Player ${currentPlayer.getMarker()}'s turn`);
  }

  const checkForWin = () => {
    const board = gameBoard.getBoard();
    if (!board.includes(undefined)) dom.setText('endMessage', 'Tie');

    for (const pos of _winPositions) {
      let markers = pos.map(i => board[i]);
      if (markers.every(e => e == 'X')) {
        endGame(xPlayer);
        return xPlayer;
      } else if (markers.every(e => e == 'O')) {
        endGame(oPlayer);
        return oPlayer;
      }
    }
  }

  const endGame = player => {
    player.winGame();
    dom.setText('endMessage', `Player ${player.getMarker()} wins!`);

    for (const cell of dom.get('cells')) {
      cell.removeEventListener('click', playTurn);
    }
  }

  const playTurn = function() {
    if (!this.textContent) {
      const currentPlayer = getCurrentPlayer();

      const index = Number(this.dataset.index);
      const marker = currentPlayer.getMarker();

      gameBoard.setMarker(index, marker);
      dom.setMarker(this, marker);

      _winner = checkForWin();
      if (!_winner) switchPlayerTurns();
    }
  }

  const resetGame = () => {
    gameBoard.clearBoard();
    dom.clearMarkers();

    xPlayer.setAsFirst();
    dom.setText('turnDisplay', `Player ${xPlayer.getMarker()}'s turn`);
    dom.clearText('endMessage');
  }

  const _init = (() => {
    xPlayer.setAsFirst();

    for (let i = 0; i < gameBoard.getBoard().length; i++) {
      let cell = dom.get('cells')[i];
      cell.addEventListener('click', playTurn);
    }

    dom.get('resetButton').addEventListener('click', resetGame);
  })();

  return {};
})();