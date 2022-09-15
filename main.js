const dom = (() => {
  const _elements = {
    cells: Array.from(document.querySelectorAll('.cell')),
    endMessage: document.querySelector('.end-msg p'),
    resetButton: document.getElementById('reset-btn'),
    selectDifficulty: document.querySelector('select#difficulty'),
    xButton: document.getElementById('x-btn'),
    oButton: document.getElementById('o-btn')
  };

  const get = element => _elements[element];

  const setMarker = (cell, marker) => {
    cell.textContent = marker;

    if (marker == 'X') {
      cell.classList.add('x');
      if (cell.classList.contains('o')) cell.classList.remove('o');
    } else if (marker == 'O') {
      cell.classList.add('o');
      if (cell.classList.contains('x')) cell.classList.remove('x');
    }
  }

  const clearMarkers = () => {
    for (const cell of _elements.cells) {
      cell.textContent = undefined;
    }
  }

  const setText = (element, text) => _elements[element].textContent = text;

  const clearText = element => _elements[element].textContent = undefined;

  const addEvtListener = function(element, event, callback) {
    if (element == 'cells') {
      for (let i = 0; i < 9; i++) {
        let cell = _elements[element][i];
        cell.addEventListener(event, callback, false);
      }
    } else {
      _elements[element].addEventListener(event, callback, false);
    }
  }

  const addClass = (element, cls) => _elements[element].classList.add(cls);

  const removeClass = (element, cls) => {
    const classList = _elements[element].classList;
    if (classList.contains(cls)) classList.remove(cls);
  }

  const toggleDisabled = (element) => _elements[element].disabled = !_elements[element].disabled;

  const styleEndMessage = function(marker) {
    if (marker) {
      this.setText('endMessage', `${marker} WINS!`);
      _elements['endMessage'].parentElement.style.backgroundColor = (marker == 'X') ? 'rgba(100, 100, 255, 0.5)' : 'rgba(255, 100, 100, 0.5)';
    } else {
      this.setText('endMessage', 'TIE');
      _elements['endMessage'].parentElement.style.backgroundColor = 'rgba(240, 240, 240, 0.5)';
      _elements['endMessage'].style.color = 'black';
    }
  }

  return { 
    get, 
    setMarker,
    clearMarkers,
    setText,
    clearText,
    addEvtListener,
    addClass,
    removeClass,
    toggleDisabled,
    styleEndMessage
  }
})();

const Player = (marker) => {
  let _marker = marker;
  let _hasTurn = false;
  let _winner = false;

  const getMarker = () => _marker;

  const setMarker = marker => _marker = marker;

  const hasTurn = () => _hasTurn;

  const setTurn = bool => _hasTurn = bool;

  const switchTurn = () => _hasTurn = !_hasTurn;

  const isWinner = () => _winner;

  const winGame = () => _winner = true;

  const resetWin = () => _winner = false;

  const playTurn = function () {
    if (!this.textContent) {
      const index = Number(this.dataset.index);

      gameBoard.setMarker(index, _marker);
      dom.setMarker(this, _marker);

      gameController.endTurn();
    }
  }

  return { 
    getMarker,
    setMarker,
    hasTurn,
    setTurn,
    switchTurn,
    isWinner,
    winGame,
    playTurn,
    resetWin
  };
}

const huPlayer = Player('X');

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

    dom.addEvtListener('cells', 'click', huPlayer.playTurn);
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

