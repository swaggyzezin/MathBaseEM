import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  Alert,
  BackHandler,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useGamesStats } from "@/contexts/games-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface Card {
  id: number;
  value: string;
  numericValue: number;
  isFlipped: boolean;
  isMatched: boolean;
}

function generateCards(pairs: number, difficulty: number = 0): Card[] {
  const equations: { expr: string; value: number }[] = [];
  const level = Math.floor(difficulty / 2);

  while (equations.length < pairs) {
    let num1: number, num2: number;
    const ops = level >= 2 ? ["+", "-", "×", "÷"] : ["+", "-", "×"];
    const op = ops[Math.floor(Math.random() * ops.length)];

    if (level === 0) {
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
    } else if (level === 1) {
      num1 = Math.floor(Math.random() * 15) + 5;
      num2 = Math.floor(Math.random() * 15) + 5;
    } else {
      num1 = Math.floor(Math.random() * 20) + 10;
      num2 = Math.floor(Math.random() * 12) + 3;
    }

    let value: number;
    let expr: string;

    switch (op) {
      case "+":
        value = num1 + num2;
        expr = `${num1} + ${num2}`;
        break;
      case "-":
        value = Math.max(num1, num2) - Math.min(num1, num2);
        expr = `${Math.max(num1, num2)} - ${Math.min(num1, num2)}`;
        break;
      case "×":
        value = num1 * num2;
        expr = `${num1} × ${num2}`;
        break;
      case "÷":
        const divisor = Math.floor(Math.random() * 8) + 2;
        const quotient = Math.floor(Math.random() * 10) + 2;
        value = quotient;
        expr = `${divisor * quotient} ÷ ${divisor}`;
        break;
      default:
        value = num1 + num2;
        expr = `${num1} + ${num2}`;
    }

    if (!equations.some((e) => e.value === value)) {
      equations.push({ expr, value });
    }
  }

  const cards: Card[] = [];
  let id = 0;

  equations.forEach(({ expr, value }) => {
    cards.push({
      id: id++,
      value: expr,
      numericValue: value,
      isFlipped: false,
      isMatched: false,
    });
    cards.push({
      id: id++,
      value: String(value),
      numericValue: value,
      isFlipped: false,
      isMatched: false,
    });
  });

  return cards.sort(() => Math.random() - 0.5);
}

