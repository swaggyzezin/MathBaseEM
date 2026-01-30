import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

const GAMES_STORAGE_KEY = "@mathbase:games_stats";

export interface GameStats {
  highScore: number;
  bestStreak: number;
  totalGames: number;
  totalCorrect: number;
  totalWrong: number;
  totalScore: number;
  bestTime?: number;
  lastPlayed?: string;
}

export interface AllGamesStats {
  quiz: GameStats;
  multipleChoice: GameStats;
  complete: GameStats;
  sequence: GameStats;
  memory: GameStats;
  timeAttack: GameStats;
  lessonChallenge: GameStats;
}

const defaultStats: GameStats = {
  highScore: 0,
  bestStreak: 0,
  totalGames: 0,
  totalCorrect: 0,
  totalWrong: 0,
  totalScore: 0,
};

const defaultAllStats: AllGamesStats = {
  quiz: { ...defaultStats },
  multipleChoice: { ...defaultStats },
  complete: { ...defaultStats },
  sequence: { ...defaultStats },
  memory: { ...defaultStats, bestTime: undefined },
  timeAttack: { ...defaultStats },
  lessonChallenge: { ...defaultStats },
};

interface GamesContextType {
  stats: AllGamesStats;
  updateGameStats: (
    gameId: keyof AllGamesStats,
    score: number,
    correct: number,
    wrong: number,
    streak: number,
    time?: number,
  ) => void;
  getGameStats: (gameId: keyof AllGamesStats) => GameStats;
  resetAllStats: () => void;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

export function GamesProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<AllGamesStats>(defaultAllStats);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const stored = await AsyncStorage.getItem(GAMES_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setStats({ ...defaultAllStats, ...parsed });
        }
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadStats();
  }, []);

  // Salvar stats no AsyncStorage
  const saveStats = useCallback(async (newStats: AllGamesStats) => {
    try {
      await AsyncStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(newStats));
    } catch (error) {
      console.error("Erro ao salvar estatísticas:", error);
    }
  }, []);

  const updateGameStats = useCallback(
    (
      gameId: keyof AllGamesStats,
      score: number,
      correct: number,
      wrong: number,
      streak: number,
      time?: number,
    ) => {
      setStats((prev) => {
        const currentGame = prev[gameId];
        const newGameStats: GameStats = {
          highScore: Math.max(currentGame.highScore, score),
          bestStreak: Math.max(currentGame.bestStreak, streak),
          totalGames: currentGame.totalGames + 1,
          totalCorrect: currentGame.totalCorrect + correct,
          totalWrong: currentGame.totalWrong + wrong,
          totalScore: (currentGame.totalScore || 0) + score,
          lastPlayed: new Date().toISOString(),
        };

        if (time !== undefined) {
          if (
            currentGame.bestTime === undefined ||
            time < currentGame.bestTime
          ) {
            newGameStats.bestTime = time;
          } else {
            newGameStats.bestTime = currentGame.bestTime;
          }
        }

        const newStats = {
          ...prev,
          [gameId]: newGameStats,
        };

        saveStats(newStats);
        return newStats;
      });
    },
    [saveStats],
  );

  const getGameStats = useCallback(
    (gameId: keyof AllGamesStats): GameStats => {
      return stats[gameId];
    },
    [stats],
  );

  const resetAllStats = useCallback(async () => {
    setStats(defaultAllStats);
    await AsyncStorage.removeItem(GAMES_STORAGE_KEY);
  }, []);

  if (!isLoaded) {
    return null;
  }

  return (
    <GamesContext.Provider
      value={{ stats, updateGameStats, getGameStats, resetAllStats }}
    >
      {children}
    </GamesContext.Provider>
  );
}

export function useGamesStats() {
  const context = useContext(GamesContext);
  if (!context) {
    throw new Error("useGamesStats deve ser usado dentro de GamesProvider");
  }
  return context;
}
