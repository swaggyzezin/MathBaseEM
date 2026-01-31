import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
  ScrollView,
  Alert,
  BackHandler,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useGamesStats } from "@/contexts/games-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

type SequenceType =
  | "arithmetic"
  | "multiply"
  | "squares"
  | "fibonacci"
  | "primes"
  | "cubes";

interface Sequence {
  numbers: number[];
  hiddenIndex: number;
  answer: number;
  options: number[];
  type: SequenceType;
  hint: string;
}

function generateSequence(difficulty: number): Sequence {
  const types: SequenceType[] = ["arithmetic", "multiply"];
  if (difficulty >= 2) types.push("squares");
  if (difficulty >= 3) types.push("fibonacci");
  if (difficulty >= 4) types.push("primes");
  if (difficulty >= 5) types.push("cubes");

  const type = types[Math.floor(Math.random() * types.length)];
  const level = Math.floor(difficulty / 2);
  let numbers: number[] = [];
  let hint = "";

  switch (type) {
    case "arithmetic": {
      const start =
        level === 0
          ? Math.floor(Math.random() * 10) + 1
          : level === 1
            ? Math.floor(Math.random() * 30) + 10
            : Math.floor(Math.random() * 50) + 20;
      const diff =
        level === 0
          ? Math.floor(Math.random() * 5) + 2
          : level === 1
            ? Math.floor(Math.random() * 10) + 5
            : Math.floor(Math.random() * 20) + 10;
      numbers = Array.from({ length: 6 }, (_, i) => start + diff * i);
      hint = `+${diff}`;
      break;
    }
    case "multiply": {
      const start = Math.floor(Math.random() * 3) + 1;
      const mult =
        level === 0
          ? Math.floor(Math.random() * 2) + 2
          : Math.floor(Math.random() * 3) + 2;
      numbers = Array.from({ length: 6 }, (_, i) => start * Math.pow(mult, i));
      hint = `×${mult}`;
      break;
    }
    case "squares": {
      const offset = Math.floor(Math.random() * 5) + level;
      numbers = Array.from({ length: 6 }, (_, i) =>
        Math.pow(i + 1 + offset, 2),
      );
      hint = "n²";
      break;
    }
    case "fibonacci": {
      const mult = Math.floor(Math.random() * (level + 1)) + 1;
      numbers = [1, 1, 2, 3, 5, 8].map((n) => n * mult);
      hint = "a + b = c";
      break;
    }
    case "primes": {
      const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
      const startIdx = Math.floor(Math.random() * 6);
      numbers = primes.slice(startIdx, startIdx + 6);
      hint = "Primos";
      break;
    }
    case "cubes": {
      const offset = Math.floor(Math.random() * 3);
      numbers = Array.from({ length: 6 }, (_, i) =>
        Math.pow(i + 1 + offset, 3),
      );
      hint = "n³";
      break;
    }
  }

  const hiddenIndex = Math.floor(Math.random() * 4) + 1;
  const answer = numbers[hiddenIndex];

  const wrongOptions = new Set<number>();
  const offsetRange = Math.max(5, Math.floor(answer * 0.15));
  while (wrongOptions.size < 3) {
    const offset = Math.floor(Math.random() * offsetRange * 2) - offsetRange;
    const wrong =
      answer + (offset === 0 ? (Math.random() > 0.5 ? 1 : -1) : offset);
    if (wrong !== answer && wrong > 0 && !numbers.includes(wrong)) {
      wrongOptions.add(wrong);
    }
  }

  const options = [...wrongOptions, answer].sort(() => Math.random() - 0.5);

  return { numbers, hiddenIndex, answer, options, type, hint };
}

