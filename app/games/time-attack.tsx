import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
  Alert,
  BackHandler,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useGamesStats } from "@/contexts/games-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

type Operation = "+" | "-" | "×" | "÷";

function generateQuestion(currentScore: number = 0): {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
  options: number[];
} {
  const operations: Operation[] = ["+", "-", "×", "÷"];
  const operation = operations[Math.floor(Math.random() * operations.length)];

  let num1: number, num2: number, answer: number;
  const level = Math.floor(currentScore / 10);

  switch (operation) {
    case "+":
      if (level === 0) {
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
      } else if (level === 1) {
        num1 = Math.floor(Math.random() * 50) + 20;
        num2 = Math.floor(Math.random() * 50) + 20;
      } else if (level === 2) {
        num1 = Math.floor(Math.random() * 100) + 50;
        num2 = Math.floor(Math.random() * 100) + 50;
      } else {
        num1 = Math.floor(Math.random() * 200) + 100;
        num2 = Math.floor(Math.random() * 200) + 100;
      }
      answer = num1 + num2;
      break;
    case "-":
      if (level === 0) {
        num1 = Math.floor(Math.random() * 25) + 10;
        num2 = Math.floor(Math.random() * num1) + 1;
      } else if (level === 1) {
        num1 = Math.floor(Math.random() * 80) + 30;
        num2 = Math.floor(Math.random() * num1) + 1;
      } else if (level === 2) {
        num1 = Math.floor(Math.random() * 150) + 50;
        num2 = Math.floor(Math.random() * num1) + 1;
      } else {
        num1 = Math.floor(Math.random() * 300) + 100;
        num2 = Math.floor(Math.random() * num1) + 1;
      }
      answer = num1 - num2;
      break;
    case "×":
      if (level === 0) {
        num1 = Math.floor(Math.random() * 10) + 2;
        num2 = Math.floor(Math.random() * 10) + 2;
      } else if (level === 1) {
        num1 = Math.floor(Math.random() * 12) + 3;
        num2 = Math.floor(Math.random() * 12) + 3;
      } else if (level === 2) {
        num1 = Math.floor(Math.random() * 15) + 5;
        num2 = Math.floor(Math.random() * 12) + 3;
      } else {
        num1 = Math.floor(Math.random() * 20) + 10;
        num2 = Math.floor(Math.random() * 15) + 5;
      }
      answer = num1 * num2;
      break;
    case "÷":
      if (level === 0) {
        num2 = Math.floor(Math.random() * 9) + 2;
        answer = Math.floor(Math.random() * 10) + 2;
      } else if (level === 1) {
        num2 = Math.floor(Math.random() * 12) + 2;
        answer = Math.floor(Math.random() * 12) + 3;
      } else if (level === 2) {
        num2 = Math.floor(Math.random() * 15) + 3;
        answer = Math.floor(Math.random() * 15) + 5;
      } else {
        num2 = Math.floor(Math.random() * 20) + 5;
        answer = Math.floor(Math.random() * 20) + 10;
      }
      num1 = num2 * answer;
      break;
    default:
      num1 = 1;
      num2 = 1;
      answer = 2;
  }

  const wrongOptions = new Set<number>();
  const offsetRange = Math.max(5, Math.floor(answer * 0.15));
  while (wrongOptions.size < 3) {
    const offset = Math.floor(Math.random() * offsetRange * 2) - offsetRange;
    const wrong = answer + (offset === 0 ? 1 : offset);
    if (wrong !== answer && wrong >= 0) {
      wrongOptions.add(wrong);
    }
  }

  const options = [...wrongOptions, answer].sort(() => Math.random() - 0.5);

  return { num1, num2, operation, answer, options };
}

