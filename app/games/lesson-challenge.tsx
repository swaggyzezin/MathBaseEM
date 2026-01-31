import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { useProgress } from "@/contexts/progress-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { modules } from "@/data/modules";

type QuestionCategory =
  | "fractions"
  | "percentage"
  | "algebra"
  | "equations"
  | "proportion"
  | "functions";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  category: QuestionCategory;
  moduleId: string;
  explanation: string;
}

function generateFractionQuestion(): Question {
  const types = ["add", "multiply", "simplify", "compare"];
  const type = types[Math.floor(Math.random() * types.length)];

  if (type === "add") {
    const d = [2, 3, 4, 5, 6][Math.floor(Math.random() * 5)];
    const n1 = Math.floor(Math.random() * (d - 1)) + 1;
    const n2 = Math.floor(Math.random() * (d - 1)) + 1;
    const result = n1 + n2;
    const simplified = result % d === 0 ? `${result / d}` : `${result}/${d}`;

    const wrongAnswers = [
      `${n1 + n2}/${d * 2}`,
      `${n1 * n2}/${d}`,
      `${Math.abs(n1 - n2)}/${d}`,
    ];
    const options = [...wrongAnswers, simplified].sort(
      () => Math.random() - 0.5,
    );

    return {
      question: `Quanto é ${n1}/${d} + ${n2}/${d}?`,
      options,
      correctIndex: options.indexOf(simplified),
      category: "fractions",
      moduleId: "1",
      explanation: `${n1}/${d} + ${n2}/${d} = ${result}/${d}`,
    };
  }

  if (type === "multiply") {
    const n1 = Math.floor(Math.random() * 4) + 1;
    const d1 = Math.floor(Math.random() * 4) + 2;
    const n2 = Math.floor(Math.random() * 4) + 1;
    const d2 = Math.floor(Math.random() * 4) + 2;
    const resultN = n1 * n2;
    const resultD = d1 * d2;
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const g = gcd(resultN, resultD);
    const simplified = `${resultN / g}/${resultD / g}`;

    const wrongAnswers = [
      `${n1 + n2}/${d1 + d2}`,
      `${n1 * n2}/${d1 + d2}`,
      `${n1 + n2}/${d1 * d2}`,
    ];
    const options = [...wrongAnswers, simplified].sort(
      () => Math.random() - 0.5,
    );

    return {
      question: `Quanto é ${n1}/${d1} × ${n2}/${d2}?`,
      options,
      correctIndex: options.indexOf(simplified),
      category: "fractions",
      moduleId: "1",
      explanation: `${n1}/${d1} × ${n2}/${d2} = ${resultN}/${resultD} = ${simplified}`,
    };
  }

  if (type === "simplify") {
    const factor = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
    const n = Math.floor(Math.random() * 5) + 1;
    const d = Math.floor(Math.random() * 5) + 2;
    const bigN = n * factor;
    const bigD = d * factor;
    const simplified = `${n}/${d}`;

    const wrongAnswers = [`${n + 1}/${d}`, `${n}/${d + 1}`, `${bigN}/${bigD}`];
    const options = [...wrongAnswers, simplified].sort(
      () => Math.random() - 0.5,
    );

    return {
      question: `Simplifique ${bigN}/${bigD}:`,
      options,
      correctIndex: options.indexOf(simplified),
      category: "fractions",
      moduleId: "1",
      explanation: `${bigN}/${bigD} ÷ ${factor}/${factor} = ${simplified}`,
    };
  }

  const n1 = Math.floor(Math.random() * 3) + 1;
  const d1 = Math.floor(Math.random() * 4) + 2;
  const n2 = Math.floor(Math.random() * 3) + 1;
  const d2 = Math.floor(Math.random() * 4) + 2;
  const val1 = n1 / d1;
  const val2 = n2 / d2;

  return {
    question: `Qual fração é maior: ${n1}/${d1} ou ${n2}/${d2}?`,
    options: [
      `${n1}/${d1}`,
      `${n2}/${d2}`,
      "São iguais",
      "Não é possível comparar",
    ],
    correctIndex: val1 > val2 ? 0 : val1 < val2 ? 1 : 2,
    category: "fractions",
    moduleId: "1",
    explanation: `${n1}/${d1} = ${val1.toFixed(2)} e ${n2}/${d2} = ${val2.toFixed(2)}`,
  };
}

