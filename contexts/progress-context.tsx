import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

const PROGRESS_KEY = "@MathBase:progress";

type ProgressData = {
  [lessonId: string]: boolean;
};

type ProgressContextType = {
  progress: ProgressData;
  isLoading: boolean;
  markAsWatched: (lessonId: string) => Promise<void>;
  markAsUnwatched: (lessonId: string) => Promise<void>;
  toggleWatched: (lessonId: string) => Promise<void>;
  isWatched: (lessonId: string) => boolean;
  getModuleProgress: (lessonIds: string[]) => number;
  getWatchedCount: (lessonIds: string[]) => number;
  resetProgress: () => Promise<void>;
};

const ProgressContext = createContext<ProgressContextType | undefined>(
  undefined,
);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressData>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem(PROGRESS_KEY);
      if (stored) {
        setProgress(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Erro ao carregar progresso:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgress = async (newProgress: ProgressData) => {
    try {
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
    } catch (error) {
      console.error("Erro ao salvar progresso:", error);
    }
  };

  const markAsWatched = useCallback(async (lessonId: string) => {
    setProgress((prev) => {
      const newProgress = { ...prev, [lessonId]: true };
      saveProgress(newProgress);
      return newProgress;
    });
  }, []);

  const markAsUnwatched = useCallback(async (lessonId: string) => {
    setProgress((prev) => {
      const newProgress = { ...prev, [lessonId]: false };
      saveProgress(newProgress);
      return newProgress;
    });
  }, []);

  const toggleWatched = useCallback(async (lessonId: string) => {
    setProgress((prev) => {
      const isCurrentlyWatched = prev[lessonId] ?? false;
      const newProgress = { ...prev, [lessonId]: !isCurrentlyWatched };
      saveProgress(newProgress);
      return newProgress;
    });
  }, []);

  const isWatched = useCallback(
    (lessonId: string): boolean => {
      return progress[lessonId] ?? false;
    },
    [progress],
  );

  const getModuleProgress = useCallback(
    (lessonIds: string[]): number => {
      if (lessonIds.length === 0) return 0;
      const watchedCount = lessonIds.filter((id) => progress[id]).length;
      return Math.round((watchedCount / lessonIds.length) * 100);
    },
    [progress],
  );

  const getWatchedCount = useCallback(
    (lessonIds: string[]): number => {
      return lessonIds.filter((id) => progress[id]).length;
    },
    [progress],
  );

  const resetProgress = useCallback(async () => {
    setProgress({});
    await AsyncStorage.removeItem(PROGRESS_KEY);
  }, []);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        isLoading,
        markAsWatched,
        markAsUnwatched,
        toggleWatched,
        isWatched,
        getModuleProgress,
        getWatchedCount,
        resetProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error("useProgress deve ser usado dentro de um ProgressProvider");
  }
  return context;
}