export default function TimeAttackGame() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { updateGameStats, getGameStats } = useGamesStats();
  const currentStats = getGameStats("timeAttack");

  const GAME_DURATION = 60;

  const [question, setQuestion] = useState(generateQuestion());
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [statsSaved, setStatsSaved] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  const gameColor = "#EF4444";

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
            if (!statsSaved && (score > 0 || correct > 0 || wrong > 0)) {
              updateGameStats("timeAttack", score, correct, wrong, maxCombo);
              setStatsSaved(true);
            }
            router.back();
          },
        },
      ],
    );
  }, [
    score,
    correct,
    wrong,
    maxCombo,
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
      updateGameStats("timeAttack", score, correct, wrong, maxCombo);
      setStatsSaved(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver, statsSaved]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (gameStarted && !gameOver && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setGameOver(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [gameStarted, gameOver, timeLeft]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: timeLeft / GAME_DURATION,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, progressAnim]);

  const pulse = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim]);

  const handleAnswer = useCallback(
    (answer: number) => {
      if (!gameStarted) setGameStarted(true);
      if (selectedAnswer !== null || gameOver) return;

      setSelectedAnswer(answer);
      const isCorrect = answer === question.answer;

      if (isCorrect) {
        const comboBonus = Math.floor(combo / 3);
        const points = 10 + comboBonus * 5;
        setScore((s) => s + points);
        setCorrect((c) => c + 1);
        setCombo((c) => {
          const newCombo = c + 1;
          if (newCombo > maxCombo) setMaxCombo(newCombo);
          return newCombo;
        });
        setTimeLeft((t) => Math.min(t + 2, GAME_DURATION));
        pulse();
      } else {
        setWrong((w) => w + 1);
        setCombo(0);
      }

      setTimeout(() => {
        setSelectedAnswer(null);
        setQuestion(generateQuestion(score));
      }, 400);
    },
    [
      gameStarted,
      selectedAnswer,
      gameOver,
      question.answer,
      combo,
      maxCombo,
      score,
      pulse,
    ],
  );

  const startGame = () => {
    setScore(0);
    setCorrect(0);
    setWrong(0);
    setTimeLeft(GAME_DURATION);
    setGameStarted(true);
    setGameOver(false);
    setSelectedAnswer(null);
    setCombo(0);
    setMaxCombo(0);
    setStatsSaved(false);
    setQuestion(generateQuestion());
  };

  const getOptionStyle = (option: number) => {
    if (selectedAnswer === null) {
      return {
        backgroundColor: colors.background,
        borderColor: colors.icon + "50",
      };
    }
    if (option === question.answer) {
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

  const getProgressColor = () => {
    const ratio = timeLeft / GAME_DURATION;
    if (ratio > 0.5) return "#22C55E";
    if (ratio > 0.25) return "#F59E0B";
    return "#EF4444";
  };

  if (!gameStarted && !gameOver) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Contra o Tempo",
            headerTintColor: gameColor,
            headerStyle: { backgroundColor: colors.background },
            headerTitleStyle: { color: colors.text },
          }}
        />
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <View style={styles.startContainer}>
            <MaterialIcons name="timer" size={100} color={gameColor} />
            <Text style={[styles.startTitle, { color: colors.text }]}>
              Contra o Tempo
            </Text>
            <Text style={[styles.startDescription, { color: colors.icon }]}>
              Responda o máximo de perguntas em 60 segundos!
            </Text>
            <Text style={[styles.startTip, { color: colors.icon }]}>
              💡 Acertos dão +2 segundos de bônus{"\n"}
              🔥 Sequências corretas multiplicam pontos
            </Text>

            <Pressable
              style={[styles.startButton, { backgroundColor: gameColor }]}
              onPress={startGame}
            >
              <MaterialIcons name="play-arrow" size={32} color="#fff" />
              <Text style={styles.startButtonText}>Começar!</Text>
            </Pressable>
          </View>
        </View>
      </>
    );
  }

  if (gameOver) {
    const accuracy =
      correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;
    const isNewRecord = score > (currentStats?.highScore ?? 0);

    return (
      <>
        <Stack.Screen
          options={{
            title: "Contra o Tempo",
            headerTintColor: gameColor,
            headerStyle: { backgroundColor: colors.background },
            headerTitleStyle: { color: colors.text },
          }}
        />
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <View style={styles.gameOverContainer}>
            <MaterialIcons name="sports-score" size={80} color={gameColor} />
            <Text style={[styles.gameOverTitle, { color: colors.text }]}>
              Tempo Esgotado!
            </Text>

            {isNewRecord && (
              <View style={styles.newRecordBadge}>
                <MaterialIcons name="emoji-events" size={24} color="#F59E0B" />
                <Text style={styles.newRecordText}>Novo Recorde!</Text>
              </View>
            )}

            <Text style={[styles.gameOverScore, { color: gameColor }]}>
              {score} pontos
            </Text>
            <Text style={[styles.recordText, { color: colors.icon }]}>
              Recorde: {currentStats?.highScore ?? 0} pts
            </Text>

            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: "#22C55E20" }]}>
                <MaterialIcons name="check" size={24} color="#22C55E" />
                <Text style={[styles.statCardValue, { color: "#22C55E" }]}>
                  {correct}
                </Text>
                <Text style={[styles.statCardLabel, { color: colors.icon }]}>
                  Acertos
                </Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: "#EF444420" }]}>
                <MaterialIcons name="close" size={24} color="#EF4444" />
                <Text style={[styles.statCardValue, { color: "#EF4444" }]}>
                  {wrong}
                </Text>
                <Text style={[styles.statCardLabel, { color: colors.icon }]}>
                  Erros
                </Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: "#3B82F620" }]}>
                <MaterialIcons name="percent" size={24} color="#3B82F6" />
                <Text style={[styles.statCardValue, { color: "#3B82F6" }]}>
                  {accuracy}%
                </Text>
                <Text style={[styles.statCardLabel, { color: colors.icon }]}>
                  Precisão
                </Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: "#F59E0B20" }]}>
                <MaterialIcons
                  name="local-fire-department"
                  size={24}
                  color="#F59E0B"
                />
                <Text style={[styles.statCardValue, { color: "#F59E0B" }]}>
                  {maxCombo}
                </Text>
                <Text style={[styles.statCardLabel, { color: colors.icon }]}>
                  Max Combo
                </Text>
              </View>
            </View>

            <Pressable
              style={[styles.restartButton, { backgroundColor: gameColor }]}
              onPress={startGame}
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
          title: "Contra o Tempo",
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
        <View
          style={[
            styles.timerBarContainer,
            { backgroundColor: colors.icon + "20" },
          ]}
        >
          <Animated.View
            style={[
              styles.timerBar,
              {
                backgroundColor: getProgressColor(),
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <MaterialIcons name="timer" size={24} color={getProgressColor()} />
            <Text style={[styles.timerText, { color: getProgressColor() }]}>
              {timeLeft}s
            </Text>
          </View>
          <View style={styles.statBox}>
            <MaterialIcons name="stars" size={24} color="#F59E0B" />
            <Text style={[styles.scoreText, { color: colors.text }]}>
              {score}
            </Text>
          </View>
          {combo >= 2 && (
            <View style={styles.comboBox}>
              <MaterialIcons
                name="local-fire-department"
                size={20}
                color="#F59E0B"
              />
              <Text style={styles.comboText}>{combo}x</Text>
            </View>
          )}
        </View>

        <Animated.View
          style={[
            styles.questionContainer,
            {
              backgroundColor: gameColor + "10",
              borderColor: gameColor,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={[styles.questionText, { color: colors.text }]}>
            {question.num1} {question.operation} {question.num2} = ?
          </Text>
        </Animated.View>

        <View style={styles.optionsGrid}>
          {question.options.map((option, index) => (
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
                      selectedAnswer !== null && option === question.answer
                        ? "#22C55E"
                        : selectedAnswer === option &&
                            option !== question.answer
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

        <View style={styles.counterRow}>
          <View style={styles.counterItem}>
            <MaterialIcons name="check-circle" size={18} color="#22C55E" />
            <Text style={[styles.counterText, { color: colors.icon }]}>
              {correct}
            </Text>
          </View>
          <View style={styles.counterItem}>
            <MaterialIcons name="cancel" size={18} color="#EF4444" />
            <Text style={[styles.counterText, { color: colors.icon }]}>
              {wrong}
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  } as const,
  timerBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 20,
    overflow: "hidden" as const,
  },
  timerBar: {
    height: "100%",
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 30,
  },
  statBox: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  timerText: {
    fontSize: 28,
    fontWeight: "bold" as const,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: "bold" as const,
  },
  comboBox: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    backgroundColor: "#F59E0B20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  comboText: {
    color: "#F59E0B",
    fontSize: 16,
    fontWeight: "bold" as const,
  },
  questionContainer: {
    padding: 32,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: "center" as const,
    marginBottom: 32,
  },
  questionText: {
    fontSize: 40,
    fontWeight: "bold" as const,
  },
  optionsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
    justifyContent: "center" as const,
  },
  optionButton: {
    width: "47%",
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center" as const,
  },
  optionText: {
    fontSize: 28,
    fontWeight: "bold" as const,
  },
  counterRow: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    gap: 32,
    marginTop: 24,
  },
  counterItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  counterText: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  startContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 20,
  },
  startTitle: {
    fontSize: 32,
    fontWeight: "bold" as const,
    marginTop: 20,
  },
  startDescription: {
    fontSize: 18,
    textAlign: "center" as const,
    marginTop: 12,
  },
  startTip: {
    fontSize: 14,
    textAlign: "center" as const,
    marginTop: 20,
    lineHeight: 22,
  },
  startButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 20,
    marginTop: 40,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold" as const,
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 20,
  },
  gameOverTitle: {
    fontSize: 28,
    fontWeight: "bold" as const,
    marginTop: 20,
  },
  newRecordBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  newRecordText: {
    color: "#D97706",
    fontWeight: "bold" as const,
    fontSize: 16,
  },
  gameOverScore: {
    fontSize: 48,
    fontWeight: "bold" as const,
    marginTop: 10,
  },
  recordText: {
    fontSize: 16,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
    justifyContent: "center" as const,
    marginTop: 24,
    marginBottom: 24,
  },
  statCard: {
    width: "45%",
    padding: 16,
    borderRadius: 16,
    alignItems: "center" as const,
    gap: 4,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: "bold" as const,
  },
  statCardLabel: {
    fontSize: 12,
  },
  restartButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  restartButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600" as const,
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