export default function MemoryGame() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const { updateGameStats, getGameStats } = useGamesStats();
  const currentStats = getGameStats("memory");

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [statsSaved, setStatsSaved] = useState(false);

  const flipAnims = useRef<Animated.Value[]>([]).current;
  const pairs = 6;

  const gameColor = "#EC4899";
  const cardWidth = (width - 60) / 3 - 8;

  const startNewGame = useCallback(
    (increaseDifficulty = false) => {
      const newDifficulty = increaseDifficulty ? difficulty + 1 : difficulty;
      if (increaseDifficulty) setDifficulty(newDifficulty);

      const newCards = generateCards(pairs, newDifficulty);
      setCards(newCards);
      setFlippedCards([]);
      setMoves(0);
      setMatches(0);
      setGameComplete(false);
      setTimer(0);
      setIsRunning(true);
      setIsChecking(false);
      setStatsSaved(false);

      flipAnims.length = 0;
      newCards.forEach(() => {
        flipAnims.push(new Animated.Value(0));
      });
    },
    [flipAnims, difficulty],
  );

  useEffect(() => {
    startNewGame(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && !gameComplete) {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, gameComplete]);

  const flipCard = (index: number) => {
    Animated.spring(flipAnims[index], {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 10,
    }).start();
  };

  const unflipCard = (index: number) => {
    Animated.spring(flipAnims[index], {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 10,
    }).start();
  };

  const handleCardPress = (index: number) => {
    if (isChecking) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (flippedCards.length >= 2) return;

    if (!isRunning) setIsRunning(true);

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    flipCard(index);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsChecking(true);
      setMoves((m) => m + 1);

      const [first, second] = newFlipped;
      const isMatch = cards[first].numericValue === cards[second].numericValue;

      setTimeout(() => {
        if (isMatch) {
          const matchedCards = [...cards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setMatches((m) => {
            const newMatches = m + 1;
            if (newMatches === pairs) {
              setGameComplete(true);
              setIsRunning(false);
            }
            return newMatches;
          });
        } else {
          const unflippedCards = [...cards];
          unflippedCards[first].isFlipped = false;
          unflippedCards[second].isFlipped = false;
          setCards(unflippedCards);
          unflipCard(first);
          unflipCard(second);
        }
        setFlippedCards([]);
        setIsChecking(false);
      }, 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStars = () => {
    const perfectMoves = pairs;
    const moveRatio = perfectMoves / moves;

    const idealTime = pairs * 3;
    const timeRatio = idealTime / Math.max(timer, 1);

    const avgRatio = (moveRatio + timeRatio) / 2;

    if (avgRatio >= 0.7) return 3;
    if (avgRatio >= 0.4) return 2;
    return 1;
  };

  const calculateScore = () => {
    const baseScore = 100;
    const movePenalty = Math.max(0, (moves - pairs) * 5);
    const timePenalty = Math.floor(timer / 10);
    return Math.max(10, baseScore - movePenalty - timePenalty);
  };

  const confirmExit = useCallback(() => {
    if (gameComplete) {
      router.back();
      return;
    }

    Alert.alert(
      "Sair do Jogo",
      moves > 0
        ? `Você já fez ${moves} jogadas. Deseja sair?`
        : "Deseja realmente sair do jogo?",
      [
        { text: "Continuar Jogando", style: "cancel" },
        {
          text: "Sair",
          onPress: () => {
            if (!statsSaved && moves > 0 && matches > 0) {
              const baseScore = 100;
              const movePenalty = Math.max(0, (moves - pairs) * 5);
              const timePenalty = Math.floor(timer / 10);
              const score = Math.max(10, baseScore - movePenalty - timePenalty);
              updateGameStats("memory", score, matches, moves - matches, 0);
              setStatsSaved(true);
            }
            router.back();
          },
        },
      ],
    );
  }, [
    moves,
    matches,
    timer,
    pairs,
    updateGameStats,
    router,
    gameComplete,
    statsSaved,
  ]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        confirmExit();
        return true;
      },
    );
    return () => backHandler.remove();
  }, [confirmExit]);

  useEffect(() => {
    if (gameComplete && !statsSaved) {
      const baseScore = 100;
      const movePenalty = Math.max(0, (moves - pairs) * 5);
      const timePenalty = Math.floor(timer / 10);
      const score = Math.max(10, baseScore - movePenalty - timePenalty);
      updateGameStats("memory", score, pairs, moves - pairs, 0);
      setStatsSaved(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameComplete, statsSaved]);

  if (gameComplete) {
    const stars = getStars();
    const score = calculateScore();
    const isNewRecord = score > (currentStats?.highScore ?? 0);

    return (
      <>
        <Stack.Screen
          options={{
            title: "Memória Matemática",
            headerTintColor: gameColor,
            headerStyle: { backgroundColor: colors.background },
            headerTitleStyle: { color: colors.text },
          }}
        />
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <View style={styles.gameOverContainer}>
            <MaterialIcons name="celebration" size={80} color={gameColor} />
            <Text style={[styles.gameOverTitle, { color: colors.text }]}>
              Parabéns!
            </Text>

            {isNewRecord && (
              <View style={styles.newRecordBadge}>
                <MaterialIcons name="emoji-events" size={24} color="#F59E0B" />
                <Text style={styles.newRecordText}>Novo Recorde!</Text>
              </View>
            )}

            <View style={styles.starsRow}>
              {[1, 2, 3].map((i) => (
                <MaterialIcons
                  key={i}
                  name="star"
                  size={48}
                  color={i <= stars ? "#F59E0B" : colors.icon + "30"}
                />
              ))}
            </View>

            <Text style={[styles.scoreText, { color: gameColor }]}>
              Pontuação: {score}
            </Text>

            <View style={styles.statsBox}>
              <View style={styles.statItem}>
                <MaterialIcons name="touch-app" size={24} color={gameColor} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {moves}
                </Text>
                <Text style={[styles.statLabel, { color: colors.icon }]}>
                  Jogadas
                </Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="timer" size={24} color={gameColor} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {formatTime(timer)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.icon }]}>
                  Tempo
                </Text>
              </View>
            </View>

            <Text style={[styles.gameOverText, { color: colors.icon }]}>
              Recorde: {currentStats?.highScore ?? 0} pts | Nível{" "}
              {difficulty + 1}
            </Text>

            <Pressable
              style={[styles.restartButton, { backgroundColor: gameColor }]}
              onPress={() => startNewGame(true)}
            >
              <MaterialIcons name="refresh" size={24} color="#fff" />
              <Text style={styles.restartButtonText}>Próximo Nível</Text>
            </Pressable>

            <Pressable
              style={[styles.backButton, { borderColor: colors.icon }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.backButtonText, { color: colors.text }]}>
                Voltar aos Jogos
              </Text>
            </Pressable>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Memória Matemática",
          headerTintColor: gameColor,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text },
          headerLeft: () => (
            <Pressable onPress={confirmExit} style={{ marginLeft: 8 }}>
              <MaterialIcons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <View style={styles.statBox}>
            <MaterialIcons name="touch-app" size={18} color={gameColor} />
            <Text style={[styles.headerText, { color: colors.text }]}>
              {moves}
            </Text>
          </View>
          <View style={styles.statBox}>
            <MaterialIcons name="timer" size={18} color={gameColor} />
            <Text style={[styles.headerText, { color: colors.text }]}>
              {formatTime(timer)}
            </Text>
          </View>
          <View style={styles.statBox}>
            <MaterialIcons name="check-circle" size={18} color="#22C55E" />
            <Text style={[styles.headerText, { color: colors.text }]}>
              {matches}/{pairs}
            </Text>
          </View>
        </View>

        <Text style={[styles.instruction, { color: colors.icon }]}>
          Encontre os pares: operação ↔ resultado
        </Text>

        <View style={styles.grid}>
          {cards.map((card, index) => {
            const frontInterpolate =
              flipAnims[index]?.interpolate({
                inputRange: [0, 1],
                outputRange: ["180deg", "360deg"],
              }) || "180deg";

            const backInterpolate =
              flipAnims[index]?.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "180deg"],
              }) || "0deg";

            return (
              <Pressable
                key={card.id}
                onPress={() => handleCardPress(index)}
                disabled={card.isFlipped || card.isMatched || isChecking}
              >
                <View
                  style={[
                    styles.cardContainer,
                    { width: cardWidth, height: cardWidth * 1.2 },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.card,
                      styles.cardFront,
                      {
                        width: cardWidth,
                        height: cardWidth * 1.2,
                        backgroundColor: card.isMatched
                          ? "#22C55E20"
                          : gameColor + "15",
                        borderColor: card.isMatched ? "#22C55E" : gameColor,
                        transform: [{ rotateY: frontInterpolate }],
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.cardText,
                        {
                          color: card.isMatched ? "#22C55E" : colors.text,
                          fontSize: card.value.length > 5 ? 14 : 18,
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {card.value}
                    </Text>
                  </Animated.View>

                  <Animated.View
                    style={[
                      styles.card,
                      styles.cardBack,
                      {
                        width: cardWidth,
                        height: cardWidth * 1.2,
                        backgroundColor: gameColor,
                        transform: [{ rotateY: backInterpolate }],
                      },
                    ]}
                  >
                    <MaterialIcons name="help-outline" size={32} color="#fff" />
                  </Animated.View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600",
  },
  instruction: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  cardContainer: {},
  card: {
    position: "absolute",
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
    padding: 8,
  },
  cardFront: {
    zIndex: 1,
  },
  cardBack: {
    zIndex: 0,
  },
  cardText: {
    fontWeight: "bold",
    textAlign: "center",
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 16,
  },
  newRecordBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  newRecordText: {
    color: "#D97706",
    fontWeight: "bold",
    fontSize: 16,
  },
  starsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  statsBox: {
    flexDirection: "row",
    gap: 40,
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
  },
  gameOverText: {
    fontSize: 16,
    marginBottom: 24,
  },
  restartButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  restartButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
  },
  backButtonText: {
    fontSize: 16,
  },
});
