import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState, useCallback, useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
  Alert,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useGamesStats } from "@/contexts/games-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

type Operation = "+" | "-" | "×" | "÷";

function generateQuestion(difficulty: number): {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
  options: number[];
} {
  const operations: Operation[] = ["+", "-", "×", "÷"];
  const operation =
    operations[Math.floor(Math.random() * Math.min(difficulty + 1, 4))];

  let num1: number, num2: number, answer: number;
  const level = Math.floor(difficulty / 2);

  switch (operation) {
    case "+":
      if (level === 0) {
        num1 = Math.floor(Math.random() * 15) + 1;
        num2 = Math.floor(Math.random() * 15) + 1;
      } else if (level === 1) {
        num1 = Math.floor(Math.random() * 50) + 15;
        num2 = Math.floor(Math.random() * 50) + 15;
      } else if (level === 2) {
        num1 = Math.floor(Math.random() * 100) + 50;
        num2 = Math.floor(Math.random() * 100) + 50;
      } else {
        num1 = Math.floor(Math.random() * 300) + 100;
        num2 = Math.floor(Math.random() * 300) + 100;
      }
      answer = num1 + num2;
      break;
    case "-":
      if (level === 0) {
        num1 = Math.floor(Math.random() * 20) + 10;
        num2 = Math.floor(Math.random() * num1) + 1;
      } else if (level === 1) {
        num1 = Math.floor(Math.random() * 80) + 30;
        num2 = Math.floor(Math.random() * num1) + 1;
      } else if (level === 2) {
        num1 = Math.floor(Math.random() * 150) + 50;
        num2 = Math.floor(Math.random() * num1) + 1;
      } else {
        num1 = Math.floor(Math.random() * 400) + 150;
        num2 = Math.floor(Math.random() * num1) + 1;
      }
      answer = num1 - num2;
      break;
    case "×":
      if (level === 0) {
        num1 = Math.floor(Math.random() * 8) + 2;
        num2 = Math.floor(Math.random() * 8) + 2;
      } else if (level === 1) {
        num1 = Math.floor(Math.random() * 12) + 3;
        num2 = Math.floor(Math.random() * 12) + 3;
      } else if (level === 2) {
        num1 = Math.floor(Math.random() * 15) + 5;
        num2 = Math.floor(Math.random() * 15) + 5;
      } else {
        num1 = Math.floor(Math.random() * 20) + 10;
        num2 = Math.floor(Math.random() * 15) + 5;
      }
      answer = num1 * num2;
      break;
    case "÷":
      if (level === 0) {
        num2 = Math.floor(Math.random() * 6) + 2;
        answer = Math.floor(Math.random() * 8) + 2;
      } else if (level === 1) {
        num2 = Math.floor(Math.random() * 10) + 2;
        answer = Math.floor(Math.random() * 12) + 3;
      } else if (level === 2) {
        num2 = Math.floor(Math.random() * 12) + 3;
        answer = Math.floor(Math.random() * 15) + 5;
      } else {
        num2 = Math.floor(Math.random() * 15) + 5;
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
  const offsetRange = Math.max(5, Math.floor(answer * 0.2));
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

export default function MultipleChoiceGame() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { updateGameStats, getGameStats } = useGamesStats();
  const currentStats = getGameStats("multipleChoice");

  const [question, setQuestion] = useState(generateQuestion(0));
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [lives, setLives] = useState(3);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [statsSaved, setStatsSaved] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const difficulty = Math.floor(score / 5);

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
                "multipleChoice",
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
    if (gameOver && !statsSaved) {
      updateGameStats(
        "multipleChoice",
        score,
        correctCount,
        wrongCount,
        bestStreak,
      );
      setStatsSaved(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver, statsSaved]);

  const handleAnswer = useCallback(
    (answer: number) => {
      if (selectedAnswer !== null) return;

      setSelectedAnswer(answer);
      const isCorrect = answer === question.answer;

      if (isCorrect) {
        setScore((s) => s + 1);
        setCorrectCount((c) => c + 1);
        setStreak((s) => {
          const newStreak = s + 1;
          setBestStreak((prev) => Math.max(prev, newStreak));
          return newStreak;
        });
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        setStreak(0);
        setWrongCount((c) => c + 1);

        if (lives <= 1) {
          setLives(0);
          setTimeout(() => setGameOver(true), 1000);
          return;
        }

        setLives((l) => l - 1);
      }

      setTimeout(() => {
        setSelectedAnswer(null);
        setQuestion(generateQuestion(difficulty));
      }, 1000);
    },
    [selectedAnswer, question.answer, lives, difficulty, scaleAnim],
  );

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
    setQuestion(generateQuestion(0));
  };

  const gameColor = "#10B981";

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

  if (gameOver) {
    const isNewRecord = score > (currentStats?.highScore ?? 0);

    return (
      <>
        <Stack.Screen
          options={{
            title: "Qual é o Resultado?",
            headerTintColor: gameColor,
            headerStyle: { backgroundColor: colors.background },
            headerTitleStyle: { color: colors.text },
          }}
        />
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <View style={styles.gameOverContainer}>
            <MaterialIcons name="emoji-events" size={80} color={gameColor} />
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
              Melhor sequência: {bestStreak}
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
          title: "Qual é o Resultado?",
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
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <MaterialIcons name="emoji-events" size={20} color={gameColor} />
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
              {selectedAnswer !== null && option === question.answer && (
                <MaterialIcons name="check-circle" size={24} color="#22C55E" />
              )}
              {selectedAnswer === option && option !== question.answer && (
                <MaterialIcons name="cancel" size={24} color="#EF4444" />
              )}
            </Pressable>
          ))}
        </View>

        <Text style={[styles.levelText, { color: colors.icon }]}>
          Nível {difficulty + 1}
        </Text>
      </View>
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
    marginBottom: 40,
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
  questionContainer: {
    padding: 32,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: "center",
    marginBottom: 32,
  },
  questionText: {
    fontSize: 40,
    fontWeight: "bold",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  optionButton: {
    width: "47%",
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  optionText: {
    fontSize: 28,
    fontWeight: "bold",
  },
  levelText: {
    textAlign: "center",
    marginTop: 24,
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
