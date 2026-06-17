import { useEffect, useState } from "react";
import { SavedLesson } from "@/types/lesson";

const LESSON_HISTORY_KEY = "lessonHistory";

export function useLessonHistory() {
  const [history, setHistory] = useState<SavedLesson[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load history on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(LESSON_HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Failed to load lesson history:", err);
    }

    setMounted(true);
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    if (!mounted) return;

    try {
      localStorage.setItem(LESSON_HISTORY_KEY, JSON.stringify(history));
    } catch (err) {
      console.error("Failed to save lesson history:", err);
    }
  }, [history, mounted]);

  const addLesson = (lesson: SavedLesson) => {
    setHistory((prev) => {
      // Remove duplicate if it exists
      const filtered = prev.filter(
        (item) =>
          !(
            item.showId === lesson.showId &&
            item.seasonNumber === lesson.seasonNumber &&
            item.episodeNumber === lesson.episodeNumber
          ),
      );
      // Add new lesson to the front
      return [lesson, ...filtered];
    });
  };

  const removeLesson = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    history,
    addLesson,
    removeLesson,
    mounted,
  };
}
