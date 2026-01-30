import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useProgress } from "@/contexts/progress-context";
import { getModuleById, Lesson } from "@/data/modules";
import { useColorScheme } from "@/hooks/use-color-scheme";

function LessonCard({
  lesson,
  index,
  colors,
  moduleColor,
  isWatched,
  onPress,
  onToggleWatched,
}: {
  lesson: Lesson;
  index: number;
  colors: typeof Colors.light;
  moduleColor: string;
  isWatched: boolean;
  onPress: () => void;
  onToggleWatched: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.lessonCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.lessonCardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.lessonLeft}>
        <View
          style={[
            styles.lessonNumber,
            {
              backgroundColor: isWatched ? moduleColor : colors.surfaceVariant,
            },
          ]}
        >
          {isWatched ? (
            <MaterialIcons name="check" size={16} color="#fff" />
          ) : (
            <Text
              style={[styles.lessonNumberText, { color: colors.textSecondary }]}
            >
              {index + 1}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.lessonContent}>
        <Text
          style={[
            styles.lessonTitle,
            { color: colors.text },
            isWatched && { opacity: 0.6 },
          ]}
        >
          {lesson.title}
        </Text>
        {lesson.description ? (
          <Text
            style={[styles.lessonDescription, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {lesson.description}
          </Text>
        ) : null}
        <View style={styles.lessonMeta}>
          <Text
            style={[styles.lessonMetaText, { color: colors.textSecondary }]}
          >
            {lesson.duration}
          </Text>
          {isWatched && (
            <View
              style={[
                styles.completedBadge,
                { backgroundColor: moduleColor + "15" },
              ]}
            >
              <Text style={[styles.completedText, { color: moduleColor }]}>
                Concluído
              </Text>
            </View>
          )}
        </View>
      </View>

      <MaterialIcons name="chevron-right" size={20} color={colors.icon} />
    </Pressable>
  );
}

export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { isWatched, toggleWatched, getModuleProgress, getWatchedCount } =
    useProgress();

  const module = getModuleById(id);

  if (!module) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: "Erro" }} />
        <Text
          style={{ color: colors.text, textAlign: "center", marginTop: 50 }}
        >
          Módulo não encontrado
        </Text>
      </View>
    );
  }

  const lessonIds = module.lessons.map((l) => l.id);
  const watchedCount = getWatchedCount(lessonIds);
  const progress = getModuleProgress(lessonIds);

  const handleLessonPress = (lesson: Lesson) => {
    router.push(`/lesson/${module.id}/${lesson.id}` as any);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: module.title,
          headerTintColor: module.color,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text },
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.moduleHeader,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.moduleHeaderTop}>
            <View style={styles.moduleInfo}>
              <Text style={[styles.moduleTitle, { color: colors.text }]}>
                {module.title}
              </Text>
              <Text
                style={[
                  styles.moduleDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {module.description}
              </Text>
            </View>
            <View
              style={[styles.progressCircle, { borderColor: module.color }]}
            >
              <Text style={[styles.progressPercent, { color: module.color }]}>
                {progress}%
              </Text>
            </View>
          </View>
          <View style={styles.progressBarLarge}>
            <View
              style={[
                styles.progressBarFillLarge,
                { width: `${progress}%`, backgroundColor: module.color },
              ]}
            />
          </View>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            {watchedCount} de {module.lessons.length} aulas concluídas
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Aulas
          </Text>
        </View>

        <FlatList
          data={module.lessons}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <LessonCard
              lesson={item}
              index={index}
              colors={colors}
              moduleColor={module.color}
              isWatched={isWatched(item.id)}
              onPress={() => handleLessonPress(item)}
              onToggleWatched={() => toggleWatched(item.id)}
            />
          )}
          contentContainerStyle={styles.lessonsList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  moduleHeader: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  moduleHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  moduleInfo: {
    flex: 1,
    marginRight: 16,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  moduleDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  progressCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: "700",
  },
  progressBarLarge: {
    height: 6,
    backgroundColor: "#E8EAED",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFillLarge: {
    height: "100%",
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
  },
  sectionHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  lessonsList: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  lessonCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  lessonCardPressed: {
    opacity: 0.7,
  },
  lessonLeft: {
    marginRight: 14,
  },
  lessonNumber: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  lessonNumberText: {
    fontWeight: "600",
    fontSize: 14,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  lessonDescription: {
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  lessonMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 10,
  },
  lessonMetaText: {
    fontSize: 12,
  },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  completedText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