export default function SequenceGame() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { updateGameStats, getGameStats } = useGamesStats();
  const currentStats = getGameStats("sequence");

  const [sequence, setSequence] = useState(generateSequence(0));
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [lives, setLives] = useState(3);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [statsSaved, setStatsSaved] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const difficulty = Math.floor(score / 3);
  const gameColor = "#F59E0B";

  const confirmExit = useCallback(() => {
    if (gameOver) {
      router.back();
      return;
    }

    Alert.alert(
      "Sair do Jogo",
      score > 0
        ? `Você tem ${score} pontos. Deseja sair e salvar seu progresso?`
        : "Deseja realmente sair do jogo?",
      [
        { text: "Continuar Jogando", style: "cancel" },
        {
          text: "Sair e Salvar",
          onPress: () => {
            if (
              !statsSaved &&
              (score > 0 || correctCount > 0 || wrongCount > 0)
            ) {
              updateGameStats(
                "sequence",
                score,
                correctCount,
                wrongCount,
                bestStreak,
              );
              setStatsSaved(true);
            }
            router.back();
          },
        },
      ],
    );
  }, [
    score,
    correctCount,
    wrongCount,
    bestStreak,
    updateGameStats,
    router,
    gameOver,
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
    if (gameOver && !statsSaved) {
      updateGameStats("sequence", score, correctCount, wrongCount, bestStreak);
      setStatsSaved(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver, statsSaved]);

  const pulse = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAnswer = (answer: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    const isCorrect = answer === sequence.answer;

    if (isCorrect) {
      setScore((s) => s + 1);
      setCorrectCount((c) => c + 1);
      setStreak((s) => {
        const newStreak = s + 1;
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
        return newStreak;
      });
      pulse();
    } else {
      setWrongCount((w) => w + 1);
      setStreak(0);
      shake();

      if (lives <= 1) {
        setLives(0);
        setTimeout(() => setGameOver(true), 1200);
        return;
      }

      setLives((l) => l - 1);
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setShowHint(false);
      setSequence(generateSequence(difficulty));
    }, 1500);
  };

  const restartGame = () => {
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setLives(3);
    setGameOver(false);
    setStatsSaved(false);
    setSelectedAnswer(null);
    setShowHint(false);
    setSequence(generateSequence(0));
  };

  const getOptionStyle = (option: number) => {
    if (selectedAnswer === null) {
      return {
        backgroundColor: colors.background,
        borderColor: gameColor + "50",
      };
    }
    if (option === sequence.answer) {
      return { backgroundColor: "#22C55E20", borderColor: "#22C55E" };
    }
    if (option === selectedAnswer) {
      return { backgroundColor: "#EF444420", borderColor: "#EF4444" };
    }
    return {
      backgroundColor: colors.background,
      borderColor: colors.icon + "30",
    };
  };

  if (gameOver) {
    const isNewRecord = score > (currentStats?.highScore ?? 0);

    return (
      <>
        <Stack.Screen
          options={{
            title: "Sequência Numérica",
            headerTintColor: gameColor,
            headerStyle: { backgroundColor: colors.background },
            headerTitleStyle: { color: colors.text },
          }}
        />
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <View style={styles.gameOverContainer}>
            <MaterialIcons name="timeline" size={80} color={gameColor} />
            <Text style={[styles.gameOverTitle, { color: colors.text }]}>
              Fim de Jogo!
            </Text>

            {isNewRecord && (
              <View style={styles.newRecordBadge}>
                <MaterialIcons name="emoji-events" size={24} color="#F59E0B" />
                <Text style={styles.newRecordText}>Novo Recorde!</Text>
              </View>
            )}

            <Text style={[styles.gameOverScore, { color: gameColor }]}>
              Pontuação: {score}
            </Text>
            <Text style={[styles.gameOverText, { color: colors.icon }]}>
              Maior sequência: {bestStreak}
            </Text>
            <Text style={[styles.gameOverText, { color: colors.icon }]}>
              Recorde anterior: {currentStats?.highScore ?? 0}
            </Text>

            <Pressable
              style={[styles.restartButton, { backgroundColor: gameColor }]}
              onPress={restartGame}
            >
              <MaterialIcons name="refresh" size={24} color="#fff" />
              <Text style={styles.restartButtonText}>Jogar Novamente</Text>
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
          title: "Sequência Numérica",
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
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <MaterialIcons name="stars" size={20} color={gameColor} />
            <Text style={[styles.statText, { color: colors.text }]}>
              {score}
            </Text>
          </View>
          <View style={styles.statBox}>
            <MaterialIcons
              name="local-fire-department"
              size={20}
              color="#EF4444"
            />
            <Text style={[styles.statText, { color: colors.text }]}>
              {streak}
            </Text>
          </View>
          <View style={styles.livesBox}>
            {[...Array(3)].map((_, i) => (
              <MaterialIcons
                key={i}
                name="favorite"
                size={24}
                color={i < lives ? "#EF4444" : colors.icon + "30"}
              />
            ))}
          </View>
        </View>

        <Text style={[styles.instruction, { color: colors.icon }]}>
          Complete a sequência:
        </Text>

        <Animated.View
          style={[
            styles.sequenceContainer,
            { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.sequenceRow}>
              {sequence.numbers.map((num, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.numberBox,
                    {
                      backgroundColor:
                        index === sequence.hiddenIndex
                          ? selectedAnswer !== null
                            ? selectedAnswer === sequence.answer
                              ? "#22C55E20"
                              : "#EF444420"
                            : gameColor + "20"
                          : colors.background,
                      borderColor:
                        index === sequence.hiddenIndex
                          ? selectedAnswer !== null
                            ? selectedAnswer === sequence.answer
                              ? "#22C55E"
                              : "#EF4444"
                            : gameColor
                          : colors.icon + "30",
                      transform:
                        index === sequence.hiddenIndex
                          ? [{ scale: scaleAnim }]
                          : [],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.numberText,
                      {
                        color:
                          index === sequence.hiddenIndex
                            ? selectedAnswer !== null
                              ? selectedAnswer === sequence.answer
                                ? "#22C55E"
                                : "#EF4444"
                              : gameColor
                            : colors.text,
                      },
                    ]}
                  >
                    {index === sequence.hiddenIndex
                      ? selectedAnswer !== null
                        ? sequence.answer
                        : "?"
                      : num}
                  </Text>
                </Animated.View>
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        {showHint && (
          <View
            style={[
              styles.hintBox,
              { backgroundColor: gameColor + "20", borderColor: gameColor },
            ]}
          >
            <MaterialIcons name="lightbulb" size={20} color={gameColor} />
            <Text style={[styles.hintText, { color: gameColor }]}>
              {sequence.hint}
            </Text>
          </View>
        )}

        {!showHint && selectedAnswer === null && score >= 3 && (
          <Pressable
            style={[styles.hintButton, { borderColor: gameColor }]}
            onPress={() => {
              setScore((s) => s - 3);
              setShowHint(true);
            }}
          >
            <MaterialIcons
              name="lightbulb-outline"
              size={18}
              color={gameColor}
            />
            <Text style={[styles.hintButtonText, { color: gameColor }]}>
              Ver dica (-3 pts)
            </Text>
          </Pressable>
        )}

        <Text style={[styles.chooseLabel, { color: colors.icon }]}>
          Escolha o número que falta:
        </Text>

        <View style={styles.optionsGrid}>
          {sequence.options.map((option, index) => (
            <Pressable
              key={index}
              style={[styles.optionButton, getOptionStyle(option)]}
              onPress={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color:
                      selectedAnswer !== null && option === sequence.answer
                        ? "#22C55E"
                        : selectedAnswer === option &&
                            option !== sequence.answer
                          ? "#EF4444"
                          : colors.text,
                  },
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.levelText, { color: colors.icon }]}>
          Nível {difficulty + 1}
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  statBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  livesBox: {
    flexDirection: "row",
    gap: 4,
  },
  instruction: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  sequenceContainer: {
    marginBottom: 24,
  },
  sequenceRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  numberBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  hintBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  hintText: {
    fontSize: 14,
    fontWeight: "500",
  },
  hintButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "center",
    marginBottom: 24,
  },
  hintButtonText: {
    fontSize: 13,
  },
  chooseLabel: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    marginBottom: 20,
  },
  optionButton: {
    width: "45%",
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
  },
  optionText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  levelText: {
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30,
    fontSize: 14,
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
  },
  newRecordBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  newRecordText: {
    color: "#D97706",
    fontWeight: "bold",
    fontSize: 16,
  },
  gameOverScore: {
    fontSize: 48,
    fontWeight: "bold",
    marginTop: 10,
  },
  gameOverText: {
    fontSize: 18,
    marginTop: 8,
  },
  restartButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 40,
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
