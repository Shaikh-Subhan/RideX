import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ridex_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('ridex_access_token') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('ridex_refresh_token') || null);
  const [roles, setRoles] = useState(() => {
    try {
      const stored = localStorage.getItem('ridex_user');
      return stored ? JSON.parse(stored).roles || [] : [];
    } catch {
      return [];
    }
  });

  // Current active mode (e.g. renter or owner) for users with multiple roles
  const [currentRole, setCurrentRole] = useState(() => {
    const saved = localStorage.getItem('ridex_current_role');
    if (saved) return saved;
    try {
      const stored = localStorage.getItem('ridex_user');
      const uRoles = stored ? JSON.parse(stored).roles || [] : [];
      if (uRoles.includes('admin')) return 'admin';
      if (uRoles.includes('owner')) return 'owner';
      return 'renter';
    } catch {
      return 'renter';
    }
  });

  const [loading, setLoading] = useState(true);

  // Sync token and role to storage
  const handleAuthSuccess = (data) => {
    const { accessToken: newAccess, refreshToken: newRefresh, user: newUser, roles: newRoles } = data;
    const resolvedRoles = newRoles || newUser?.roles || [];

    setAccessToken(newAccess);
    setRefreshToken(newRefresh);
    setUser(newUser);
    setRoles(resolvedRoles);

    localStorage.setItem('ridex_access_token', newAccess);
    if (newRefresh) {
      localStorage.setItem('ridex_refresh_token', newRefresh);
    }
    localStorage.setItem('ridex_user', JSON.stringify(newUser));

    // Choose default active role
    let active = 'renter';
    if (resolvedRoles.includes('admin')) active = 'admin';
    else if (resolvedRoles.includes('owner')) active = 'owner';
    else if (resolvedRoles.includes('renter')) active = 'renter';

    setCurrentRole(active);
    localStorage.setItem('ridex_current_role', active);
  };

  const logout = useCallback(async () => {
    try {
      const storedRefresh = localStorage.getItem('ridex_refresh_token');
      if (storedRefresh) {
        await authApi.logout(storedRefresh).catch(() => {});
      }
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setRoles([]);
      setCurrentRole('renter');
      localStorage.removeItem('ridex_access_token');
      localStorage.removeItem('ridex_refresh_token');
      localStorage.removeItem('ridex_user');
      localStorage.removeItem('ridex_current_role');
    }
  }, []);

  // Listen for 401 expiration event from Axios interceptor
  useEffect(() => {
    const onAuthExpired = () => {
      logout();
    };
    window.addEventListener('ridex_auth_expired', onAuthExpired);
    return () => window.removeEventListener('ridex_auth_expired', onAuthExpired);
  }, [logout]);

  // Load user profile on mount if token exists
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('ridex_access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await authApi.getProfile();
        if (response?.user) {
          setUser(response.user);
          const uRoles = response.user.roles || [];
          setRoles(uRoles);
          localStorage.setItem('ridex_user', JSON.stringify(response.user));

          // Ensure current role is valid for user
          setCurrentRole((prev) => {
            if (uRoles.includes(prev)) return prev;
            if (uRoles.includes('admin')) return 'admin';
            if (uRoles.includes('owner')) return 'owner';
            return 'renter';
          });
        }
      } catch (err) {
        // If profile fetch fails completely and refresh also failed, logout
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [logout]);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    handleAuthSuccess(data);
    return data;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    handleAuthSuccess(data);
    return data;
  };

  const addRole = async (role) => {
    const data = await authApi.addRole(role);
    if (data?.user) {
      setUser(data.user);
      const updatedRoles = data.user.roles || [];
      setRoles(updatedRoles);
      localStorage.setItem('ridex_user', JSON.stringify(data.user));
      // Auto-switch to newly added role
      setCurrentRole(role);
      localStorage.setItem('ridex_current_role', role);
    }
    return data;
  };

  const switchRole = (role) => {
    if (roles.includes(role)) {
      setCurrentRole(role);
      localStorage.setItem('ridex_current_role', role);
    }
  };

  const hasRole = (role) => roles.includes(role);

  const updateProfile = async (updates) => {
    const data = await authApi.updateProfile(updates);
    if (data?.user) {
      setUser(data.user);
      localStorage.setItem('ridex_user', JSON.stringify(data.user));
    }
    return data;
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    roles,
    currentRole,
    loading,
    isAuthenticated: !!accessToken && !!user,
    hasRole,
    switchRole,
    login,
    register,
    logout,
    addRole,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
