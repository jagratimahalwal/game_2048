import { useState, useEffect, useCallback } from "react";
import "./Game2048.css";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Board = number[][];

const GRID_SIZE = 4;
const INITIAL_TILES = 2;

const Game2048 = () => {
  const [board, setBoard] = useState<Board>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Initialize the board
  const initializeBoard = useCallback(() => {
    const newBoard: Board = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
  }, []);

  // Add a random tile (2 or 4) to the board
  const addRandomTile = (currentBoard: Board) => {
    const emptyCells: [number, number][] = [];
    currentBoard.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell === 0) {
          emptyCells.push([i, j]);
        }
      });
    });

    if (emptyCells.length > 0) {
      const [i, j] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      currentBoard[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  // Move tiles in the specified direction
  const moveTiles = (direction: Direction) => {
    if (gameOver) return;

    const newBoard = JSON.parse(JSON.stringify(board));
    let moved = false;
    let newScore = score;

    const rotateBoard = (board: Board, times: number) => {
      for (let t = 0; t < times; t++) {
        const rotated: Board = Array(GRID_SIZE)
          .fill(null)
          .map(() => Array(GRID_SIZE).fill(0));
        for (let i = 0; i < GRID_SIZE; i++) {
          for (let j = 0; j < GRID_SIZE; j++) {
            rotated[i][j] = board[GRID_SIZE - 1 - j][i];
          }
        }
        board.splice(0, board.length, ...rotated);
      }
    };

    // Rotate board to handle all directions as left movement
    const rotations = {
      LEFT: 0,
      UP: 1,
      RIGHT: 2,
      DOWN: 3,
    }[direction];

    rotateBoard(newBoard, rotations);

    // Move and merge tiles
    for (let i = 0; i < GRID_SIZE; i++) {
      const row = newBoard[i].filter((cell) => cell !== 0);
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          newScore += row[j];
          row.splice(j + 1, 1);
          moved = true;
        }
      }
      const newRow = row.concat(Array(GRID_SIZE - row.length).fill(0));
      if (newRow.join(",") !== newBoard[i].join(",")) {
        moved = true;
      }
      newBoard[i] = newRow;
    }

    // Rotate back
    rotateBoard(newBoard, (4 - rotations) % 4);

    if (moved) {
      addRandomTile(newBoard);
      setBoard(newBoard);
      setScore(newScore);
      checkGameOver(newBoard);
    }
  };

  // Check if the game is over
  const checkGameOver = (currentBoard: Board) => {
    // Check for empty cells
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (currentBoard[i][j] === 0) return;
      }
    }

    // Check for possible merges
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const current = currentBoard[i][j];
        if (
          (i < GRID_SIZE - 1 && current === currentBoard[i + 1][j]) ||
          (j < GRID_SIZE - 1 && current === currentBoard[i][j + 1])
        ) {
          return;
        }
      }
    }

    setGameOver(true);
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
          moveTiles("UP");
          break;
        case "ArrowDown":
          moveTiles("DOWN");
          break;
        case "ArrowLeft":
          moveTiles("LEFT");
          break;
        case "ArrowRight":
          moveTiles("RIGHT");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [board, gameOver]);

  // Initialize the game
  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  return (
    <div className="game-container">
      <div className="header">
        <h1>2048</h1>
        <div className="score-container">
          <div className="score">Score: {score}</div>
          <button onClick={initializeBoard} className="new-game-button">
            New Game
          </button>
        </div>
      </div>
      <div className="game-board">
        {board.map((row, i) => (
          <div key={i} className="row">
            {row.map((cell, j) => (
              <div key={`${i}-${j}`} className={`cell cell-${cell}`}>
                {cell !== 0 && cell}
              </div>
            ))}
          </div>
        ))}
      </div>
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
