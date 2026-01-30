import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
  Keyboard,
  Animated,
  Alert,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useGamesStats } from "@/contexts/games-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

type QuestionType = "operand1" | "operand2" | "operation";

interface Question {
  num1: number;
  num2: number;
  operation: string;
  answer: number;
  questionType: QuestionType;
  displayText: string;
  correctValue: number | string;
  options?: string[];
}

function generateQuestion(difficulty: number): Question {
  const operations = ["+", "-", "×", "÷"];
  const opIndex = Math.floor(Math.random() * Math.min(difficulty + 1, 4));
  const operation = operations[opIndex];

  const level = Math.floor(difficulty / 2);
  let num1: number, num2: number, answer: number;

  switch (operation) {
    case "+":
      if (level === 0) {
        num1 = Math.floor(Math.random() * 15) + 1;
        num2 = Math.floor(Math.random() * 15) + 1;
      } else if (level === 1) {
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * 50) + 10;
      } else if (level === 2) {
        num1 = Math.floor(Math.random() * 100) + 30;
        num2 = Math.floor(Math.random() * 100) + 30;
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

  const questionTypes: QuestionType[] = ["operand1", "operand2"];
  if (difficulty >= 3) {
    questionTypes.push("operation");
  }
  const questionType =
    questionTypes[Math.floor(Math.random() * questionTypes.length)];

  let displayText: string;
  let correctValue: number | string;
  let options: string[] | undefined;

  switch (questionType) {
    case "operand1":
      displayText = `? ${operation} ${num2} = ${answer}`;
      correctValue = num1;
      break;
    case "operand2":
      displayText = `${num1} ${operation} ? = ${answer}`;
      correctValue = num2;
      break;
    case "operation":
      displayText = `${num1} ? ${num2} = ${answer}`;
      correctValue = operation;
      options = ["+", "-", "×", "÷"];
      break;
  }

  return {
    num1,
    num2,
    operation,
    answer,
    questionType,
    displayText,
    correctValue,
    options,
  };
}

export default function CompleteGame() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { updateGameStats, getGameStats } = useGamesStats();
  const currentStats = getGameStats("complete");

  const [question, setQuestion] = useState(generateQuestion(0));
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [statsSaved, setStatsSaved] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);

  const difficulty = Math.floor(score / 4);

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
                "complete",
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
      updateGameStats("complete", score, correctCount, wrongCount, bestStreak);
      setStatsSaved(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver, statsSaved]);
  const gameColor = "#8B5CF6";

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

  const pulse = () => {
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
  };

  const checkAnswer = (selectedOperation?: string) => {
    Keyboard.dismiss();

    let isCorrect = false;

    if (question.questionType === "operation" && selectedOperation) {
      isCorrect = selectedOperation === question.correctValue;
    } else {
      const userAnswer = parseInt(input, 10);
      if (isNaN(userAnswer)) return;
      isCorrect = userAnswer === question.correctValue;
    }

    if (isCorrect) {
      setFeedback("correct");
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
      setFeedback("wrong");
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
      setFeedback(null);
      setInput("");
      setQuestion(generateQuestion(difficulty));
      inputRef.current?.focus();
    }, 1200);
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
    setFeedback(null);
    setInput("");
    setQuestion(generateQuestion(0));
  };

  if (gameOver) {
    const isNewRecord = score > (currentStats?.highScore ?? 0);

    return (
      <>
        <Stack.Screen
          options={{
            title: "Complete a Equação",
            headerTintColor: gameColor,
            headerStyle: { backgroundColor: colors.background },
            headerTitleStyle: { color: colors.text },
          }}
        />
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <View style={styles.gameOverContainer}>
            <MaterialIcons name="functions" size={80} color={gameColor} />
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
          title: "Complete a Equação",
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
            <MaterialIcons name="stars" size={20} color={gameColor} />
            <Text style={[styles.statText, { color: colors.text }]}>
              {score}
            </Text>
          </View>
          <View style={styles.statBox}>
            <MaterialIcons name="whatshot" size={20} color="#F59E0B" />
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
            styles.equationContainer,
            {
              backgroundColor:
                feedback === "correct"
                  ? "#22C55E20"
                  : feedback === "wrong"
                    ? "#EF444420"
                    : gameColor + "10",
              borderColor:
                feedback === "correct"
                  ? "#22C55E"
                  : feedback === "wrong"
                    ? "#EF4444"
                    : gameColor,
              transform: [{ translateX: shakeAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <Text style={[styles.equationText, { color: colors.text }]}>
            {question.displayText}
          </Text>

          {feedback && (
            <View style={styles.feedbackRow}>
              <MaterialIcons
                name={feedback === "correct" ? "check-circle" : "cancel"}
                size={28}
                color={feedback === "correct" ? "#22C55E" : "#EF4444"}
              />
              <Text
                style={[
                  styles.feedbackText,
                  { color: feedback === "correct" ? "#22C55E" : "#EF4444" },
                ]}
              >
                {feedback === "correct"
                  ? "Correto!"
                  : `Era ${question.correctValue}`}
              </Text>
            </View>
          )}
        </Animated.View>

        {question.questionType !== "operation" && (
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.icon }]}>
              Sua resposta:
            </Text>
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: gameColor,
                  color: colors.text,
                },
              ]}
              value={input}
              onChangeText={setInput}
              keyboardType="number-pad"
              placeholder="?"
              placeholderTextColor={colors.icon}
              autoFocus
              editable={!feedback}
              onSubmitEditing={() => checkAnswer()}
            />
          </View>
        )}

        {question.questionType === "operation" && (
          <View style={styles.operationButtonsContainer}>
            <Text style={[styles.inputLabel, { color: colors.icon }]}>
              Qual operação?
            </Text>
            <View style={styles.operationButtons}>
              {question.options?.map((op) => (
                <Pressable
                  key={op}
                  style={[
                    styles.operationButton,
                    {
                      backgroundColor: colors.background,
                      borderColor: gameColor,
                    },
                  ]}
                  onPress={() => checkAnswer(op)}
                  disabled={!!feedback}
                >
                  <Text
                    style={[styles.operationButtonText, { color: colors.text }]}
                  >
                    {op}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {question.questionType !== "operation" && (
          <Pressable
            style={[
              styles.confirmButton,
              {
                backgroundColor:
                  input.length > 0 && !feedback
                    ? gameColor
                    : colors.icon + "30",
              },
            ]}
            onPress={() => checkAnswer()}
            disabled={input.length === 0 || !!feedback}
          >
            <Text style={styles.confirmButtonText}>Confirmar</Text>
            <MaterialIcons name="send" size={20} color="#fff" />
          </Pressable>
        )}

        <Text style={[styles.levelText, { color: colors.icon }]}>
          Nível {difficulty + 1} •{" "}
          {question.questionType === "operation"
            ? "Qual operação?"
            : "Encontre o número"}
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
  equationContainer: {
    padding: 32,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: "center",
    marginBottom: 32,
  },
  equationText: {
    fontSize: 36,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: "600",
  },
  inputContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    width: 120,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 20,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  operationButtonsContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  operationButtons: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
  },
  operationButton: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  operationButtonText: {
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