function generatePercentageQuestion(): Question {
  const types = ["calculate", "find", "increase"];
  const type = types[Math.floor(Math.random() * types.length)];

  if (type === "calculate") {
    const percent = [10, 20, 25, 30, 50][Math.floor(Math.random() * 5)];
    const base = [100, 200, 50, 80, 150][Math.floor(Math.random() * 5)];
    const result = (percent / 100) * base;

    const wrongAnswers = [
      `${result + 10}`,
      `${result * 2}`,
      `${Math.floor(result / 2)}`,
    ];
    const options = [...wrongAnswers, `${result}`].sort(
      () => Math.random() - 0.5,
    );

    return {
      question: `Quanto é ${percent}% de ${base}?`,
      options,
      correctIndex: options.indexOf(`${result}`),
      category: "percentage",
      moduleId: "1",
      explanation: `${percent}% de ${base} = ${percent}/100 × ${base} = ${result}`,
    };
  }

  if (type === "find") {
    const part = [10, 20, 25, 30, 40][Math.floor(Math.random() * 5)];
    const total = [50, 100, 200][Math.floor(Math.random() * 3)];
    const percent = (part / total) * 100;

    const wrongAnswers = [
      `${percent + 10}%`,
      `${percent * 2}%`,
      `${Math.floor(percent / 2)}%`,
    ];
    const options = [...wrongAnswers, `${percent}%`].sort(
      () => Math.random() - 0.5,
    );

    return {
      question: `${part} é quantos por cento de ${total}?`,
      options,
      correctIndex: options.indexOf(`${percent}%`),
      category: "percentage",
      moduleId: "1",
      explanation: `${part}/${total} = ${percent / 100} = ${percent}%`,
    };
  }

  const original = [100, 200, 50][Math.floor(Math.random() * 3)];
  const increase = [10, 20, 50][Math.floor(Math.random() * 3)];
  const result = original + (original * increase) / 100;

  const wrongAnswers = [
    `${original + increase}`,
    `${result + 20}`,
    `${original * 2}`,
  ];
  const options = [...wrongAnswers, `${result}`].sort(
    () => Math.random() - 0.5,
  );

  return {
    question: `Um produto de R$ ${original} teve aumento de ${increase}%. Qual o novo preço?`,
    options,
    correctIndex: options.indexOf(`${result}`),
    category: "percentage",
    moduleId: "1",
    explanation: `${original} + ${increase}% = ${original} + ${(original * increase) / 100} = ${result}`,
  };
}

function generateAlgebraQuestion(): Question {
  const types = ["evaluate", "simplify", "identify"];
  const type = types[Math.floor(Math.random() * types.length)];

  if (type === "evaluate") {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const x = Math.floor(Math.random() * 5) + 1;
    const result = a * x + b;

    const wrongAnswers = [`${result + a}`, `${a + b + x}`, `${result - b}`];
    const options = [...wrongAnswers, `${result}`].sort(
      () => Math.random() - 0.5,
    );

    return {
      question: `Se f(x) = ${a}x + ${b}, quanto vale f(${x})?`,
      options,
      correctIndex: options.indexOf(`${result}`),
      category: "algebra",
      moduleId: "2",
      explanation: `f(${x}) = ${a}×${x} + ${b} = ${a * x} + ${b} = ${result}`,
    };
  }

  if (type === "simplify") {
    const a = Math.floor(Math.random() * 5) + 2;
    const b = Math.floor(Math.random() * 5) + 1;
    const sum = a + b;

    return {
      question: `Simplifique: ${a}x + ${b}x`,
      options: [`${sum}x`, `${a * b}x`, `${a}x²`, `${sum}x²`],
      correctIndex: 0,
      category: "algebra",
      moduleId: "2",
      explanation: `${a}x + ${b}x = (${a} + ${b})x = ${sum}x`,
    };
  }

  const a = Math.floor(Math.random() * 5) + 1;
  const b = Math.floor(Math.random() * 10) - 5;
  const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;

  return {
    question: `Na expressão ${a}x ${bStr}, qual é o coeficiente de x?`,
    options: [`${a}`, `${b}`, `${a + b}`, `x`],
    correctIndex: 0,
    category: "algebra",
    moduleId: "2",
    explanation: `O coeficiente é o número que multiplica x, ou seja, ${a}`,
  };
}

