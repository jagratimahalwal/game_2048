import { useState, useEffect, useCallback } from "react";
import "./Game2048.css";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Board = number[][];

const GRID_SIZE = 4;

const createEmptyBoard = (): Board =>
  Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

const cloneBoard = (board: Board): Board => board.map((row) => [...row]);

const getEmptyCells = (board: Board): [number, number][] => {
  const emptyCells: [number, number][] = [];
  board.forEach((row, i) =>
    row.forEach((cell, j) => {
      if (cell === 0) emptyCells.push([i, j]);
    })
  );
  return emptyCells;
};

const addRandomTile = (board: Board): void => {
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) return;
  const [i, j] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  board[i][j] = Math.random() < 0.9 ? 2 : 4;
};

const rotateBoard = (board: Board, times: number): Board => {
  let result = cloneBoard(board);
  for (let t = 0; t < times; t++) {
    result = result[0].map((_, colIndex) =>
      result.map((row) => row[colIndex]).reverse()
    );
  }
  return result;
};

const Game2048 = () => {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const initializeBoard = useCallback(() => {
    const newBoard = createEmptyBoard();
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
  }, []);

  const checkGameOver = useCallback((currentBoard: Board) => {
    if (getEmptyCells(currentBoard).length > 0) return false;

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const current = currentBoard[i][j];
        if (
          (i < GRID_SIZE - 1 && current === currentBoard[i + 1][j]) ||
          (j < GRID_SIZE - 1 && current === currentBoard[i][j + 1])
        ) {
          return false;
        }
      }
    }

    return true;
  }, []);

  const moveTiles = useCallback(
    (direction: Direction) => {
      if (gameOver) return;

      const directionToRotations: Record<Direction, number> = {
        LEFT: 0,
        UP: 3,
        RIGHT: 2,
        DOWN: 1,
      };

      const rotated = rotateBoard(board, directionToRotations[direction]);
      let moved = false;
      let newScore = score;

      const newBoard: Board = rotated.map((row) => {
        const nonZero = row.filter((val) => val !== 0);
        for (let i = 0; i < nonZero.length - 1; i++) {
          if (nonZero[i] === nonZero[i + 1]) {
            nonZero[i] *= 2;
            newScore += nonZero[i];
            nonZero.splice(i + 1, 1);
          }
        }
        const newRow = [
          ...nonZero,
          ...Array(GRID_SIZE - nonZero.length).fill(0),
        ];
        if (newRow.toString() !== row.toString()) moved = true;
        return newRow;
      });

      const finalBoard = rotateBoard(
        newBoard,
        (4 - directionToRotations[direction]) % 4
      );

      if (moved) {
        addRandomTile(finalBoard);
        setBoard(finalBoard);
        setScore(newScore);
        if (checkGameOver(finalBoard)) setGameOver(true);
      }
    },
    [board, score, gameOver, checkGameOver]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keyToDirection: Record<string, Direction> = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
      };
      const direction = keyToDirection[event.key];
      if (direction) moveTiles(direction);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveTiles]);

  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  return (
    <div className="game-container">
      <header className="header">
        <h1>2048</h1>
        <div className="score-container">
          <div className="score">Score: {score}</div>
          <button onClick={initializeBoard} className="new-game-button">
            New Game
          </button>
        </div>
      </header>

      <main className="game-board">
        {board.map((row, i) => (
          <div key={i} className="row">
            {row.map((cell, j) => (
              <div key={`${i}-${j}`} className={`cell cell-${cell}`}>
                {cell !== 0 && cell}
              </div>
            ))}
          </div>
        ))}
      </main>

      {gameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <button onClick={initializeBoard}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default Game2048;
