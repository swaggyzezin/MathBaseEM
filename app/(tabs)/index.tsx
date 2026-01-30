import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useProgress } from "@/contexts/progress-context";
import { modules, Module } from "@/data/modules";
import { useColorScheme } from "@/hooks/use-color-scheme";

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  return (
    <View style={styles.progressBarContainer}>
      <View
        style={[
          styles.progressBarFill,
          { width: `${progress}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

function ModuleCard({
  module,
  colors,
  onPress,
  progress,
  watchedCount,
  index,
}: {
  module: Module;
  colors: typeof Colors.light;
  onPress: () => void;
  progress: number;
  watchedCount: number;
  index: number;
}) {
  const isCompleted = progress === 100;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.cardLeft}>
        <View
          style={[
            styles.moduleNumber,
            {
              backgroundColor: isCompleted
                ? module.color
                : colors.surfaceVariant,
            },
          ]}
        >
          {isCompleted ? (
            <MaterialIcons name="check" size={20} color="#FFF" />
          ) : (
            <Text
              style={[styles.moduleNumberText, { color: colors.textSecondary }]}
            >
              {index + 1}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {module.title}
        </Text>
        <Text
          style={[styles.cardDescription, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {module.description}
        </Text>

        <View style={styles.cardMeta}>
          <Text style={[styles.lessonsText, { color: colors.textSecondary }]}>
            {watchedCount} de {module.lessons.length} aulas
          </Text>
          {progress > 0 && (
            <View style={styles.progressWrapper}>
              <ProgressBar progress={progress} color={module.color} />
            </View>
          )}
        </View>
      </View>

      <MaterialIcons name="chevron-right" size={24} color={colors.icon} />
    </Pressable>
  );
}

export default function AulasScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { getModuleProgress, getWatchedCount } = useProgress();

  const handleModulePress = (module: Module) => {
    router.push(`/module/${module.id}` as any);
  };

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalWatched = modules.reduce((acc, m) => {
    const lessonIds = m.lessons.map((l) => l.id);
    return acc + getWatchedCount(lessonIds);
  }, 0);
  const totalProgress =
    totalLessons > 0 ? Math.round((totalWatched / totalLessons) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>
          Continue aprendendo
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>Matemática</Text>

        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.summaryContent}>
            <Text
              style={[styles.summaryLabel, { color: colors.textSecondary }]}
            >
              Seu progresso
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {totalWatched} de {totalLessons} aulas
            </Text>
          </View>
          <View style={styles.summaryProgress}>
            <Text style={[styles.summaryPercent, { color: colors.tint }]}>
              {totalProgress}%
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Módulos
        </Text>
      </View>

      <FlatList
        data={modules}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const lessonIds = item.lessons.map((l) => l.id);
          return (
            <ModuleCard
              module={item}
              colors={colors}
              onPress={() => handleModulePress(item)}
              progress={getModuleProgress(lessonIds)}
              watchedCount={getWatchedCount(lessonIds)}
              index={index}
            />
          );
        }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
    borderWidth: 1,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 2,
  },
  summaryProgress: {
    marginLeft: 16,
  },
  summaryPercent: {
    fontSize: 24,
    fontWeight: "700",
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
  cardLeft: {
    marginRight: 16,
  },
  moduleNumber: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  moduleNumberText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardContent: {
    flex: 1,
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
  lessonsText: {
    fontSize: 12,
  },
  progressWrapper: {
    flex: 1,
    maxWidth: 80,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#E8EAED",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
});
