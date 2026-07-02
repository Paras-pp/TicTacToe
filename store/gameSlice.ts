import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Cell = 'X' | 'O' | null;

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diagonals
];

function checkWinner(board: Cell[]): { winner: Cell; line: number[] | null } {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
}

interface GameState {
  board: Cell[];
  isXTurn: boolean;
  scoreX: number;
  scoreO: number;
  scoreDraw: number;
  gameOver: boolean;
  winner: Cell;
  isDraw: boolean;
  winLine: number[] | null;
  showModal: boolean;
}

const initialBoardState = {
  board: Array(9).fill(null) as Cell[],
  isXTurn: true,
  gameOver: false,
  winner: null as Cell,
  isDraw: false,
  winLine: null as number[] | null,
  showModal: false,
};

const initialState: GameState = {
  ...initialBoardState,
  scoreX: 0,
  scoreO: 0,
  scoreDraw: 0,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    makeMove(state, action: PayloadAction<number>) {
      const index = action.payload;
      if (state.gameOver || state.board[index]) return;
      state.board[index] = state.isXTurn ? 'X' : 'O';

      const { winner, line } = checkWinner(state.board);
      if (winner) {
        state.winLine = line;
        state.gameOver = true;
        state.winner = winner;
        if (winner === 'X') state.scoreX += 1;
        else state.scoreO += 1;
      } else if (state.board.every(Boolean)) {
        state.gameOver = true;
        state.isDraw = true;
        state.scoreDraw += 1;
      } else {
        state.isXTurn = !state.isXTurn;
      }
    },
    setShowModal(state, action: PayloadAction<boolean>) {
      state.showModal = action.payload;
    },
    resetRound(state) {
      Object.assign(state, initialBoardState, { board: Array(9).fill(null) });
    },
    resetAll(state) {
      Object.assign(state, initialBoardState, {
        board: Array(9).fill(null),
        scoreX: 0,
        scoreO: 0,
        scoreDraw: 0,
      });
    },
  },
});

export const { makeMove, setShowModal, resetRound, resetAll } = gameSlice.actions;
export default gameSlice.reducer;
