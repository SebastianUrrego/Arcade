import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';

interface FlappyBirdGameProps {
  onBackToMenu: () => void;
}

interface Bird {
  y: number;
  velocity: number;
}

interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BIRD_SIZE = 30;
const PIPE_WIDTH = 80;
const PIPE_GAP = 200;
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const PIPE_SPEED = 3;

const FlappyBirdGame = ({ onBackToMenu }: FlappyBirdGameProps) => {
  const [bird, setBird] = useState<Bird>({ y: CANVAS_HEIGHT / 2, velocity: 0 });
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'gameOver'>('waiting');
  const [showInstructions, setShowInstructions] = useState(true);
  
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generar nuevos tubos
  const generatePipe = useCallback((): Pipe => {
    const gapY = Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50;
    return {
      x: CANVAS_WIDTH,
      gapY,
      passed: false
    };
  }, []);

  // Verificar colisiones
  const checkCollisions = useCallback((currentBird: Bird, currentPipes: Pipe[]): boolean => {
    // Colisión con el suelo o techo
    if (currentBird.y < 0 || currentBird.y + BIRD_SIZE > CANVAS_HEIGHT) {
      return true;
    }

    // Colisión con tubos
    for (const pipe of currentPipes) {
      if (
        pipe.x < BIRD_SIZE + 50 && // Posición X del pájaro
        pipe.x + PIPE_WIDTH > 50 &&
        (currentBird.y < pipe.gapY || currentBird.y + BIRD_SIZE > pipe.gapY + PIPE_GAP)
      ) {
        return true;
      }
    }

    return false;
  }, []);

  // Saltar
  const jump = useCallback(() => {
    if (gameState === 'playing') {
      setBird(prev => ({ ...prev, velocity: JUMP_FORCE }));
    }
  }, [gameState]);

  // Game loop
  const gameLoop = useCallback(() => {
    setBird(prevBird => {
      const newBird = {
        y: prevBird.y + prevBird.velocity,
        velocity: prevBird.velocity + GRAVITY
      };

      setPipes(prevPipes => {
        let newPipes = prevPipes.map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }));
        
        // Remover tubos que salieron de pantalla
        newPipes = newPipes.filter(pipe => pipe.x + PIPE_WIDTH > 0);
        
        // Agregar nuevos tubos
        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < CANVAS_WIDTH - 200) {
          newPipes.push(generatePipe());
        }
        
        // Verificar puntuación
        newPipes.forEach(pipe => {
          if (!pipe.passed && pipe.x + PIPE_WIDTH < 50) {
            pipe.passed = true;
            setScore(prev => prev + 1);
          }
        });

        // Verificar colisiones
        if (checkCollisions(newBird, newPipes)) {
          setGameState('gameOver');
        }

        return newPipes;
      });

      return newBird;
    });
  }, [generatePipe, checkCollisions]);

  // Efectos del game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(gameLoop, 1000 / 60); // 60 FPS
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
  }, [gameState, gameLoop]);

  // Controles
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    const handleClick = () => {
      jump();
    };

    window.addEventListener('keydown', handleKeyPress);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('click', handleClick);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (canvas) {
        canvas.removeEventListener('click', handleClick);
      }
    };
  }, [jump]);

  // Renderizado del canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.fillStyle = '#87CEEB'; // Color del cielo
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Dibujar tubos
    ctx.fillStyle = '#228B22'; // Verde para los tubos
    pipes.forEach(pipe => {
      // Tubo superior
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
      // Tubo inferior
      ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - (pipe.gapY + PIPE_GAP));
      
      // Bordes de los tubos
      ctx.strokeStyle = '#006400';
      ctx.lineWidth = 3;
      ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
      ctx.strokeRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - (pipe.gapY + PIPE_GAP));
    });

    // Dibujar pájaro
    ctx.fillStyle = '#FFD700'; // Amarillo para el pájaro
    ctx.fillRect(50 - BIRD_SIZE/2, bird.y, BIRD_SIZE, BIRD_SIZE);
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;
    ctx.strokeRect(50 - BIRD_SIZE/2, bird.y, BIRD_SIZE, BIRD_SIZE);

    // Dibujar ojos del pájaro
    ctx.fillStyle = '#000';
    ctx.fillRect(50 - BIRD_SIZE/2 + 5, bird.y + 5, 6, 6);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(50 - BIRD_SIZE/2 + 7, bird.y + 6, 3, 3);
  }, [bird, pipes]);

  const startGame = () => {
    setBird({ y: CANVAS_HEIGHT / 2, velocity: 0 });
    setPipes([generatePipe()]);
    setScore(0);
    setGameState('playing');
    setShowInstructions(false);
  };

  const resetGame = () => {
    setGameState('waiting');
    setShowInstructions(true);
    setBird({ y: CANVAS_HEIGHT / 2, velocity: 0 });
    setPipes([]);
    setScore(0);
  };

  if (showInstructions) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl mb-4">🐤 Flappy Bird</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Cómo jugar:</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• Haz clic o presiona ESPACIO para volar</p>
                <p>• Pasa entre los tubos sin chocar</p>
                <p>• Cada tubo que pases suma 1 punto</p>
                <p>• El pájaro cae por la gravedad constantemente</p>
                <p>• ¡Intenta conseguir la puntuación más alta!</p>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button onClick={startGame} className="bg-game-flappy hover:bg-game-flappy/90">
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
            <h1 className="text-3xl font-bold">🐤 Flappy Bird</h1>
            <p className="text-xl font-semibold">Puntuación: {score}</p>
          </div>
          
          <Button onClick={resetGame} variant="outline">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Game Canvas */}
        <Card className="w-fit mx-auto">
          <CardContent className="p-4">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border-2 border-border rounded-lg cursor-pointer"
              style={{ display: 'block' }}
            />
          </CardContent>
        </Card>

        {/* Game Over */}
        {gameState === 'gameOver' && (
          <Card className="mt-6 max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">¡Game Over! 💥</h2>
              <p className="text-lg mb-4">Puntuación final: {score}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={startGame} className="bg-game-flappy hover:bg-game-flappy/90">
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
            <p>Haz clic en el área de juego o presiona ESPACIO para volar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlappyBirdGame;