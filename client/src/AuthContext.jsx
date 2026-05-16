import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { setVoterId } from './services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setVoterId(user.uid); // Ensure all future votes use verified UID
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      // We don't necessarily reset the voter ID because they fall back to anonymous,
      // but to be safe we can generate a new one or keep the last anonymous one.
      // Easiest is just remove it so a new anonymous one is created on next vote.
      localStorage.removeItem('pollish_voter_id');
    } catch (err) {
      console.error('Logout error', err);
    }
  }, []);

  // Track voted polls locally for anonymous limits
  const [votedPollIds, setVotedPollIds] = useState(() => {
    try {
      const stored = localStorage.getItem('pollish_voted_polls');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const markPollAsVoted = useCallback((pollId) => {
    setVotedPollIds((prev) => {
      if (prev.includes(pollId)) return prev;
      const next = [...prev, pollId];
      localStorage.setItem('pollish_voted_polls', JSON.stringify(next));
      return next;
    });
  }, []);

  // Rules: Logged in users can see any poll results.
  // Guests can only see the first poll they voted on.
  const canViewResults = useCallback((pollId) => {
    if (currentUser) return true; // Logged in
    if (votedPollIds.length === 0) return false; // Haven't voted at all
    return votedPollIds[0] === pollId; // Only true for the first poll they voted on
  }, [currentUser, votedPollIds]);

  const [loginModalOpened, setLoginModalOpened] = useState(false);
  const openLoginModal = () => setLoginModalOpened(true);
  const closeLoginModal = () => setLoginModalOpened(false);

  return (
    <AuthContext.Provider value={{
      currentUser,
      authLoading,
      logout,
      votedPollIds,
      markPollAsVoted,
      canViewResults,
      loginModalOpened,
      openLoginModal,
      closeLoginModal
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
