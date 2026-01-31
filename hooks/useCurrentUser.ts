import { useEffect, useState } from "react";

const CURRENT_USER_STORAGE_KEY = "currentUserName";
const DEFAULT_USER_NAME = "Guest";

export const useCurrentUser = () => {
  const [currentUserName, setCurrentUserName] = useState(() => {
    const storedName = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    return storedName ?? DEFAULT_USER_NAME;
  });

  useEffect(() => {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, currentUserName);
  }, [currentUserName]);

  return [currentUserName, setCurrentUserName] as const;
};
