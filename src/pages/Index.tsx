import { useState } from 'react';
import MainMenu from '../components/MainMenu';
import SnakeGame from '../components/SnakeGame';
import MinesweeperGame from '../components/MinesweeperGame';
import FlappyBirdGame from '../components/FlappyBirdGame';

type GameType = 'menu' | 'snake' | 'minesweeper' | 'flappy';

const Index = () => {
  const [currentGame, setCurrentGame] = useState<GameType>('menu');

  const handleGameSelect = (game: GameType) => {
    setCurrentGame(game);
  };

  const handleBackToMenu = () => {
    setCurrentGame('menu');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {currentGame === 'menu' && (
        <MainMenu onGameSelect={handleGameSelect} />
      )}
      
      {currentGame === 'snake' && (
        <SnakeGame onBackToMenu={handleBackToMenu} />
      )}
      
      {currentGame === 'minesweeper' && (
        <MinesweeperGame onBackToMenu={handleBackToMenu} />
      )}
      
      {currentGame === 'flappy' && (
        <FlappyBirdGame onBackToMenu={handleBackToMenu} />
      )}
    </div>
  );
};

export default Index;
