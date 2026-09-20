import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MainMenuProps {
  onGameSelect: (game: 'snake' | 'minesweeper' | 'flappy') => void;
}

const MainMenu = ({ onGameSelect }: MainMenuProps) => {
  const games = [
    {
      id: 'snake' as const,
      name: 'Snake',
      emoji: '🐍',
      description: 'Come y crece sin chocar contigo mismo',
      color: 'bg-game-snake',
    },
    {
      id: 'minesweeper' as const,
      name: 'Buscaminas',
      emoji: '💣',
      description: 'Encuentra todas las minas sin explotar ninguna',
      color: 'bg-game-minesweeper',
    },
    {
      id: 'flappy' as const,
      name: 'Flappy Bird',
      emoji: '🐤',
      description: 'Vuela entre los obstáculos sin chocar',
      color: 'bg-game-flappy',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          🎮 Juegos Clásicos
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Disfruta de tres juegos clásicos reimaginados con un diseño moderno. 
          Elige tu favorito y comienza a jugar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
        {games.map((game) => (
          <Card key={game.id} className="group hover:scale-105 transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden">
            <CardContent className="p-6">
              <div className={`w-full h-32 ${game.color} rounded-lg mb-6 flex items-center justify-center text-6xl shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                {game.emoji}
              </div>
              
              <h3 className="text-2xl font-bold mb-3 text-center">
                {game.name}
              </h3>
              
              <p className="text-muted-foreground text-center mb-6 min-h-[3rem]">
                {game.description}
              </p>
              
              <Button 
                onClick={() => onGameSelect(game.id)}
                className="w-full text-lg py-6 bg-primary hover:bg-primary/90 transform hover:scale-105 transition-all duration-200"
              >
                Jugar Ahora
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          Usa las teclas de dirección o toca la pantalla para controlar los juegos
        </p>
      </div>
    </div>
  );
};

export default MainMenu;