function generateEquationQuestion(): Question {
  const types = ["solve", "check", "word"];
  const type = types[Math.floor(Math.random() * types.length)];

  if (type === "solve") {
    const x = Math.floor(Math.random() * 10) + 1;
    const a = Math.floor(Math.random() * 5) + 1;
    const b = a * x;

    const wrongAnswers = [`${x + 1}`, `${x - 1}`, `${b}`];
    const options = [...wrongAnswers, `${x}`].sort(() => Math.random() - 0.5);

    return {
      question: `Resolva: ${a}x = ${b}`,
      options,
      correctIndex: options.indexOf(`${x}`),
      category: "equations",
      moduleId: "3",
      explanation: `${a}x = ${b} → x = ${b}/${a} = ${x}`,
    };
  }

  if (type === "check") {
    const x = Math.floor(Math.random() * 5) + 1;
    const a = Math.floor(Math.random() * 3) + 2;
    const b = Math.floor(Math.random() * 10) + 1;
    const result = a * x + b;

    return {
      question: `x = ${x} é solução de ${a}x + ${b} = ${result}?`,
      options: ["Sim", "Não", "Depende", "Impossível determinar"],
      correctIndex: 0,
      category: "equations",
      moduleId: "3",
      explanation: `${a}×${x} + ${b} = ${a * x} + ${b} = ${result} ✓`,
    };
  }

  const age = Math.floor(Math.random() * 10) + 5;
  const years = Math.floor(Math.random() * 5) + 2;
  const futureAge = age + years;

  const wrongAnswers = [`${age + 1}`, `${futureAge}`, `${age - years}`];
  const options = [...wrongAnswers, `${age}`].sort(() => Math.random() - 0.5);

  return {
    question: `A idade de João daqui a ${years} anos será ${futureAge}. Qual a idade atual?`,
    options,
    correctIndex: options.indexOf(`${age}`),
    category: "equations",
    moduleId: "3",
    explanation: `x + ${years} = ${futureAge} → x = ${futureAge} - ${years} = ${age}`,
  };
}

function generateProportionQuestion(): Question {
  const types = ["ratio", "rule3", "proportion"];
  const type = types[Math.floor(Math.random() * types.length)];

  if (type === "ratio") {
    const a = Math.floor(Math.random() * 10) + 2;
    const b = Math.floor(Math.random() * 10) + 2;
    const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
    const g = gcd(a, b);
    const simplified = `${a / g}:${b / g}`;

    return {
      question: `Simplifique a razão ${a}:${b}`,
      options: [
        simplified,
        `${a}:${b}`,
        `${b / g}:${a / g}`,
        `1:${Math.floor(b / a)}`,
      ],
      correctIndex: 0,
      category: "proportion",
      moduleId: "4",
      explanation: `${a}:${b} = ${a / g}:${b / g} (dividindo por ${g})`,
    };
  }

  if (type === "rule3") {
    const a = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
    const b = [10, 20, 30, 40][Math.floor(Math.random() * 4)];
    const c = [4, 6, 8, 10][Math.floor(Math.random() * 4)];
    const x = (b * c) / a;

    const wrongAnswers = [`${x + 10}`, `${(a * c) / b}`, `${a + b + c}`];
    const options = [...wrongAnswers, `${x}`].sort(() => Math.random() - 0.5);

    return {
      question: `Se ${a} custa R$ ${b}, quanto custam ${c}?`,
      options,
      correctIndex: options.indexOf(`${x}`),
      category: "proportion",
      moduleId: "4",
      explanation: `${a} → ${b}\n${c} → x\nx = (${b} × ${c}) / ${a} = ${x}`,
    };
  }

  const a = Math.floor(Math.random() * 5) + 1;
  const b = Math.floor(Math.random() * 5) + 2;
  const c = a * 2;
  const d = b * 2;

  return {
    question: `${a}/${b} = ${c}/x. Qual o valor de x?`,
    options: [`${d}`, `${b}`, `${c}`, `${a + b}`],
    correctIndex: 0,
    category: "proportion",
    moduleId: "4",
    explanation: `${a}/${b} = ${c}/x → x = (${c} × ${b}) / ${a} = ${d}`,
  };
}

