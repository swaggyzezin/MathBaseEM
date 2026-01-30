import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

import { Colors } from "@/constants/theme";
import { useProgress } from "@/contexts/progress-context";
import { getModuleById, getLessonById } from "@/data/modules";
import { useColorScheme } from "@/hooks/use-color-scheme";

const { width } = Dimensions.get("window");

function getYouTubeVideoId(url: string): string | null {
  const videoIdMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return videoIdMatch ? videoIdMatch[1] : null;
}

export default function LessonScreen() {
  const { moduleId, lessonId } = useLocalSearchParams<{
    moduleId: string;
    lessonId: string;
  }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { isWatched, toggleWatched } = useProgress();
  const [isReady, setIsReady] = useState(false);

  const onReady = useCallback(() => {
    setIsReady(true);
  }, []);

  const module = getModuleById(moduleId);
  const lesson = getLessonById(moduleId, lessonId);

  if (!module || !lesson) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: "Erro" }} />
        <Text
          style={{ color: colors.text, textAlign: "center", marginTop: 50 }}
        >
          Aula não encontrada
        </Text>
      </View>
    );
  }

  const lessonIndex = module.lessons.findIndex((l) => l.id === lessonId);
  const nextLesson = module.lessons[lessonIndex + 1];
  const prevLesson = module.lessons[lessonIndex - 1];
  const watched = isWatched(lessonId);

  const handleToggleWatched = () => {
    toggleWatched(lessonId);
  };

  const handleNextLesson = () => {
    if (nextLesson) {
      router.replace(`/lesson/${moduleId}/${nextLesson.id}` as any);
    }
  };

  const handlePrevLesson = () => {
    if (prevLesson) {
      router.replace(`/lesson/${moduleId}/${prevLesson.id}` as any);
    }
  };

  const videoId = getYouTubeVideoId(lesson.videoUrl);

  return (
    <>
      <Stack.Screen
        options={{
          title: lesson.title,
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text, fontSize: 16 },
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        <View style={styles.videoContainer}>
          {!isReady && (
            <View
              style={[
                styles.loadingContainer,
                { backgroundColor: colors.surfaceVariant },
              ]}
            >
              <MaterialIcons
                name="play-circle-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.loadingText, { color: colors.textSecondary }]}
              >
                Carregando...
              </Text>
            </View>
          )}
          {videoId ? (
            <YoutubePlayer
              height={(width * 9) / 16}
              width={width}
              videoId={videoId}
              onReady={onReady}
            />
          ) : (
            <View
              style={[
                styles.video,
                {
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#1a1a1a",
                },
              ]}
            >
              <MaterialIcons name="error-outline" size={48} color="#EF4444" />
              <Text style={{ color: "#EF4444", marginTop: 8 }}>
                Vídeo não disponível
              </Text>
            </View>
          )}
        </View>

        <View style={styles.lessonInfo}>
          <View style={styles.lessonHeader}>
            <Text
              style={[styles.lessonProgress, { color: colors.textSecondary }]}
            >
              Aula {lessonIndex + 1} de {module.lessons.length}
            </Text>
            <Text style={[styles.duration, { color: colors.textSecondary }]}>
              {lesson.duration}
            </Text>
          </View>

          <Text style={[styles.lessonTitle, { color: colors.text }]}>
            {lesson.title}
          </Text>

          {lesson.description ? (
            <Text
              style={[
                styles.lessonDescription,
                { color: colors.textSecondary },
              ]}
            >
              {lesson.description}
            </Text>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.watchedButton,
              {
                backgroundColor: watched ? module.color : colors.surface,
                borderColor: watched ? module.color : colors.border,
              },
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleToggleWatched}
          >
            <MaterialIcons
              name={watched ? "check-circle" : "radio-button-unchecked"}
              size={22}
              color={watched ? "#fff" : colors.textSecondary}
            />
            <Text
              style={[
                styles.watchedButtonText,
                { color: watched ? "#fff" : colors.text },
              ]}
            >
              {watched ? "Concluída" : "Marcar como concluída"}
            </Text>
          </Pressable>

          <View style={styles.navigation}>
            <Pressable
              style={({ pressed }) => [
                styles.navButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
                !prevLesson && styles.navButtonDisabled,
                pressed && prevLesson && { opacity: 0.7 },
              ]}
              onPress={handlePrevLesson}
              disabled={!prevLesson}
            >
              <MaterialIcons
                name="chevron-left"
                size={20}
                color={prevLesson ? colors.text : colors.textSecondary}
              />
              <Text
                style={[
                  styles.navButtonText,
                  { color: prevLesson ? colors.text : colors.textSecondary },
                ]}
              >
                Anterior
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.navButton,
                styles.navButtonNext,
                {
                  backgroundColor: nextLesson
                    ? module.color
                    : colors.icon + "30",
                },
                pressed && nextLesson && { opacity: 0.8 },
              ]}
              onPress={handleNextLesson}
              disabled={!nextLesson}
            >
              <Text
                style={[
                  styles.navButtonText,
                  { color: nextLesson ? "#fff" : colors.icon },
                ]}
              >
                {nextLesson ? "Próxima" : "Última aula"}
              </Text>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={nextLesson ? "#fff" : colors.icon}
              />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  videoContainer: {
    width: width,
    height: (width * 9) / 16,
    backgroundColor: "#000",
  },
  video: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
  },
  lessonInfo: {
    padding: 24,
  },
  lessonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  lessonProgress: {
    fontSize: 13,
    fontWeight: "500",
  },
  duration: {
    fontSize: 13,
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  watchedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 20,
  },
  watchedButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  navigation: {
    flexDirection: "row",
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  navButtonNext: {
    borderWidth: 0,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
