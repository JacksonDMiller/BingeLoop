import { useEffect, useState } from "react";

export function useLocalStorageState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return defaultValue;
    }

    const saved = localStorage.getItem(key);

    if (!saved) {
      return defaultValue;
    }

    try {
      return JSON.parse(saved) as T;
    } catch {
      // Handle legacy non-JSON values
      return saved as T;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
