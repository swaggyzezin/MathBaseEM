import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState, useCallback, useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
  Keyboard,
  Alert,
  BackHandler,
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
} {
  const operations: Operation[] = ["+", "-", "×", "÷"];
  const operation =
    operations[Math.floor(Math.random() * Math.min(difficulty + 1, 4))];

  let num1: number, num2: number, answer: number;

  const level = Math.floor(difficulty / 2);

  switch (operation) {
    case "+":
      if (level === 0) {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
      } else if (level === 1) {
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * 50) + 10;
      } else if (level === 2) {
        num1 = Math.floor(Math.random() * 100) + 50;
        num2 = Math.floor(Math.random() * 100) + 50;
      } else {
        num1 = Math.floor(Math.random() * 500) + 100;
        num2 = Math.floor(Math.random() * 500) + 100;
      }
      answer = num1 + num2;
      break;
    case "-":
      if (level === 0) {
        num1 = Math.floor(Math.random() * 15) + 5;
        num2 = Math.floor(Math.random() * num1) + 1;
      } else if (level === 1) {
        num1 = Math.floor(Math.random() * 80) + 20;
        num2 = Math.floor(Math.random() * num1) + 1;
      } else if (level === 2) {
        num1 = Math.floor(Math.random() * 200) + 100;
        num2 = Math.floor(Math.random() * num1) + 1;
      } else {
        num1 = Math.floor(Math.random() * 500) + 200;
        num2 = Math.floor(Math.random() * num1) + 1;
      }
      answer = num1 - num2;
      break;
    case "×":
      if (level === 0) {
        num1 = Math.floor(Math.random() * 5) + 2;
        num2 = Math.floor(Math.random() * 5) + 2;
      } else if (level === 1) {
        num1 = Math.floor(Math.random() * 10) + 2;
        num2 = Math.floor(Math.random() * 10) + 2;
      } else if (level === 2) {
        num1 = Math.floor(Math.random() * 12) + 5;
        num2 = Math.floor(Math.random() * 12) + 5;
      } else {
        num1 = Math.floor(Math.random() * 15) + 10;
        num2 = Math.floor(Math.random() * 15) + 5;
      }
      answer = num1 * num2;
      break;
    case "÷":
      if (level === 0) {
        num2 = Math.floor(Math.random() * 5) + 2;
        answer = Math.floor(Math.random() * 5) + 2;
      } else if (level === 1) {
        num2 = Math.floor(Math.random() * 9) + 2;
        answer = Math.floor(Math.random() * 10) + 2;
      } else if (level === 2) {
        num2 = Math.floor(Math.random() * 12) + 2;
        answer = Math.floor(Math.random() * 12) + 5;
      } else {
        num2 = Math.floor(Math.random() * 15) + 5;
        answer = Math.floor(Math.random() * 15) + 10;
      }
      num1 = num2 * answer;
      break;
    default:
      num1 = 1;
      num2 = 1;
      answer = 2;
  }

  return { num1, num2, operation, answer };
}

export default function QuizGame() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { updateGameStats, getGameStats } = useGamesStats();
  const currentStats = getGameStats("quiz");

  const [question, setQuestion] = useState(generateQuestion(0));
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [statsSaved, setStatsSaved] = useState(false);
  const [shakeAnim] = useState(new Animated.Value(0));
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
                "quiz",
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
    gameOver,
    statsSaved,
    router,
    updateGameStats,
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
      updateGameStats("quiz", score, correctCount, wrongCount, bestStreak);
      setStatsSaved(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver, statsSaved]);

  const checkAnswer = useCallback(() => {
    if (!userAnswer) return;

    const isCorrect = parseInt(userAnswer) === question.answer;

    if (isCorrect) {
      setFeedback("correct");
      setScore((s) => s + 1);
      setCorrectCount((c) => c + 1);
      setStreak((s) => {
        const newStreak = s + 1;
        setBestStreak((prev) => Math.max(prev, newStreak));
        return newStreak;
      });
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
    } else {
      setFeedback("wrong");
      setStreak(0);
      setWrongCount((c) => c + 1);

      if (lives <= 1) {
        setLives(0);
        setGameOver(true);
        return;
      }

      setLives((l) => l - 1);
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
    }

    setTimeout(() => {
      setFeedback(null);
      setUserAnswer("");
      setQuestion(generateQuestion(difficulty));
    }, 500);
  }, [userAnswer, question.answer, lives, difficulty, scaleAnim, shakeAnim]);

  const handleSubmit = () => {
    Keyboard.dismiss();
    checkAnswer();
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
    setUserAnswer("");
    setQuestion(generateQuestion(0));
    setFeedback(null);
  };

  const gameColor = "#F59E0B";

  if (gameOver) {
    const isNewRecord = score > currentStats.highScore;

    return (
      <>
        <Stack.Screen
          options={{
            title: "Quiz Relâmpago",
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
            <Text style={[styles.gameOverScore, { color: gameColor }]}>
              Pontuação: {score}
            </Text>
            {isNewRecord && (
              <View style={styles.newRecordBadge}>
                <MaterialIcons name="star" size={16} color="#F59E0B" />
                <Text style={styles.newRecordText}>Novo Recorde!</Text>
              </View>
            )}
            <Text style={[styles.gameOverText, { color: colors.icon }]}>
              Melhor sequência: {bestStreak}
            </Text>
            <Text style={[styles.gameOverText, { color: colors.icon }]}>
              Recorde anterior: {currentStats.highScore}
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
          title: "Quiz Relâmpago",
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
              backgroundColor: colors.background,
              borderColor:
                feedback === "correct"
                  ? "#22C55E"
                  : feedback === "wrong"
                    ? "#EF4444"
                    : colors.icon + "30",
              transform: [{ translateX: shakeAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <Text style={[styles.questionText, { color: colors.text }]}>
            {question.num1} {question.operation} {question.num2} = ?
          </Text>
        </Animated.View>

        {feedback && (
          <View style={styles.feedbackContainer}>
            <MaterialIcons
              name={feedback === "correct" ? "check-circle" : "cancel"}
              size={32}
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
                : `Resposta: ${question.answer}`}
            </Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.icon + "50",
                color: colors.text,
              },
            ]}
            value={userAnswer}
            onChangeText={setUserAnswer}
            keyboardType="number-pad"
            placeholder="Digite a resposta"
            placeholderTextColor={colors.icon}
            onSubmitEditing={handleSubmit}
            autoFocus
          />

          <Pressable
            style={[styles.submitButton, { backgroundColor: gameColor }]}
            onPress={handleSubmit}
          >
            <MaterialIcons name="send" size={24} color="#fff" />
          </Pressable>
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
    padding: 40,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: "center",
    marginBottom: 24,
  },
  questionText: {
    fontSize: 48,
    fontWeight: "bold",
  },
  feedbackContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  submitButton: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  levelText: {
    textAlign: "center",
    marginTop: 20,
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
  newRecordBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F59E0B20",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  newRecordText: {
    color: "#F59E0B",
    fontWeight: "bold",
    fontSize: 14,
  },
});