function generateFunctionQuestion(): Question {
  const types = ["calculate", "coefficient", "zero"];
  const type = types[Math.floor(Math.random() * types.length)];

  if (type === "calculate") {
    const a = Math.floor(Math.random() * 4) + 1;
    const b = Math.floor(Math.random() * 10) - 5;
    const x = Math.floor(Math.random() * 5) + 1;
    const result = a * x + b;
    const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;

    const wrongAnswers = [`${result + a}`, `${a + b}`, `${result - b}`];
    const options = [...wrongAnswers, `${result}`].sort(
      () => Math.random() - 0.5,
    );

    return {
      question: `Dada f(x) = ${a}x ${bStr}, calcule f(${x}):`,
      options,
      correctIndex: options.indexOf(`${result}`),
      category: "functions",
      moduleId: "5",
      explanation: `f(${x}) = ${a}×${x} ${bStr} = ${result}`,
    };
  }

  if (type === "coefficient") {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 10) - 5;
    const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;

    return {
      question: `Na função f(x) = ${a}x ${bStr}, qual é o coeficiente angular?`,
      options: [`${a}`, `${b}`, `${a + b}`, `x`],
      correctIndex: 0,
      category: "functions",
      moduleId: "5",
      explanation: `Em f(x) = ax + b, o coeficiente angular é "a" = ${a}`,
    };
  }

  const a = [1, 2, 3, 4][Math.floor(Math.random() * 4)];
  const zero = Math.floor(Math.random() * 5) + 1;
  const b = -a * zero;
  const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;

  const wrongAnswers = [`${zero + 1}`, `${-zero}`, `${b}`];
  const options = [...wrongAnswers, `${zero}`].sort(() => Math.random() - 0.5);

  return {
    question: `Qual é a raiz (zero) da função f(x) = ${a}x ${bStr}?`,
    options,
    correctIndex: options.indexOf(`${zero}`),
    category: "functions",
    moduleId: "5",
    explanation: `${a}x ${bStr} = 0 → x = ${Math.abs(b)}/${a} = ${zero}`,
  };
}

function generateQuestionForModule(moduleId: string): Question {
  switch (moduleId) {
    case "1":
      return Math.random() > 0.5
        ? generateFractionQuestion()
        : generatePercentageQuestion();
    case "2":
      return generateAlgebraQuestion();
    case "3":
      return generateEquationQuestion();
    case "4":
      return generateProportionQuestion();
    case "5":
      return generateFunctionQuestion();
    default:
      return generateFractionQuestion();
  }
}

export default function LessonChallengeGame() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { updateGameStats, getGameStats } = useGamesStats();
  const { progress } = useProgress();
  const currentStats = getGameStats("lessonChallenge");

  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [lives, setLives] = useState(3);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [statsSaved, setStatsSaved] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const gameColor = "#6366F1";

  const completedLessons = Object.keys(progress).filter((id) => progress[id]);

  const studiedModules = modules.filter((m) =>
    m.lessons.some((l) => completedLessons.includes(l.id)),
  );

  const confirmExit = useCallback(() => {
    if (gameOver || !selectedModule) {
      router.back();
      return;
    }

    Alert.alert(
      "Sair do Jogo",
      score > 0
        ? `Você tem ${score} pontos. Deseja sair e salvar?`
        : "Deseja realmente sair?",
      [
        { text: "Continuar", style: "cancel" },
        {
          text: "Sair",
          onPress: () => {
            if (!statsSaved && (score > 0 || correctCount > 0)) {
              updateGameStats(
                "lessonChallenge",
                score,
                correctCount,
                wrongCount,
                0,
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
    updateGameStats,
    router,
    gameOver,
    statsSaved,
    selectedModule,
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
      updateGameStats("lessonChallenge", score, correctCount, wrongCount, 0);
      setStatsSaved(true);
    }
  }, [gameOver, statsSaved, score, correctCount, wrongCount, updateGameStats]);

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

  const startGame = (moduleId: string) => {
    setSelectedModule(moduleId);
    setQuestion(generateQuestionForModule(moduleId));
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setLives(3);
    setGameOver(false);
    setStatsSaved(false);
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    const isCorrect = index === question?.correctIndex;

    if (isCorrect) {
      setScore((s) => s + 1);
      setCorrectCount((c) => c + 1);
      pulse();
    } else {
      setWrongCount((w) => w + 1);
      setShowExplanation(true);

      if (lives <= 1) {
        setLives(0);
        setTimeout(() => setGameOver(true), 2000);
        return;
      }
      setLives((l) => l - 1);
    }

    setTimeout(
      () => {
        setSelectedAnswer(null);
        setShowExplanation(false);
        if (selectedModule) {
          setQuestion(generateQuestionForModule(selectedModule));
        }
      },
      isCorrect ? 1200 : 2500,
    );
  };

  const restartGame = () => {
    if (selectedModule) {
      startGame(selectedModule);
    }
  };

  if (!selectedModule) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Desafio das Aulas",
            headerTintColor: gameColor,
            headerStyle: { backgroundColor: colors.background },
            headerTitleStyle: { color: colors.text },
          }}
        />
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.moduleSelectContainer}
        >
          <MaterialIcons name="school" size={60} color={gameColor} />
          <Text style={[styles.selectTitle, { color: colors.text }]}>
            Escolha um módulo
          </Text>
          <Text style={[styles.selectSubtitle, { color: colors.icon }]}>
            Teste seus conhecimentos nas aulas que você estudou!
          </Text>

          {studiedModules.length === 0 ? (
            <View
              style={[
                styles.emptyState,
                { backgroundColor: colors.surfaceVariant },
              ]}
            >
              <MaterialIcons
                name="info-outline"
                size={40}
                color={colors.icon}
              />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                Assista algumas aulas primeiro!
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.icon }]}>
                Complete aulas para desbloquear desafios relacionados.
              </Text>
            </View>
          ) : (
            <View style={styles.modulesGrid}>
              {studiedModules.map((module) => {
                const completedCount = module.lessons.filter((l) =>
                  completedLessons.includes(l.id),
                ).length;

                return (
                  <Pressable
                    key={module.id}
                    style={[
                      styles.moduleCard,
                      {
                        backgroundColor: module.color + "15",
                        borderColor: module.color,
                      },
                    ]}
                    onPress={() => startGame(module.id)}
                  >
                    <MaterialIcons
                      name={module.icon}
                      size={32}
                      color={module.color}
                    />
                    <Text style={[styles.moduleTitle, { color: colors.text }]}>
                      {module.title}
                    </Text>
                    <Text
                      style={[styles.moduleProgress, { color: colors.icon }]}
                    >
                      {completedCount}/{module.lessons.length} aulas
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {studiedModules.length > 0 && (
            <Pressable
              style={[styles.randomButton, { backgroundColor: gameColor }]}
              onPress={() => {
                const randomModule =
                  studiedModules[
                    Math.floor(Math.random() * studiedModules.length)
                  ];
                startGame(randomModule.id);
              }}
            >
              <MaterialIcons name="shuffle" size={24} color="#fff" />
              <Text style={styles.randomButtonText}>Módulo Aleatório</Text>
            </Pressable>
          )}
        </ScrollView>
      </>
    );
  }

  const currentModule = modules.find((m) => m.id === selectedModule);

  if (gameOver) {
    const isNewRecord = score > (currentStats?.highScore ?? 0);

    return (
      <>
        <Stack.Screen
          options={{
            title: "Desafio das Aulas",
            headerTintColor: gameColor,
            headerStyle: { backgroundColor: colors.background },
            headerTitleStyle: { color: colors.text },
          }}
        />
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <View style={styles.gameOverContainer}>
            <MaterialIcons name="school" size={80} color={gameColor} />
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
              {score} pontos
            </Text>
            <Text style={[styles.gameOverText, { color: colors.icon }]}>
              {correctCount} certas • {wrongCount} erradas
            </Text>
            <Text style={[styles.gameOverText, { color: colors.icon }]}>
              Módulo: {currentModule?.title}
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
              onPress={() => setSelectedModule(null)}
            >
              <Text style={[styles.backButtonText, { color: colors.text }]}>
                Escolher Outro Módulo
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
          title: currentModule?.title ?? "Desafio das Aulas",
          headerTintColor: currentModule?.color ?? gameColor,
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
            <MaterialIcons
              name="stars"
              size={20}
              color={currentModule?.color ?? gameColor}
            />
            <Text style={[styles.statText, { color: colors.text }]}>
              {score}
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
              backgroundColor:
                selectedAnswer !== null
                  ? selectedAnswer === question?.correctIndex
                    ? "#22C55E15"
                    : "#EF444415"
                  : (currentModule?.color ?? gameColor) + "10",
              borderColor:
                selectedAnswer !== null
                  ? selectedAnswer === question?.correctIndex
                    ? "#22C55E"
                    : "#EF4444"
                  : (currentModule?.color ?? gameColor),
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={[styles.questionText, { color: colors.text }]}>
            {question?.question}
          </Text>

          {showExplanation && question && (
            <View
              style={[
                styles.explanationBox,
                { backgroundColor: colors.surfaceVariant },
              ]}
            >
              <MaterialIcons name="lightbulb" size={18} color="#F59E0B" />
              <Text style={[styles.explanationText, { color: colors.text }]}>
                {question.explanation}
              </Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.optionsContainer}>
          {question?.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correctIndex;
            const showResult = selectedAnswer !== null;

            let bgColor = colors.background;
            let borderColor = currentModule?.color ?? gameColor;

            if (showResult) {
              if (isCorrect) {
                bgColor = "#22C55E20";
                borderColor = "#22C55E";
              } else if (isSelected && !isCorrect) {
                bgColor = "#EF444420";
                borderColor = "#EF4444";
              } else {
                borderColor = colors.icon + "50";
              }
            }

            return (
              <Pressable
                key={index}
                style={[
                  styles.optionButton,
                  { backgroundColor: bgColor, borderColor },
                ]}
                onPress={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: showResult && isCorrect ? "#22C55E" : colors.text,
                    },
                  ]}
                >
                  {option}
                </Text>
                {showResult && isCorrect && (
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color="#22C55E"
                  />
                )}
                {showResult && isSelected && !isCorrect && (
                  <MaterialIcons name="cancel" size={24} color="#EF4444" />
                )}
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
    padding: 20,
  },
  moduleSelectContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  selectTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
  },
  selectSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  modulesGrid: {
    width: "100%",
    gap: 12,
  },
  moduleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 16,
  },
  moduleTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  moduleProgress: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
    borderRadius: 16,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  randomButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 24,
  },
  randomButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
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
    padding: 24,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 24,
    minHeight: 120,
    justifyContent: "center",
  },
  questionText: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 28,
  },
  explanationBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
  },
  explanationText: {
    flex: 1,
    fontSize: 14,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  optionText: {
    fontSize: 18,
    fontWeight: "500",
    flex: 1,
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  },
  gameOverScore: {
    fontSize: 48,
    fontWeight: "bold",
    marginTop: 10,
  },
  gameOverText: {
    fontSize: 16,
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