const aiPlayer = ((marker, level) => {
  // Inherit methods from Player
  let aiPlayer = Object.create(Player(marker));
  let _level = level;

  aiPlayer.setLevel = function () {
    _level = this.value;
    gameController.resetGame()
  }

  aiPlayer.playTurn = function () {
    const boardState = gameBoard.getBoard().map((e) => e);
    const currentMarker = gameController.getCurrentPlayer().getMarker();
    let chosenMove = null;

    switch (_level) {
      case 'easy':
        chosenMove = this.makeRandomMove(boardState);
        break;
      case 'medium':
        chosenMove = this.pickMoveStyle(0.5, boardState, currentMarker);
        break;
      case 'hard':
        chosenMove = this.pickMoveStyle(0.8, boardState, currentMarker);
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
  
  aiPlayer.minimax = function(boardState, currMark) {
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

  aiPlayer.makeRandomMove = function(boardState) {
    const emptyCellIdxs = boardState.filter(e => typeof e === 'number');
    const randIdx = Math.floor(Math.random() * emptyCellIdxs.length);

    return emptyCellIdxs[randIdx];
  }

  aiPlayer.pickMoveStyle = function(threshold, boardState, currMark) {
    const rand = Math.random();

    if (rand > threshold) {
      return this.makeRandomMove(boardState);
    } else {
      return this.minimax(boardState, currMark).index;
    }
  }

  return aiPlayer;
})('O', 'easy');

const gameController = (() => {
  let _hasWinner = false;
  let _isTie = false;

  const getCurrentPlayer = () => (huPlayer.hasTurn()) ? huPlayer : aiPlayer;

  const endTurn = () => {
    huPlayer.switchTurn();
    aiPlayer.switchTurn();

    const currentPlayer = getCurrentPlayer();

    checkWinner();
    if (!_hasWinner && !_isTie && aiPlayer.hasTurn()) aiPlayer.playTurn();
  }

  const _endGame = player => {
    dom.get('endMessage').parentElement.style.display = 'flex';

    if (player) {
      player.winGame();
      dom.styleEndMessage(player.getMarker());
    } else {
      dom.styleEndMessage();
    }

    for (const cell of dom.get('cells')) {
      cell.removeEventListener('click', huPlayer.playTurn, false);
    }
  }

  const checkWinner = function () {
    _hasWinner = gameBoard.checkWin(huPlayer);

    if (_hasWinner) {
      huPlayer.winGame();
    } else {
      _hasWinner = gameBoard.checkWin(aiPlayer);
      if (_hasWinner) aiPlayer.winGame();
    }

    if (huPlayer.isWinner()) { 
      _endGame(huPlayer);
    } else if (aiPlayer.isWinner()) { 
      _endGame(aiPlayer);
    } else if (gameBoard.getBoard().every(e => typeof e === 'string')) {
      _isTie = true;
      _endGame();
    }
  }

  const resetGame = () => {
    _hasWinner = false;
    _isTie = false;
    huPlayer.resetWin();
    aiPlayer.resetWin();

    gameBoard.clearBoard();
    dom.clearMarkers();

    dom.clearText('endMessage');
    dom.get('endMessage').parentElement.style.display = 'none';

    dom.addEvtListener('cells', 'click', huPlayer.playTurn);
    if (dom.get('xButton').classList.contains('clicked')) {
      huPlayer.setTurn(true);
      aiPlayer.setTurn(false);
    } else {
      aiPlayer.setTurn(true);
      huPlayer.setTurn(false);

      aiPlayer.playTurn();
    }
  }

  const _setHumanAsMarker = function () {
    if (this.dataset.marker == 'X') {
      huPlayer.setMarker('X');
      aiPlayer.setMarker('O');

      dom.addClass('xButton', 'clicked');
      dom.removeClass('oButton', 'clicked');

      dom.toggleDisabled('xButton');
      if (dom.get('oButton').disabled) dom.toggleDisabled('oButton');

    } else if (this.dataset.marker == 'O') {
      huPlayer.setMarker('O');
      aiPlayer.setMarker('X');

      dom.addClass('oButton', 'clicked');
      dom.removeClass('xButton', 'clicked');

      dom.toggleDisabled('oButton');
      if (dom.get('xButton').disabled) dom.toggleDisabled('xButton');
    }

    resetGame();
  }

  const _init = (() => {
    huPlayer.setTurn(true);

    dom.addEvtListener('selectDifficulty', 'change', aiPlayer.setLevel);
    dom.addEvtListener('resetButton', 'click', resetGame);
    dom.addEvtListener('xButton', 'click', _setHumanAsMarker);
    dom.addEvtListener('oButton', 'click', _setHumanAsMarker);
  })();

  return {
    endTurn,
    getCurrentPlayer,
    resetGame
  };
})();