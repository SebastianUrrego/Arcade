import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, RotateCcw, Flag } from 'lucide-react';

interface MinesweeperGameProps {
  onBackToMenu: () => void;
}

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

const ROWS = 10;
const COLS = 10;
const MINE_COUNT = 15;

const MinesweeperGame = ({ onBackToMenu }: MinesweeperGameProps) => {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'won' | 'lost'>('waiting');
  const [flagsUsed, setFlagsUsed] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  // Inicializar tablero
  const initializeBoard = useCallback(() => {
    const newBoard: Cell[][] = Array(ROWS).fill(null).map(() =>
      Array(COLS).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      }))
    );

    // Colocar minas aleatoriamente
    let minesPlaced = 0;
    while (minesPlaced < MINE_COUNT) {
      const row = Math.floor(Math.random() * ROWS);
      const col = Math.floor(Math.random() * COLS);
      
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Calcular números de minas vecinas
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (!newBoard[row][col].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const newRow = row + dr;
              const newCol = col + dc;
              if (
                newRow >= 0 && newRow < ROWS &&
                newCol >= 0 && newCol < COLS &&
                newBoard[newRow][newCol].isMine
              ) {
                count++;
              }
            }
          }
          newBoard[row][col].neighborMines = count;
        }
      }
    }

    return newBoard;
  }, []);

  // Revelar celda y celdas vecinas vacías
  const revealCell = useCallback((row: number, col: number, currentBoard: Cell[][]): Cell[][] => {
    const newBoard = currentBoard.map(r => r.map(c => ({ ...c })));
    
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS || 
        newBoard[row][col].isRevealed || newBoard[row][col].isFlagged) {
      return newBoard;
    }

    newBoard[row][col].isRevealed = true;

    // Si la celda está vacía, revelar vecinas
    if (newBoard[row][col].neighborMines === 0 && !newBoard[row][col].isMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const newRow = row + dr;
          const newCol = col + dc;
          if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
            if (!newBoard[newRow][newCol].isRevealed) {
              const recursiveBoard = revealCell(newRow, newCol, newBoard);
              for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                  newBoard[r][c] = recursiveBoard[r][c];
                }
              }
            }
          }
        }
      }
    }

    return newBoard;
  }, []);

  // Manejar clic en celda
  const handleCellClick = (row: number, col: number) => {
    if (gameState !== 'playing' || board[row][col].isRevealed || board[row][col].isFlagged) {
      return;
    }

    const newBoard = revealCell(row, col, board);
    setBoard(newBoard);

    // Verificar si clickeó una mina
    if (newBoard[row][col].isMine) {
      setGameState('lost');
      // Revelar todas las minas
      const finalBoard = newBoard.map(r => r.map(c => 
        c.isMine ? { ...c, isRevealed: true } : c
      ));
      setBoard(finalBoard);
      return;
    }

    // Verificar victoria
    const revealedNonMines = newBoard.flat().filter(cell => 
      cell.isRevealed && !cell.isMine
    ).length;
    
    if (revealedNonMines === ROWS * COLS - MINE_COUNT) {
      setGameState('won');
    }
  };

  // Manejar clic derecho para banderas
  const handleRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    
    if (gameState !== 'playing' || board[row][col].isRevealed) {
      return;
    }

    const newBoard = board.map(r => r.map(c => ({ ...c })));
    
    if (newBoard[row][col].isFlagged) {
      newBoard[row][col].isFlagged = false;
      setFlagsUsed(prev => prev - 1);
    } else if (flagsUsed < MINE_COUNT) {
      newBoard[row][col].isFlagged = true;
      setFlagsUsed(prev => prev + 1);
    }

    setBoard(newBoard);
  };

  // Inicializar juego
  const startGame = () => {
    const newBoard = initializeBoard();
    setBoard(newBoard);
    setGameState('playing');
    setFlagsUsed(0);
    setShowInstructions(false);
  };

  const resetGame = () => {
    setGameState('waiting');
    setShowInstructions(true);
    setBoard([]);
    setFlagsUsed(0);
  };

  // Obtener clase CSS para celda
  const getCellClass = (cell: Cell) => {
    let baseClass = 'w-8 h-8 border border-border/20 flex items-center justify-center text-xs font-bold cursor-pointer select-none';
    
    if (!cell.isRevealed) {
      baseClass += ' bg-board-light hover:bg-board-dark';
    } else if (cell.isMine) {
      baseClass += ' bg-destructive text-destructive-foreground';
    } else {
      baseClass += ' bg-muted';
      
      // Colores según número de minas vecinas
      switch (cell.neighborMines) {
        case 1: baseClass += ' text-blue-500'; break;
        case 2: baseClass += ' text-green-500'; break;
        case 3: baseClass += ' text-red-500'; break;
        case 4: baseClass += ' text-purple-500'; break;
        case 5: baseClass += ' text-yellow-500'; break;
        case 6: baseClass += ' text-pink-500'; break;
        case 7: baseClass += ' text-black'; break;
        case 8: baseClass += ' text-gray-500'; break;
      }
    }
    
    return baseClass;
  };

  // Obtener contenido de celda
  const getCellContent = (cell: Cell) => {
    if (cell.isFlagged) return '🚩';
    if (!cell.isRevealed) return '';
    if (cell.isMine) return '💣';
    return cell.neighborMines > 0 ? cell.neighborMines.toString() : '';
  };

  if (showInstructions) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl mb-4">💣 Buscaminas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Cómo jugar:</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• Clic izquierdo para revelar una celda</p>
                <p>• Clic derecho para colocar/quitar una bandera 🚩</p>
                <p>• Los números indican cuántas minas hay alrededor</p>
                <p>• Encuentra todas las minas sin explotar ninguna</p>
                <p>• Tienes {MINE_COUNT} minas que encontrar</p>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button onClick={startGame} className="bg-game-minesweeper hover:bg-game-minesweeper/90">
                <Play className="mr-2 h-4 w-4" />
                Comenzar
              </Button>
              <Button variant="outline" onClick={onBackToMenu}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Menú Principal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-background to-muted">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={onBackToMenu}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Menú
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold">💣 Buscaminas</h1>
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4" />
                <span>{flagsUsed}/{MINE_COUNT}</span>
              </div>
            </div>
          </div>
          
          <Button onClick={resetGame} variant="outline">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Game Board */}
        <Card className="w-fit mx-auto">
          <CardContent className="p-4">
            <div className="grid gap-0 border-2 border-border" style={{
              gridTemplateColumns: `repeat(${COLS}, 1fr)`
            }}>
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={getCellClass(cell)}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onContextMenu={(e) => handleRightClick(e, rowIndex, colIndex)}
                  >
                    {getCellContent(cell)}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Game Over/Win */}
        {(gameState === 'lost' || gameState === 'won') && (
          <Card className="mt-6 max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">
                {gameState === 'won' ? '¡Felicidades! 🎉' : '¡Game Over! 💥'}
              </h2>
              <p className="text-lg mb-4">
                {gameState === 'won' 
                  ? 'Has encontrado todas las minas'
                  : 'Has pisado una mina'
                }
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={startGame} className="bg-game-minesweeper hover:bg-game-minesweeper/90">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Jugar de nuevo
                </Button>
                <Button variant="outline" onClick={onBackToMenu}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Menú Principal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls info */}
        {gameState === 'playing' && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Clic izquierdo: revelar • Clic derecho: bandera</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinesweeperGame;