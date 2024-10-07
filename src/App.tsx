import { useState, useEffect, useCallback, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Cylinder } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Player = 1 | 2;
type Cell = Player | null;
type Board = Cell[][][];

const BOARD_SIZE = 4;
const WINNING_LENGTH = 4;

const createEmptyBoard = (): Board => {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() =>
      Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(null))
    );
}; // 1 unidade de tempo

const Piece = ({
  position,
  player,
}: {
  position: [number, number, number];
  player: Player;
}) => {
  return (
    <Cylinder
      position={position}
      args={[0.4, 0.4, 0.8, 32]}
      material-color={player === 1 ? "red" : "yellow"}
    />
  );
};

const Board = ({
  board,
  onCellClick,
}: {
  board: Board;
  onCellClick: (x: number, y: number) => void;
}) => {
  return (
    <group>
      {board.map((plane, x) =>
        plane.map((row, y) =>
          row.map((cell, z) => (
            <group
              key={`${x}-${y}-${z}`}
              position={[x - 1.5, y - 1.5, z - 1.5]}
            >
              <mesh onClick={() => onCellClick(x, y)}>
                <boxGeometry args={[0.9, 0.9, 0.9]} />
                <meshStandardMaterial
                  color="skyblue"
                  opacity={0.3}
                  transparent
                />
              </mesh>
              {cell && <Piece position={[0, 0, 0]} player={cell} />}
            </group>
          ))
        )
      )}
    </group>
  );
};

