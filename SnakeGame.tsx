import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';

interface SnakeGameProps {
  onBackToMenu: () => void;
}

interface Position {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }];
const INITIAL_FOOD: Position = { x: 15, y: 15 };

const SnakeGame = ({ onBackToMenu }: SnakeGameProps) => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const gameLoopRef = useRef<NodeJS.Timeout>();

  // Generar comida aleatoria
  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  // Verificar colisiones
  const checkCollision = useCallback((head: Position, currentSnake: Position[]): boolean => {
    // Colisión con paredes
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    
    // Colisión con cuerpo
    return currentSnake.some(segment => segment.x === head.x && segment.y === head.y);
  }, []);

  // Mover la serpiente
  const moveSnake = useCallback(() => {
    setSnake(currentSnake => {
      if (currentSnake.length === 0) return currentSnake;
      
      const head = { ...currentSnake[0] };
      
      switch (direction) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      if (checkCollision(head, currentSnake)) {
        setGameOver(true);
        setIsPlaying(false);
        return currentSnake;
      }

      const newSnake = [head, ...currentSnake];

      // Verificar si comió comida
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood(newSnake));
        return newSnake; // No quitar la cola, la serpiente crece
      }

      return newSnake.slice(0, -1); // Quitar la cola
    });
  }, [direction, food, checkCollision, generateFood]);

  // Game loop
  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, 150);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver, moveSnake]);

  // Controles de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setDirection(prev => prev !== 'DOWN' ? 'UP' : prev);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setDirection(prev => prev !== 'UP' ? 'DOWN' : prev);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setDirection(prev => prev !== 'RIGHT' ? 'LEFT' : prev);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setDirection(prev => prev !== 'LEFT' ? 'RIGHT' : prev);
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  const startGame = () => {
    setShowInstructions(false);
    setIsPlaying(true);
  };

  const pauseGame = () => {
    setIsPlaying(!isPlaying);
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection('RIGHT');
    setIsPlaying(false);
    setScore(0);
    setGameOver(false);
    setShowInstructions(true);
  };

  if (showInstructions) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl mb-4">🐍 Snake</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Cómo jugar:</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• Usa las flechas del teclado para mover la serpiente</p>
                <p>• Come la comida (🟨) para crecer y ganar puntos</p>
                <p>• No choques con las paredes o contigo mismo</p>
                <p>• Presiona ESPACIO para pausar el juego</p>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button onClick={startGame} className="bg-game-snake hover:bg-game-snake/90">
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
            <h1 className="text-3xl font-bold">🐍 Snake</h1>
            <p className="text-xl font-semibold">Puntuación: {score}</p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={pauseGame} variant="outline">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button onClick={resetGame} variant="outline">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Game Board */}
        <Card className="w-fit mx-auto">
          <CardContent className="p-4">
            <div className="grid gap-0 border-2 border-border" style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              width: '500px',
              height: '500px'
            }}>
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                const x = index % GRID_SIZE;
                const y = Math.floor(index / GRID_SIZE);
                
                const isSnakeHead = snake.length > 0 && snake[0].x === x && snake[0].y === y;
                const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
                const isFood = food.x === x && food.y === y;
                
                let cellClass = 'w-full h-full border border-border/20';
                
                if (isSnakeHead) {
                  cellClass += ' bg-game-snake';
                } else if (isSnakeBody) {
                  cellClass += ' bg-game-snake/70';
                } else if (isFood) {
                  cellClass += ' bg-game-minesweeper flex items-center justify-center text-xs';
                } else {
                  cellClass += ' bg-board-light';
                }
                
                return (
                  <div key={index} className={cellClass}>
                    {isFood && '🟨'}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Game Over */}
        {gameOver && (
          <Card className="mt-6 max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">¡Game Over!</h2>
              <p className="text-lg mb-4">Puntuación final: {score}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={resetGame} className="bg-game-snake hover:bg-game-snake/90">
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
        {!gameOver && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Usa las flechas para moverte • ESPACIO para pausar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnakeGame;