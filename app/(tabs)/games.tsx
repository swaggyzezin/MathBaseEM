import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useGamesStats, AllGamesStats } from "@/contexts/games-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

type Game = {
  id: string;
  statsKey: keyof AllGamesStats;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  difficulty: "Fácil" | "Médio" | "Difícil";
  route: string;
};

const games: Game[] = [
  {
    id: "lesson-challenge",
    statsKey: "lessonChallenge",
    title: "Desafio das Aulas",
    description:
      "Teste seus conhecimentos! Questões de frações, álgebra, equações e mais baseadas nas aulas.",
    icon: "school",
    color: "#6366F1",
    difficulty: "Médio",
    route: "/games/lesson-challenge",
  },
  {
    id: "quiz",
    statsKey: "quiz",
    title: "Quiz Relâmpago",
    description:
      "Digite o resultado das operações o mais rápido possível! Dificuldade aumenta progressivamente.",
    icon: "bolt",
    color: "#F59E0B",
    difficulty: "Fácil",
    route: "/games/quiz",
  },
  {
    id: "multiple-choice",
    statsKey: "multipleChoice",
    title: "Qual é o Resultado?",
    description:
      "Escolha a resposta correta entre 4 opções. Operações mais difíceis a cada nível!",
    icon: "check-circle",
    color: "#10B981",
    difficulty: "Fácil",
    route: "/games/multiple-choice",
  },
  {
    id: "complete",
    statsKey: "complete",
    title: "Complete a Equação",
    description:
      "Encontre o número ou a operação que falta! Desafie seu raciocínio inverso.",
    icon: "help",
    color: "#8B5CF6",
    difficulty: "Médio",
    route: "/games/complete",
  },
  {
    id: "sequence",
    statsKey: "sequence",
    title: "Sequência Numérica",
    description:
      "Descubra o padrão: somas, multiplicações, quadrados, cubos, primos e Fibonacci!",
    icon: "trending-up",
    color: "#F59E0B",
    difficulty: "Médio",
    route: "/games/sequence",
  },
  {
    id: "memory",
    statsKey: "memory",
    title: "Memória Matemática",
    description:
      "Encontre os pares de operações e resultados. Operações mais complexas a cada rodada!",
    icon: "grid-on",
    color: "#EC4899",
    difficulty: "Médio",
    route: "/games/memory",
  },
  {
    id: "time-attack",
    statsKey: "timeAttack",
    title: "Contra o Tempo",
    description:
      "60 segundos! Quanto mais acertos, mais difíceis as contas. Bônus de tempo por combo!",
    icon: "timer",
    color: "#EF4444",
    difficulty: "Difícil",
    route: "/games/time-attack",
  },
];

const difficultyColors: Record<Game["difficulty"], string> = {
  Fácil: "#22C55E",
  Médio: "#F59E0B",
  Difícil: "#EF4444",
};

function GameCard({
  game,
  colors,
  highScore,
  onPress,
}: {
  game: Game;
  colors: typeof Colors.light;
  highScore: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: game.color + "15" }]}
      >
        <MaterialIcons name={game.icon} size={24} color={game.color} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {game.title}
          </Text>
        </View>
        <Text
          style={[styles.cardDescription, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {game.description}
        </Text>
        <View style={styles.cardMeta}>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: difficultyColors[game.difficulty] + "15" },
            ]}
          >
            <Text
              style={[
                styles.difficultyText,
                { color: difficultyColors[game.difficulty] },
              ]}
            >
              {game.difficulty}
            </Text>
          </View>
          {highScore > 0 && (
            <View style={styles.recordRow}>
              <MaterialIcons name="emoji-events" size={12} color="#F59E0B" />
              <Text style={styles.recordText}>{highScore}</Text>
            </View>
          )}
        </View>
      </View>
      <MaterialIcons name="play-arrow" size={24} color={colors.icon} />
    </Pressable>
  );
}

export default function GamesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { stats } = useGamesStats();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const totalScore = Object.values(stats).reduce(
    (sum, s) => sum + (s.totalScore || 0),
    0,
  );
  const bestStreak = Math.max(...Object.values(stats).map((s) => s.bestStreak));
  const totalGames = Object.values(stats).reduce(
    (sum, s) => sum + s.totalGames,
    0,
  );

  const handleGamePress = (game: Game) => {
    setSelectedGame(game);
  };

  const handlePlayGame = () => {
    if (selectedGame) {
      router.push(selectedGame.route as any);
      setSelectedGame(null);
    }
  };

  const handleCloseModal = () => {
    setSelectedGame(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>
          Hora de praticar
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>Jogos</Text>
      </View>

      <View
        style={[
          styles.statsCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {totalScore}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            pontos
          </Text>
        </View>
        <View
          style={[styles.statDivider, { backgroundColor: colors.border }]}
        />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {bestStreak}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            sequência
          </Text>
        </View>
        <View
          style={[styles.statDivider, { backgroundColor: colors.border }]}
        />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {totalGames}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            partidas
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Escolha um jogo
        </Text>
      </View>

      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GameCard
            game={item}
            colors={colors}
            highScore={stats[item.statsKey].highScore}
            onPress={() => handleGamePress(item)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={selectedGame !== null}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCloseModal}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            {selectedGame && (
              <>
                <View
                  style={[
                    styles.modalIconContainer,
                    { backgroundColor: selectedGame.color + "15" },
                  ]}
                >
                  <MaterialIcons
                    name={selectedGame.icon as any}
                    size={48}
                    color={selectedGame.color}
                  />
                </View>

                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {selectedGame.title}
                </Text>

                <View
                  style={[
                    styles.modalDifficultyBadge,
                    {
                      backgroundColor:
                        difficultyColors[selectedGame.difficulty] + "15",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalDifficultyText,
                      { color: difficultyColors[selectedGame.difficulty] },
                    ]}
                  >
                    {selectedGame.difficulty}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.modalDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {selectedGame.description}
                </Text>

                <View
                  style={[
                    styles.modalRecordContainer,
                    { backgroundColor: colors.surfaceVariant },
                  ]}
                >
                  <MaterialIcons
                    name="emoji-events"
                    size={20}
                    color={colors.tint}
                  />
                  <Text
                    style={[styles.modalRecordText, { color: colors.text }]}
                  >
                    Recorde: {stats[selectedGame.statsKey].highScore} pontos
                  </Text>
                </View>

                <View style={styles.modalButtons}>
                  <Pressable
                    style={[
                      styles.modalButton,
                      styles.modalButtonSecondary,
                      { borderColor: colors.border },
                    ]}
                    onPress={handleCloseModal}
                  >
                    <Text
                      style={[
                        styles.modalButtonText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Voltar
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.modalButton,
                      styles.modalButtonPrimary,
                      { backgroundColor: colors.tint },
                    ]}
                    onPress={handlePlayGame}
                  >
                    <MaterialIcons
                      name="play-arrow"
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text
                      style={[styles.modalButtonText, { color: "#FFFFFF" }]}
                    >
                      Jogar
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 4,
    letterSpacing: -0.5,
  },
  statsCard: {
    flexDirection: "row",
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    marginVertical: 4,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  cardDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: "600",
  },
  recordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  recordText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F59E0B",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
  },
  modalIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  modalDifficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
  },
  modalDifficultyText: {
    fontSize: 13,
    fontWeight: "600",
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 16,
  },
  modalRecordContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 20,
  },
  modalRecordText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalButtonSecondary: {
    borderWidth: 1,
  },
  modalButtonPrimary: {},
  modalButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