const Game = () => {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [winner, setWinner] = useState<Player | null>(null);
  const [depth, setDepth] = useState<number>(3);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const [aiStartsGame, setAiStartsGame] = useState(false);

  const checkWinner = useCallback((board: Board): Player | null => {
    const directions = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 0],
      [1, -1, 0],
      [1, 0, 1],
      [1, 0, -1],
      [0, 1, 1],
      [0, 1, -1],
      [1, 1, 1],
      [1, 1, -1],
      [1, -1, 1],
      [1, -1, -1],
    ]; // 1 unidade de tempo

    const checkLine = (
      x: number,
      y: number,
      z: number,
      dx: number,
      dy: number,
      dz: number
    ): Player | null => {
      const startCell = board[x][y][z]; // 1 unidade de tempo
      if (startCell === null) return null; // 1 unidade de tempo

      for (let i = 1; i < WINNING_LENGTH; i++) {
        // 1 unidade de tempo (inicialização)
        const newX = x + i * dx; // 1 unidade de tempo
        const newY = y + i * dy; // 1 unidade de tempo
        const newZ = z + i * dz; // 1 unidade de tempo

        if (
          newX < 0 ||
          newX >= BOARD_SIZE ||
          newY < 0 ||
          newY >= BOARD_SIZE ||
          newZ < 0 ||
          newZ >= BOARD_SIZE ||
          board[newX][newY][newZ] !== startCell
        ) {
          return null; // 1 unidade de tempo
        }
      } // 3 * (WINNING_LENGTH - 1) unidades de tempo (loop)

      return startCell; // 1 unidade de tempo
    };

    for (let x = 0; x < BOARD_SIZE; x++) {
      // 1 unidade de tempo (inicialização)
      for (let y = 0; y < BOARD_SIZE; y++) {
        // 1 unidade de tempo (inicialização)
        for (let z = 0; z < BOARD_SIZE; z++) {
          // 1 unidade de tempo (inicialização)
          for (const [dx, dy, dz] of directions) {
            // 1 unidade de tempo (inicialização)
            const winner = checkLine(x, y, z, dx, dy, dz); // 7 + 3 * (WINNING_LENGTH - 1) unidades de tempo
            if (winner !== null) {
              return winner; // 1 unidade de tempo
            }
          } // 13 * (7 + 3 * (WINNING_LENGTH - 1) + 1) unidades de tempo (loop)
        } // BOARD_SIZE * 13 * (7 + 3 * (WINNING_LENGTH - 1) + 1) unidades de tempo (loop)
      } // BOARD_SIZE^2 * 13 * (7 + 3 * (WINNING_LENGTH - 1) + 1) unidades de tempo (loop)
    } // BOARD_SIZE^3 * 13 * (7 + 3 * (WINNING_LENGTH - 1) + 1) unidades de tempo (loop)

    return null; // 1 unidade de tempo
  }, []); // Total: BOARD_SIZE^3 * 13 * (7 + 3 * (WINNING_LENGTH - 1) + 1) + 4 unidades de tempo

  const evaluateBoard = (board: Board, player: Player): number => {
    const opponent = player === 1 ? 2 : 1; // 1 unidade de tempo
    let score = 0; // 1 unidade de tempo

    const countLine = (
      x: number,
      y: number,
      z: number,
      dx: number,
      dy: number,
      dz: number
    ): number => {
      let playerCount = 0; // 1 unidade de tempo
      let opponentCount = 0; // 1 unidade de tempo

      for (let i = 0; i < WINNING_LENGTH; i++) {
        // 1 unidade de tempo (inicialização)
        const newX = x + i * dx; // 1 unidade de tempo
        const newY = y + i * dy; // 1 unidade de tempo
        const newZ = z + i * dz; // 1 unidade de tempo

        if (
          newX < 0 ||
          newX >= BOARD_SIZE ||
          newY < 0 ||
          newY >= BOARD_SIZE ||
          newZ < 0 ||
          newZ >= BOARD_SIZE
        ) {
          break; // 1 unidade de tempo
        }

        if (board[newX][newY][newZ] === player)
          playerCount++; // 2 unidades de tempo
        else if (board[newX][newY][newZ] === opponent) opponentCount++; // 2 unidades de tempo
      } // 7 * WINNING_LENGTH unidades de tempo (loop)

      if (opponentCount === 0) {
        // 1 unidade de tempo
        if (playerCount === WINNING_LENGTH) return 100; // 2 unidades de tempo
        return playerCount; // 1 unidade de tempo
      }
      if (playerCount === 0) {
        // 1 unidade de tempo
        if (opponentCount === WINNING_LENGTH) return -100; // 2 unidades de tempo
        return -opponentCount; // 1 unidade de tempo
      }
      return 0; // 1 unidade de tempo
    };

    const directions = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 0],
      [1, -1, 0],
      [1, 0, 1],
      [1, 0, -1],
      [0, 1, 1],
      [0, 1, -1],
      [1, 1, 1],
      [1, 1, -1],
      [1, -1, 1],
      [1, -1, -1],
    ]; // 1 unidade de tempo

    for (let x = 0; x < BOARD_SIZE; x++) {
      // 1 unidade de tempo (inicialização)
      for (let y = 0; y < BOARD_SIZE; y++) {
        // 1 unidade de tempo (inicialização)
        for (let z = 0; z < BOARD_SIZE; z++) {
          // 1 unidade de tempo (inicialização)
          for (const [dx, dy, dz] of directions) {
            // 1 unidade de tempo (inicialização)
            score += countLine(x, y, z, dx, dy, dz); // 9 + 7 * WINNING_LENGTH unidades de tempo
          } // 13 * (9 + 7 * WINNING_LENGTH) unidades de tempo (loop)
        } // BOARD_SIZE * 13 * (9 + 7 * WINNING_LENGTH) unidades de tempo (loop)
      } // BOARD_SIZE^2 * 13 * (9 + 7 * WINNING_LENGTH) unidades de tempo (loop)
    } // BOARD_SIZE^3 * 13 * (9 + 7 * WINNING_LENGTH) unidades de tempo (loop)

    return score; // 1 unidade de tempo
  }; // Total: BOARD_SIZE^3 * 13 * (9 + 7 * WINNING_LENGTH) + 6 unidades de tempo

  const minimax = (
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    maximizingPlayer: boolean
  ): number => {
    const winner = checkWinner(board); // BOARD_SIZE^3 * 13 * (7 + 3 * (WINNING_LENGTH - 1) + 1) + 4 unidades de tempo
    if (winner !== null) {
      return winner === 2 ? 1000 : -1000; // 2 unidades de tempo
    }
    if (depth === 0) {
      return evaluateBoard(board, 2); // BOARD_SIZE^3 * 13 * (9 + 7 * WINNING_LENGTH) + 6 unidades de tempo
    }

    if (maximizingPlayer) {
      let maxEval = -Infinity; // 1 unidade de tempo
      for (let x = 0; x < BOARD_SIZE; x++) {
        // 1 unidade de tempo (inicialização)
        for (let y = 0; y < BOARD_SIZE; y++) {
          // 1 unidade de tempo (inicialização)
          if (board[x][y][BOARD_SIZE - 1] === null) {
            // 1 unidade de tempo
            const newBoard = JSON.parse(JSON.stringify(board)); // 1 unidade de tempo
            for (let z = 0; z < BOARD_SIZE; z++) {
              // 1 unidade de tempo (inicialização)
              if (!newBoard[x][y][z]) {
                // 1 unidade de tempo
                newBoard[x][y][z] = 2; // 1 unidade de tempo
                break; // 1 unidade de tempo
              }
            } // 3 * BOARD_SIZE unidades de tempo (pior caso)
            const eval_board = minimax(newBoard, depth - 1, alpha, beta, false); // Recursão
            maxEval = Math.max(maxEval, eval_board); // 1 unidade de tempo
            alpha = Math.max(alpha, eval_board); // 1 unidade de tempo
            if (beta <= alpha) break; // 1 unidade de tempo
          }
        } // BOARD_SIZE * (7 + 3 * BOARD_SIZE + Recursão) unidades de tempo (loop)
      } // BOARD_SIZE^2 * (7 + 3 * BOARD_SIZE + Recursão) unidades de tempo (loop)
      return maxEval; // 1 unidade de tempo
    } else {
      let minEval = Infinity; // 1 unidade de tempo
      for (let x = 0; x < BOARD_SIZE; x++) {
        // 1 unidade de tempo (inicialização)
        for (let y = 0; y < BOARD_SIZE; y++) {
          // 1 unidade de tempo (inicialização)
          if (board[x][y][BOARD_SIZE - 1] === null) {
            // 1 unidade de tempo
            const newBoard = JSON.parse(JSON.stringify(board)); // 1 unidade de tempo
            for (let z = 0; z < BOARD_SIZE; z++) {
              // 1 unidade de tempo (inicialização)
              if (!newBoard[x][y][z]) {
                // 1 unidade de tempo
                newBoard[x][y][z] = 1; // 1 unidade de tempo
                break; // 1 unidade de tempo
              }
            } // 3 * BOARD_SIZE unidades de tempo (pior caso)
            const eval_board = minimax(newBoard, depth - 1, alpha, beta, true); // Recursão
            minEval = Math.min(minEval, eval_board); // 1 unidade de tempo
            beta = Math.min(beta, eval_board); // 1 unidade de tempo
            if (beta <= alpha) break; // 1 unidade de tempo
          }
        } // BOARD_SIZE * (7 + 3 * BOARD_SIZE + Recursão) unidades de tempo (loop)
      } // BOARD_SIZE^2 * (7 + 3 * BOARD_SIZE + Recursão) unidades de tempo (loop)
      return minEval; // 1 unidade de tempo
    }
  }; // Total: Complexo devido à recursão, depende da profundidade e do estado do tabuleiro

  const getBestMove = (board: Board, depth: number): [number, number] => {
    let bestScore = -Infinity; // 1 unidade de tempo
    let bestMove: [number, number] = [-1, -1]; // 1 unidade de tempo

    for (let x = 0; x < BOARD_SIZE; x++) {
      // 1 unidade de tempo (inicialização)
      for (let y = 0; y < BOARD_SIZE; y++) {
        // 1 unidade de tempo (inicialização)
        if (board[x][y][BOARD_SIZE - 1] === null) {
          // 1 unidade de tempo
          const newBoard = JSON.parse(JSON.stringify(board)); // 1 unidade de tempo
          for (let z = 0; z < BOARD_SIZE; z++) {
            // 1 unidade de tempo (inicialização)
            if (!newBoard[x][y][z]) {
              // 1 unidade de tempo
              newBoard[x][y][z] = 2; // 1 unidade de tempo
              break; // 1 unidade de tempo
            }
          } // 3 * BOARD_SIZE unidades de tempo (pior caso)
          const score = minimax(newBoard, depth, -Infinity, Infinity, false); // Complexo, depende da profundidade
          if (score > bestScore) {
            // 1 unidade de tempo
            bestScore = score; // 1 unidade de tempo
            bestMove = [x, y]; // 1 unidade de tempo
          }
        }
      } // BOARD_SIZE * (6 + 3 * BOARD_SIZE + Complexidade do minimax) unidades de tempo (loop)
    } // BOARD_SIZE^2 * (6 + 3 * BOARD_SIZE + Complexidade do minimax) unidades de tempo (loop)

    return bestMove; // 1 unidade de tempo
  }; // Total: BOARD_SIZE^2 * (6 + 3 * BOARD_SIZE + Complexidade do minimax) + 3 unidades de tempo

  const isProcessingMove = useRef(false);

  const makeMove = useCallback(
    (x: number, y: number, player: Player) => {
      if (winner || isProcessingMove.current) {
        return;
      }

      isProcessingMove.current = true;

      setBoard((prevBoard) => {
        const newBoard = JSON.parse(JSON.stringify(prevBoard));
        let moveMade = false;

        for (let z = 0; z < BOARD_SIZE; z++) {
          if (!newBoard[x][y][z]) {
            newBoard[x][y][z] = player;
            moveMade = true;
            console.log(`Player ${player} made a move at ${x}, ${y}, ${z}`);
            break;
          }
        }

        if (!moveMade) {
          isProcessingMove.current = false;
          return prevBoard;
        }

        return newBoard;
      });

      setTimeout(() => {
        setBoard((currentBoard) => {
          const newWinner = checkWinner(currentBoard);
          if (newWinner) {
            setWinner(newWinner);
            setShowWinnerDialog(true);
          } else {
            setCurrentPlayer(player === 1 ? 2 : 1);
          }
          isProcessingMove.current = false;
          return currentBoard;
        });
      }, 100);
    },
    [winner, checkWinner]
  );

  const handlePlayerMove = useCallback(
    (x: number, y: number) => {
      if (currentPlayer === 1 && !winner && !isProcessingMove.current) {
        makeMove(x, y, 1);
      }
    },
    [currentPlayer, winner, makeMove]
  );

  useEffect(() => {
    if (currentPlayer === 2 && !winner && !isProcessingMove.current) {
      const newWinner = checkWinner(board);
      if (newWinner) {
        setWinner(newWinner);
        setShowWinnerDialog(true);
        return;
      }
      const timer = setTimeout(() => {
        const [x, y] = getBestMove(board, depth);
        makeMove(x, y, 2);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentPlayer, winner, board, depth, makeMove]);

  useEffect(() => {
    if (
      aiStartsGame &&
      board.every((plane) =>
        plane.every((row) => row.every((cell) => cell === null))
      )
    ) {
      const [x, y] = getBestMove(board, depth);
      makeMove(x, y, 2);
    }
  }, [aiStartsGame, board, depth, makeMove]);

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(aiStartsGame ? 2 : 1);
    setWinner(null);
    setShowWinnerDialog(false);
    isProcessingMove.current = false;
  };

  return (
    <div className="w-full h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Connect-4 3D</h1>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <div
              className="bg-gray-800 rounded-lg overflow-hidden"
              style={{ height: "600px" }}
            >
              <Canvas camera={{ position: [5, 5, 5] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Board board={board} onCellClick={handlePlayerMove} />
                <OrbitControls />
              </Canvas>
            </div>
          </div>
          <div className="flex-1 space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Configurações</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    AI Depth
                  </label>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[depth]}
                    onValueChange={(value) => setDepth(value[0])}
                  />
                  <span className="text-sm">depth: {depth}</span>
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={aiStartsGame}
                      onChange={() => setAiStartsGame(!aiStartsGame)}
                      className="form-checkbox"
                    />
                    <span>AI começa o Jogo</span>
                  </label>
                </div>
                <Button onClick={resetGame} className="w-full">
                  Resetar Jogo
                </Button>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Informações</h2>
              <p className="text-lg">
                {winner
                  ? `Jogador ${winner} ganhou!`
                  : `Atual jogador: ${currentPlayer === 1 ? "Humano" : "AI"}`}
              </p>
            </div>
          </div>
        </div>
      </div>
      <AlertDialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Game Over!</AlertDialogTitle>
            <AlertDialogDescription>
              {winner === 1
                ? "Parabéns! Você ganhou!"
                : "Você perdeu! Tente novamente!"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={resetGame}>
              Jogar Novamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Game;
