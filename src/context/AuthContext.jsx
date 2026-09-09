import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  fetchCurrentViewer,
  fetchAniListUserAnime,
  updateAniListProgress,
} from "../services/anilist.service";
import { fetchMALUserAnime } from "../services/mal.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("anilist_token") || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("anime_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [animeLists, setAnimeLists] = useState(() => {
    try {
      const saved = localStorage.getItem("anime_lists");
      return saved
        ? JSON.parse(saved)
        : { current: [], completed: [], planning: [], paused: [], dropped: [] };
    } catch {
      return { current: [], completed: [], planning: [], paused: [], dropped: [] };
    }
  });

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  // Helper to persist user and lists
  const persistUserData = (userData, listsData) => {
    if (userData) {
      setUser(userData);
      localStorage.setItem("anime_user", JSON.stringify(userData));
    }
    if (listsData) {
      setAnimeLists(listsData);
      localStorage.setItem("anime_lists", JSON.stringify(listsData));
    }
  };

  /**
   * Sync in-progress entries to localStorage continueWatching
   */
  const syncToContinueWatching = useCallback((currentEntries, source = "anilist") => {
    if (!Array.isArray(currentEntries) || currentEntries.length === 0) return;

    try {
      const existing = JSON.parse(localStorage.getItem("continueWatching") || "[]");
      const updated = [...existing];

      currentEntries.forEach((item) => {
        const title =
          item.media?.title?.english ||
          item.media?.title?.romaji ||
          item.title ||
          "";
        if (!title) return;

        // Check if item already exists by alId, malId, or title
        const existingIdx = updated.findIndex(
          (ex) =>
            (item.media?.id && ex.alId === item.media.id) ||
            (item.media?.idMal && ex.malId === item.media.idMal) ||
            ex.title?.toLowerCase() === title.toLowerCase()
        );

        const progressNum = item.progress || 1;
        const entryData = {
          id: existingIdx >= 0 ? updated[existingIdx].id : item.media?.id ? `al-${item.media.id}` : `mal-${item.media?.idMal || Date.now()}`,
          episodeId: existingIdx >= 0 ? updated[existingIdx].episodeId : "",
          episodeNum: progressNum,
          title: title,
          japanese_title:
            item.media?.title?.native || item.media?.title?.romaji || title,
          poster:
            item.media?.coverImage?.large ||
            item.media?.coverImage?.extraLarge ||
            item.poster ||
            "",
          totalEpisodes: item.media?.episodes || null,
          alId: item.media?.id || null,
          malId: item.media?.idMal || null,
          source: source,
          updatedAt: Date.now(),
        };

        if (existingIdx >= 0) {
          // Update episode progress if imported is higher or keeps track
          updated[existingIdx] = {
            ...updated[existingIdx],
            ...entryData,
            // Preserve playback currentTime and duration if already watched locally
            currentTime: updated[existingIdx].currentTime || 0,
            duration: updated[existingIdx].duration || 0,
            episodeId: updated[existingIdx].episodeId || "",
          };
        } else {
          updated.push(entryData);
        }
      });

      localStorage.setItem("continueWatching", JSON.stringify(updated));
    } catch (err) {
      console.warn("Failed to sync continueWatching:", err);
    }
  }, []);

  /**
   * Handle OAuth Token from AniList Callback
   */
  const handleOAuthToken = useCallback(async (newToken) => {
    setLoading(true);
    setError(null);
    try {
      setToken(newToken);
      localStorage.setItem("anilist_token", newToken);

      // 1. Fetch viewer
      const viewer = await fetchCurrentViewer(newToken);
      if (!viewer) throw new Error("Could not retrieve AniList user profile");

      const userData = {
        id: viewer.id,
        name: viewer.name,
        avatar: viewer.avatar?.large || viewer.avatar?.medium || null,
        banner: viewer.bannerImage || null,
        statistics: viewer.statistics?.anime || {},
        provider: "anilist",
        isOAuth: true,
      };

      // 2. Fetch full list
      const collection = await fetchAniListUserAnime(viewer.id, newToken);
      const organizedLists = organizeAniListCollection(collection);

      persistUserData(userData, organizedLists);
      syncToContinueWatching(organizedLists.current, "anilist");

      return userData;
    } catch (err) {
      setError(err.message || "Failed to log in with AniList");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [syncToContinueWatching]);

  /**
   * Import from AniList by Username or ID (Public / No OAuth required)
   */
  const importFromAniList = useCallback(async (usernameOrId) => {
    setSyncing(true);
    setError(null);
    try {
      const collection = await fetchAniListUserAnime(usernameOrId);
      if (!collection) throw new Error(`AniList profile "${usernameOrId}" not found`);

      const aniUser = collection.user;
      const userData = {
        id: aniUser?.id || usernameOrId,
        name: aniUser?.name || usernameOrId,
        avatar: aniUser?.avatar?.large || aniUser?.avatar?.medium || null,
        banner: aniUser?.bannerImage || null,
        statistics: aniUser?.statistics?.anime || {},
        provider: "anilist",
        isOAuth: false,
      };

      const organizedLists = organizeAniListCollection(collection);
      persistUserData(userData, organizedLists);
      syncToContinueWatching(organizedLists.current, "anilist");

      return userData;
    } catch (err) {
      setError(err.message || "Failed to import AniList profile");
      throw err;
    } finally {
      setSyncing(false);
    }
  }, [syncToContinueWatching]);

  /**
   * Import from MyAnimeList by Username
   */
  const importFromMAL = useCallback(async (username) => {
    setSyncing(true);
    setError(null);
    try {
      const { user: malUser, entries } = await fetchMALUserAnime(username);

      const organizedLists = {
        current: entries.filter((e) => e.status === "CURRENT"),
        completed: entries.filter((e) => e.status === "COMPLETED"),
        planning: entries.filter((e) => e.status === "PLANNING"),
        paused: entries.filter((e) => e.status === "PAUSED"),
        dropped: entries.filter((e) => e.status === "DROPPED"),
      };

      const userData = {
        id: username,
        name: malUser.name || username,
        avatar: malUser.avatar || null,
        banner: null,
        statistics: malUser.statistics?.anime || {
          count: entries.length,
          meanScore: 0,
          episodesWatched: entries.reduce((acc, curr) => acc + (curr.progress || 0), 0),
        },
        provider: "myanimelist",
        isOAuth: false,
      };

      persistUserData(userData, organizedLists);
      syncToContinueWatching(organizedLists.current, "myanimelist");

      return userData;
    } catch (err) {
      setError(err.message || "Failed to import MyAnimeList profile");
      throw err;
    } finally {
      setSyncing(false);
    }
  }, [syncToContinueWatching]);

  /**
   * Login Redirect for AniList OAuth
   */
  const loginWithAniList = useCallback((customClientId = null) => {
    const clientId =
      customClientId ||
      import.meta.env.VITE_ANILIST_CLIENT_ID ||
      localStorage.getItem("anilist_client_id");

    if (!clientId) {
      // If no client id is set, direct the user to input one or use public username import
      throw new Error(
        "AniList Client ID is required for OAuth login. You can also import your list directly using your username or user ID!"
      );
    }

    const redirectUri = `${window.location.origin}/auth/callback`;
    const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${encodeURIComponent(
      clientId
    )}&response_type=token`;

    window.location.href = authUrl;
  }, []);

  /**
   * Log out
   */
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setAnimeLists({ current: [], completed: [], planning: [], paused: [], dropped: [] });
    localStorage.removeItem("anilist_token");
    localStorage.removeItem("anime_user");
    localStorage.removeItem("anime_lists");
  }, []);

  /**
   * Sync progress to AniList if logged in
   */
  const syncProgressToAniList = useCallback(
    async (mediaId, progress) => {
      if (!token || !mediaId || !progress) return;
      try {
        await updateAniListProgress(token, mediaId, progress);
      } catch (err) {
        console.warn("Failed to update progress on AniList:", err.message);
      }
    },
    [token]
  );

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        animeLists,
        loading,
        syncing,
        error,
        isAuthenticated: Boolean(token || user),
        isOAuth: Boolean(token && user?.isOAuth),
        loginWithAniList,
        handleOAuthToken,
        importFromAniList,
        importFromMAL,
        syncToContinueWatching,
        syncProgressToAniList,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Organizes AniList media collection into standard statuses
 */
function organizeAniListCollection(collection) {
  const result = {
    current: [],
    completed: [],
    planning: [],
    paused: [],
    dropped: [],
  };

  if (!collection?.lists) return result;

  collection.lists.forEach((list) => {
    const rawStatus = (list.status || list.name || "").toUpperCase();
    const entries = list.entries || [];

    if (rawStatus.includes("CURRENT") || rawStatus.includes("WATCHING")) {
      result.current.push(...entries);
    } else if (rawStatus.includes("COMPLETED")) {
      result.completed.push(...entries);
    } else if (rawStatus.includes("PLANNING") || rawStatus.includes("PLAN")) {
      result.planning.push(...entries);
    } else if (rawStatus.includes("PAUSED") || rawStatus.includes("HOLD")) {
      result.paused.push(...entries);
    } else if (rawStatus.includes("DROPPED")) {
      result.dropped.push(...entries);
    } else {
      // Fallback custom list
      result.current.push(...entries);
    }
  });

  return result;
}
