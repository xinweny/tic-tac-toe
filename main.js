const dom = (() => {
  const _elements = {
    cells: Array.from(document.querySelectorAll('.cell')),
    turnDisplay: document.getElementById('turn-display'),
    endMessage: document.querySelector('.end-msg p'),
    resetButton: document.getElementById('reset-btn'),
    selectDifficulty: document.querySelector('select#difficulty')
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

const gameBoard = ((board) => {
  let _board = board || Array.from(Array(9).keys());

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

  const _render = (() => {
    for (let i = 0; i < _board.length; i++) {
      dom.get('cells')[i].textContent = (typeof _board[i] === 'number') ? '' : _board[i];
    }
  })();

  const getBoard = () => _board;

  const setMarker = (index, marker) => {
    _board[index] = marker;
  }

  const clearBoard = () => {
    _board = Array.from(Array(9).keys());
  }

  const checkWin = (player, board) => {
    const gameBoard = board || _board;
    const marker = player.getMarker();

    for (const pos of _winPositions) {
      let markers = pos.map(i => gameBoard[i]);
      if (markers.every(e => e == marker)) {
        return true;
      } 
    }

    return false;
  }

  return { 
    getBoard, 
    setMarker,
    clearBoard,
    checkWin
  };
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

  const playTurn = function() {
    if (!this.textContent) {
      const currentPlayer = gameController.getCurrentPlayer();

      const index = Number(this.dataset.index);
      const marker = currentPlayer.getMarker();

      gameBoard.setMarker(index, marker);
      dom.setMarker(this, marker);

      gameController.endTurn();
    }
  }

  return { 
    getMarker,
    setMarker,
    hasTurn,
    setAsFirst,
    switchTurn,
    isWinner,
    winGame,
    playTurn
  };
}

const huPlayer = Player('X');

const aiPlayer = ((marker, level) => {
  // Inherit methods from Player
  let AI = Object.create(Player(marker));
  let _level = 'easy';

  AI.setLevel = function() {
    _level = this.value;
    gameController.resetGame()
  }

  AI.playTurn = function() {
    const boardState = gameBoard.getBoard().map((e) => e);
    const currentMarker = gameController.getCurrentPlayer().getMarker();
    let chosenMove = null;

    switch (_level) {
      case 'easy':
        chosenMove = this.makeRandomMove(boardState);
        break;
      case 'medium':
        break;
      case 'hard':
        break;
      case 'impossible':
        chosenMove = this.minimax(boardState, currentMarker).index;
        break;
    }

    gameBoard.setMarker(chosenMove, this.getMarker());
    dom.setMarker(dom.get('cells')[chosenMove], this.getMarker());

    // End turn
    gameController.endTurn();
  }
  
  AI.minimax = function(boardState, currMark) {
    // Get indexes of all empty cells
    const emptyCellIdxs = boardState.filter(e => typeof e === 'number');

    // Check for terminal state
    if (gameBoard.checkWin(huPlayer, boardState)) {
      return { score: -1 };
    } else if (gameBoard.checkWin(aiPlayer, boardState)) {
      return { score: 1 };
    } else if (emptyCellIdxs.length === 0) {
      return { score: 0 };
    }

    // Test outcome of playing the current player's mark on each empty cell
    const allTestMoveInfos = [];
    for (let i = 0; i < emptyCellIdxs.length; i++) {
      const testMoveInfo = {};
      testMoveInfo.index = boardState[emptyCellIdxs[i]];
      boardState[emptyCellIdxs[i]] = currMark;

      const result = (currMark === this.getMarker()) ? this.minimax(boardState, huPlayer.getMarker()) : this.minimax(boardState, this.getMarker());

      testMoveInfo.score = result.score;
      boardState[emptyCellIdxs[i]] = testMoveInfo.index; // End test play

      allTestMoveInfos.push(testMoveInfo); // Save test-play info
    }

    let bestTestMove = null;
    if (currMark === this.getMarker()) {
      let bestScore = -Infinity;
      for (let i = 0; i < allTestMoveInfos.length; i++) {
        if (allTestMoveInfos[i].score > bestScore) {
          bestScore = allTestMoveInfos[i].score;
          bestTestMove = i;
        }
      }
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < allTestMoveInfos.length; i++) {
        if (allTestMoveInfos[i].score < bestScore) {
          bestScore = allTestMoveInfos[i].score;
          bestTestMove = i;
        }
      }
    }
    
    return allTestMoveInfos[bestTestMove];
  }

  AI.makeRandomMove = function(boardState) {
    const emptyCellIdxs = boardState.filter(e => typeof e === 'number');
    const randIdx = Math.floor(Math.random() * emptyCellIdxs.length);

    return emptyCellIdxs[randIdx];
  }

  return AI;
})('O', 'easy');

const gameController = (() => {
  let _hasWinner = false;
  let _isTie = false;

  const getCurrentPlayer = () => (huPlayer.hasTurn()) ? huPlayer : aiPlayer;

  const endTurn = () => {
    huPlayer.switchTurn();
    aiPlayer.switchTurn();

    const currentPlayer = getCurrentPlayer();
    dom.setText('turnDisplay', `Player ${currentPlayer.getMarker()}'s turn`);

    checkWinner();
    if (!_hasWinner && !_isTie && aiPlayer.hasTurn()) aiPlayer.playTurn();
  }

  const endGame = player => {
    if (player) {
      player.winGame();
      dom.setText('endMessage', `Player ${player.getMarker()} wins!`);
    } else {
      dom.setText('endMessage', 'Tie');
    }

    for (const cell of dom.get('cells')) {
      cell.removeEventListener('click', huPlayer.playTurn, false);
    }
  }

  const checkWinner = function() {
    _hasWinner = gameBoard.checkWin(huPlayer);

    if (_hasWinner) {
      huPlayer.winGame();
    } else {
      _hasWinner = gameBoard.checkWin(aiPlayer);
      if (_hasWinner) aiPlayer.winGame();
    }

    if (huPlayer.isWinner()) { 
      endGame(huPlayer);
    } else if (aiPlayer.isWinner()) { 
      endGame(aiPlayer);
    } else if (gameBoard.getBoard().every(e => typeof e === 'string')) {
      _isTie = true;
      endGame();
    }
  }

  const resetGame = () => {
    gameBoard.clearBoard();
    dom.clearMarkers();

    huPlayer.setAsFirst();
    dom.setText('turnDisplay', `Player ${huPlayer.getMarker()}'s turn`);
    dom.clearText('endMessage');
  }

  const _init = (() => {
    huPlayer.setAsFirst();

    for (let i = 0; i < gameBoard.getBoard().length; i++) {
      let cell = dom.get('cells')[i];
      cell.addEventListener('click', huPlayer.playTurn, false);
    }

    dom.get('selectDifficulty').addEventListener('change', aiPlayer.setLevel, false)
    dom.get('resetButton').addEventListener('click', resetGame, false);
  })();

  return {
    endTurn,
    getCurrentPlayer,
    resetGame
  };
})();