const gameBoard = (() => {
  let board = Array(9).fill('.');
  const cells = Array.from(document.querySelectorAll('.cell'));
  const render = () => {
    for (let i = 0; i < 9; i++) {
      cells[i].textContent = board[i];
    }
  };

  render();

  return { cells };
})();

const gameController = (() => {
  return {};
})();

const Player = () => {
  return {};
}