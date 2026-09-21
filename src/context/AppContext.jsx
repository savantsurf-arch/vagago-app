import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  INITIAL_USERS,
  INITIAL_VEHICLES,
  INITIAL_PARKING_SPACES,
  INITIAL_BOOKINGS,
  INITIAL_DEMAND_REGIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
  INITIAL_WITHDRAWALS,
  INITIAL_DAYS_OFF,
  ITABUNA_NEIGHBORHOODS,
  getGlobalParkingSpaces,
  registerGlobalParkingSpace
} from '../services/mockData';

import {
  calculateDistanceKm,
  formatDistance,
  estimateWalkingTime,
  estimateDrivingTime,
  geocodeAddress,
  calculateSmartParkOptions
} from '../services/geoUtils';
import { supabase, isSupabaseConfigured, fetchUsersFromSupabase } from '../services/supabaseClient';
import {
  fetchSpacesFromSupabase,
  publishSpaceToSupabase,
  deleteSpaceFromSupabase,
  registerUserInSupabase,
  updateUserProfileInSupabase,
  publishBookingToSupabase,
  fetchBookingsFromSupabase,
  updateBookingStatusInSupabase,
  subscribeToBookingsRealtime
} from '../services/supabaseService';




const AppContext = createContext();



export const AppProvider = ({ children }) => {
  // Enforce zero-state database cleanup for manual testing
  const VAGAGO_DB_VERSION = 'v2_clean_zero_state';
  if (typeof window !== 'undefined') {
    try {
      if (localStorage.getItem('vagago_db_version') !== VAGAGO_DB_VERSION) {
        localStorage.removeItem('vagago_parkingSpaces');
        localStorage.removeItem('vagago_users');
        localStorage.removeItem('vagago_bookings');
        localStorage.removeItem('vagago_vehicles');
        localStorage.removeItem('vagago_notifications');
        localStorage.removeItem('vagago_reviews');
        localStorage.removeItem('vagago_withdrawals');
        localStorage.removeItem('vagago_isAuthenticated');
        localStorage.removeItem('vagago_currentUser_email');
        localStorage.removeItem('vagago_authToken');
        localStorage.setItem('vagago_db_version', VAGAGO_DB_VERSION);
      }
    } catch (e) {}
  }

  // Clear legacy mock users on first run
  const LEGACY_EMAILS = ['matheus@cliente.com', 'juliana@proprietario.com', 'carlos@proprietario.com', 'admin@vagago.com.br'];


  // Users dataset - Only real registered users
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('vagago_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter(u => u && !LEGACY_EMAILS.includes(u.email?.toLowerCase()));
          if (filtered.length > 0) return filtered;
        }
      }
    } catch (e) {}
    return INITIAL_USERS;
  });

  // Active Role State
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('vagago_activeRole') || 'CLIENTE';
  });

  // AUTHENTICATION SYSTEM STATE - Defaults to false when not logged in
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const isAuth = localStorage.getItem('vagago_isAuthenticated') === 'true';
    const savedEmail = localStorage.getItem('vagago_currentUser_email');
    if (isAuth && savedEmail && !LEGACY_EMAILS.includes(savedEmail.toLowerCase())) {
      return true;
    }
    return false;
  });

  const [authToken, setAuthToken] = useState(() => {
    const isAuth = localStorage.getItem('vagago_isAuthenticated') === 'true';
    const savedEmail = localStorage.getItem('vagago_currentUser_email');
    if (isAuth && savedEmail && !LEGACY_EMAILS.includes(savedEmail.toLowerCase())) {
      return localStorage.getItem('vagago_authToken') || null;
    }
    return null;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const isAuth = localStorage.getItem('vagago_isAuthenticated') === 'true';
    const savedEmail = localStorage.getItem('vagago_currentUser_email');
    if (isAuth && savedEmail && !LEGACY_EMAILS.includes(savedEmail.toLowerCase())) {
      const cleanEmail = savedEmail.toLowerCase();
      let userObj = null;

      // 1. Try dedicated vagago_currentUser
      try {
        const savedCurrent = localStorage.getItem('vagago_currentUser');
        if (savedCurrent) {
          const parsed = JSON.parse(savedCurrent);
          if (parsed && parsed.email?.toLowerCase() === cleanEmail) {
            userObj = parsed;
          }
        }
      } catch (e) {}

      // 2. Try from vagago_users
      if (!userObj) {
        try {
          const saved = localStorage.getItem('vagago_users');
          if (saved) {
            const parsed = JSON.parse(saved);
            const found = parsed.find(u => u && u.email?.toLowerCase() === cleanEmail);
            if (found) userObj = found;
          }
        } catch (e) {}
      }

      if (userObj) {
        // Enforce dedicated avatar cache if available
        try {
          const savedAvatar = localStorage.getItem(`vagago_avatar_${cleanEmail}`);
          if (savedAvatar) {
            userObj.avatar = savedAvatar;
          }
        } catch (e) {}
        return userObj;
      }
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // login, register, forgot
  const [suggestedAccountType, setSuggestedAccountType] = useState('CLIENTE');
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  const openLoginModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = (preferredRole) => {
    const detected = preferredRole || (activeTab === 'host_landing' || activeRole === 'PROPRIETÁRIO' ? 'PROPRIETÁRIO' : 'CLIENTE');
    setSuggestedAccountType(detected);
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  const openEditProfileModal = () => {
    setIsEditProfileModalOpen(true);
  };

  const updateUserProfile = async (updatedData) => {
    if (!currentUser) return null;
    const cleanEmail = (currentUser.email || '').toLowerCase().trim();
    const updatedAvatar = updatedData.avatar !== undefined ? updatedData.avatar : currentUser.avatar;

    // Cache avatar specifically in localStorage
    if (updatedAvatar) {
      try {
        localStorage.setItem(`vagago_avatar_${cleanEmail}`, updatedAvatar);
      } catch (e) {}
    }

    const updated = {
      ...currentUser,
      ...updatedData,
      avatar: updatedAvatar
    };

    // 1. Update React state immediately
    setCurrentUser(updated);
    setUsers(prev => {
      const updatedList = prev.map(u => (u.email?.toLowerCase() === cleanEmail || u.id === currentUser.id) ? updated : u);
      try {
        localStorage.setItem('vagago_users', JSON.stringify(updatedList));
      } catch (e) {}
      return updatedList;
    });

    // 2. Persist currentUser in localStorage synchronously
    try {
      localStorage.setItem('vagago_currentUser', JSON.stringify(updated));
      localStorage.setItem('vagago_currentUser_email', updated.email || currentUser.email);
    } catch (e) {}

    // 3. Update any parking spaces owned by this host with the new photo
    setParkingSpaces(prev => {
      const updatedSpaces = prev.map(s => {
        const isOwner = (s.ownerId && s.ownerId === currentUser.id) ||
                        (s.owner_id && s.owner_id === currentUser.id) ||
                        (s.ownerEmail && s.ownerEmail.toLowerCase() === cleanEmail) ||
                        (s.owner_email && s.owner_email.toLowerCase() === cleanEmail);
        if (isOwner) {
          return {
            ...s,
            ownerAvatar: updatedAvatar,
            owner_avatar: updatedAvatar,
            ownerName: updated.name || s.ownerName,
            ownerPhone: updated.phone || s.ownerPhone
          };
        }
        return s;
      });
      try {
        localStorage.setItem('vagago_parkingSpaces', JSON.stringify(updatedSpaces));
      } catch (e) {}
      return updatedSpaces;
    });

    // 4. Update bookings involving this user
    setBookings(prev => {
      const updatedBookings = prev.map(b => {
        let modified = { ...b };
        if (b.userId === currentUser.id || b.user_id === currentUser.id || (b.driverEmail && b.driverEmail.toLowerCase() === cleanEmail)) {
          modified.userAvatar = updatedAvatar;
          modified.user_avatar = updatedAvatar;
          modified.driverAvatar = updatedAvatar;
          modified.driver_avatar = updatedAvatar;
        }
        if (b.hostId === currentUser.id || b.host_id === currentUser.id || b.ownerId === currentUser.id) {
          modified.hostAvatar = updatedAvatar;
          modified.host_avatar = updatedAvatar;
          modified.ownerAvatar = updatedAvatar;
          modified.owner_avatar = updatedAvatar;
        }
        return modified;
      });
      try {
        localStorage.setItem('vagago_bookings', JSON.stringify(updatedBookings));
      } catch (e) {}
      return updatedBookings;
    });

    // 5. Asynchronously persist to Supabase Cloud users table
    if (isSupabaseConfigured) {
      try {
        await updateUserProfileInSupabase(updated);
      } catch (cloudErr) {
        console.warn('Notice: Supabase background user profile sync:', cloudErr);
      }
    }

    return updated;
  };

  // Keep currentUser synced in localStorage
  useEffect(() => {
    if (currentUser && currentUser.email) {
      try {
        localStorage.setItem('vagago_currentUser', JSON.stringify(currentUser));
        localStorage.setItem('vagago_currentUser_email', currentUser.email);
        if (currentUser.avatar) {
          localStorage.setItem(`vagago_avatar_${currentUser.email.toLowerCase()}`, currentUser.avatar);
        }
      } catch (e) {}
    }
  }, [currentUser]);

  // Sync Role & Save Users
  useEffect(() => {
    localStorage.setItem('vagago_activeRole', activeRole);
  }, [activeRole]);

  useEffect(() => {
    try {
      localStorage.setItem('vagago_users', JSON.stringify(users));
    } catch (e) {}
  }, [users]);

  const switchRole = (newRole) => {
    setActiveRole(newRole);
    localStorage.setItem('vagago_activeRole', newRole);
    if (currentUser) {
      const updatedUser = { ...currentUser, role: newRole };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.email === currentUser.email ? updatedUser : u));
    }
  };

  // Auth Methods - Clean Real Authentication
  const login = async (emailInput, passwordInput) => {
    const cleanEmail = (emailInput || '').trim().toLowerCase();

    if (!cleanEmail) return false;

    // Search in local registered users
    let foundUser = users.find(u => u && u.email?.toLowerCase() === cleanEmail);

    // If not found locally, try fetching from Supabase Cloud users table
    if (!foundUser && isSupabaseConfigured) {
      try {
        const cloudUsers = await fetchUsersFromSupabase();
        if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
          const cloudFound = cloudUsers.find(u => u && u.email?.toLowerCase() === cleanEmail && !LEGACY_EMAILS.includes(cleanEmail));
          if (cloudFound) {
            foundUser = cloudFound;
            setUsers(prev => [foundUser, ...prev.filter(u => u.email !== cleanEmail)]);
          }
        }
      } catch (e) {}
    }

    if (!foundUser) {
      return false;
    }

    let resolvedUser = foundUser;
    try {
      const savedAvatar = localStorage.getItem(`vagago_avatar_${cleanEmail}`);
      if (savedAvatar) {
        resolvedUser = { ...resolvedUser, avatar: savedAvatar };
      }
    } catch (e) {}

    setCurrentUser(resolvedUser);
    const userRole = resolvedUser.role || 'CLIENTE';
    setActiveRole(userRole);
    setIsAuthenticated(true);
    const token = `jwt_token_${Date.now()}`;
    setAuthToken(token);
    try {
      localStorage.setItem('vagago_isAuthenticated', 'true');
      localStorage.setItem('vagago_authToken', token);
      localStorage.setItem('vagago_currentUser_email', resolvedUser.email);
      localStorage.setItem('vagago_currentUser', JSON.stringify(resolvedUser));
      localStorage.setItem('vagago_activeRole', userRole);
    } catch (e) {}

    if (userRole === 'PROPRIETÁRIO') {
      setActiveTab('owner_dashboard');
    }

    return true;
  };

  const register = async (newUserData) => {
    const newId = `usr_${Date.now()}`;
    const cleanEmail = (newUserData.email || '').trim().toLowerCase();
    const newUser = {
      id: newId,
      name: newUserData.name || cleanEmail.split('@')[0],
      email: cleanEmail,
      role: newUserData.role || 'CLIENTE',
      phone: newUserData.phone || '(73) 99123-4567',
      cpf: newUserData.cpf || '000.000.000-00',
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80",
      status: "Ativo",
      referralCode: `VAGA${Math.floor(1000 + Math.random() * 9000)}`,
      credits: 20,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [newUser, ...prev.filter(u => u.email !== cleanEmail)]);
    setCurrentUser(newUser);
    setActiveRole(newUser.role);
    setIsAuthenticated(true);
    const token = `jwt_token_${Date.now()}`;
    setAuthToken(token);
    try {
      localStorage.setItem('vagago_isAuthenticated', 'true');
      localStorage.setItem('vagago_authToken', token);
      localStorage.setItem('vagago_currentUser_email', cleanEmail);
      localStorage.setItem('vagago_currentUser', JSON.stringify(newUser));
      localStorage.setItem('vagago_activeRole', newUser.role);
    } catch (e) {}

    if (newUser.role === 'PROPRIETÁRIO') {
      setActiveTab('owner_dashboard');
    }

    try {
      await registerUserInSupabase(newUser);
    } catch (e) {
      console.warn("Notice registering user to cloud:", e);
    }

    return newUser;
  };


  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthToken(null);
    setActiveRole('CLIENTE');
    try {
      localStorage.removeItem('vagago_isAuthenticated');
      localStorage.removeItem('vagago_authToken');
      localStorage.removeItem('vagago_currentUser_email');
      localStorage.removeItem('vagago_currentUser');
      localStorage.setItem('vagago_activeRole', 'CLIENTE');
    } catch (e) {}
    setActiveTab('landing');
  };



  const resetPassword = (emailInput, newPassword) => {
    console.log(`Password reset for ${emailInput} to ${newPassword}`);
  };

  // Main Repositories - Protected with Strict Array & Try/Catch Guards
  const [parkingSpaces, setParkingSpaces] = useState(() => {
    try {
      const saved = localStorage.getItem('vagago_parkingSpaces');
      if (saved) {
        if (saved.includes('Carlos') || saved.includes('juliana@proprietario.com') || saved.includes('carlos@proprietario.com')) {
          localStorage.removeItem('vagago_parkingSpaces');
          return INITIAL_PARKING_SPACES;
        }
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_PARKING_SPACES;
  });


  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('vagago_bookings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return INITIAL_BOOKINGS;
  });

  const [vehicles, setVehicles] = useState(() => {
    try {
      const saved = localStorage.getItem('vagago_vehicles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return INITIAL_VEHICLES;
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('vagago_favorites');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return ['spc_1'];
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('vagago_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return INITIAL_NOTIFICATIONS;
  });

  const [notificationPreferences, setNotificationPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('vagago_notification_preferences');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return {
      bookings: true,
      payments: true,
      reminders: true,
      system: true
    };
  });

  const [liveToast, setLiveToast] = useState(null);
  const clearLiveToast = () => setLiveToast(null);

  const updateNotificationPreferences = (newPrefs) => {
    setNotificationPreferences(prev => {
      const updated = { ...prev, ...newPrefs };
      try {
        localStorage.setItem('vagago_notification_preferences', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const addNotification = useCallback((notif) => {
    if (!notif) return;

    // Check user preferences
    if (notif.category === 'bookings' && notificationPreferences?.bookings === false) return;
    if (notif.category === 'payments' && notificationPreferences?.payments === false) return;
    if (notif.category === 'system' && notificationPreferences?.system === false) return;

    setNotifications(prev => {
      // Idempotency: prevent duplicates with same relatedId & type or same title & message for target user
      const isDuplicate = prev.some(existing => 
        (existing.id && notif.id && existing.id === notif.id) ||
        (existing.relatedId && notif.relatedId && existing.relatedId === notif.relatedId && existing.type === notif.type) ||
        (existing.title === notif.title && existing.message === notif.message && (existing.userId === notif.userId || existing.userEmail === notif.userEmail))
      );
      if (isDuplicate) return prev;

      const newNotif = {
        id: notif.id || `not_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        read: false,
        timestamp: 'Agora mesmo',
        createdAt: new Date().toISOString(),
        category: notif.category || 'system',
        ...notif
      };

      // Trigger live toast if relevant to active logged in user
      const isForMe = !newNotif.userId || 
        (currentUser && (
          newNotif.userId === currentUser.id || 
          newNotif.targetUserId === currentUser.id || 
          (newNotif.userEmail && currentUser.email && newNotif.userEmail.toLowerCase() === currentUser.email.toLowerCase())
        ));

      if (isForMe && notif.silent !== true) {
        setLiveToast(newNotif);
      }

      return [newNotif, ...prev];
    });
  }, [notificationPreferences, currentUser]);

  const markNotificationAsRead = (notifId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, read: true } : n)
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const [coupons, setCoupons] = useState(() => {
    try {
      const saved = localStorage.getItem('vagago_coupons');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return INITIAL_COUPONS;
  });

  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem('vagago_reviews');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return INITIAL_REVIEWS;
  });

  const [demandRegions] = useState(INITIAL_DEMAND_REGIONS);

    const [withdrawals, setWithdrawals] = useState(() => {
    try {
      const saved = localStorage.getItem('vagago_withdrawals');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return INITIAL_WITHDRAWALS;
  });

  // DAYS OFF — Dias de Isenção de Taxa da Plataforma (0% comissão VagaGo para novas reservas)
  const [daysOff, setDaysOff] = useState(() => {
    try {
      const saved = localStorage.getItem('vagago_daysOff');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_DAYS_OFF;
  });


  // PERSISTENCE EFFECTS - Save all user actions, balances, bookings, withdrawals to localStorage & sync
  useEffect(() => {
    try {
      localStorage.setItem('vagago_users', JSON.stringify(users));
    } catch (e) {}
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('vagago_parkingSpaces', JSON.stringify(parkingSpaces));
    } catch (e) {}
  }, [parkingSpaces]);

  useEffect(() => {
    try {
      localStorage.setItem('vagago_bookings', JSON.stringify(bookings));
    } catch (e) {}
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem('vagago_vehicles', JSON.stringify(vehicles));
    } catch (e) {}
  }, [vehicles]);

  useEffect(() => {
    try {
      localStorage.setItem('vagago_favorites', JSON.stringify(favorites));
    } catch (e) {}
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('vagago_notifications', JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

    useEffect(() => {
    try {
      localStorage.setItem('vagago_coupons', JSON.stringify(coupons));
    } catch (e) {}
  }, [coupons]);

  useEffect(() => {
    try {
      localStorage.setItem('vagago_daysOff', JSON.stringify(daysOff));
    } catch (e) {}
  }, [daysOff]);

  useEffect(() => {
    try {
      localStorage.setItem('vagago_withdrawals', JSON.stringify(withdrawals));
    } catch (e) {}
  }, [withdrawals]);


  // REAL-TIME SYNC - Synchronize newly published spaces and bookings across all browser tabs & devices
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'vagago_parkingSpaces' && e.newValue) {
        try {
          const updatedSpaces = JSON.parse(e.newValue);
          setParkingSpaces(updatedSpaces);
        } catch (err) {}
      }
      if (e.key === 'vagago_bookings' && e.newValue) {
        try {
          const updatedBookings = JSON.parse(e.newValue);
          if (Array.isArray(updatedBookings)) {
            setBookings(updatedBookings);
          }
        } catch (err) {}
      }
      if (e.key === 'vagago_notifications' && e.newValue) {
        try {
          const updatedNotifs = JSON.parse(e.newValue);
          if (Array.isArray(updatedNotifs)) {
            setNotifications(updatedNotifs);
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // SUPABASE CLOUD & REALTIME SYNC EFFECT - Fetch cloud spaces, users and bookings on mount
  useEffect(() => {
    let spacesChannel;
    let bookingsChannel;

    const syncCloudData = async () => {
      const cloudSpaces = await fetchSpacesFromSupabase();
      if (cloudSpaces && cloudSpaces.length > 0) {
        setParkingSpaces(cloudSpaces);
        cloudSpaces.forEach(s => registerGlobalParkingSpace(s));
      }

      const cloudBookings = await fetchBookingsFromSupabase();
      if (cloudBookings && cloudBookings.length > 0) {
        setBookings(prev => {
          const mergedMap = new Map();
          prev.forEach(b => mergedMap.set(b.id || b.bookingNumber, b));
          cloudBookings.forEach(cb => mergedMap.set(cb.id || cb.bookingNumber, cb));
          return Array.from(mergedMap.values());
        });
      }

      const cloudUsers = await fetchUsersFromSupabase();
      if (cloudUsers && cloudUsers.length > 0) {
        setUsers(prev => {
          const mergedMap = new Map();
          prev.forEach(u => mergedMap.set((u.email || u.id || '').toLowerCase(), u));
          cloudUsers.forEach(cu => {
            const cleanEmail = (cu.email || cu.id || '').toLowerCase();
            const existing = prev.find(p => p.email?.toLowerCase() === cleanEmail || p.id === cu.id);

            let localAvatar = null;
            try {
              localAvatar = localStorage.getItem(`vagago_avatar_${cleanEmail}`);
            } catch (e) {}

            const resolvedAvatar = localAvatar || cu.avatar || existing?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80';

            const normalized = {
              id: cu.id,
              name: cu.name || existing?.name || 'Usuário VagaGo',
              email: cu.email,
              role: cu.role || existing?.role || 'CLIENTE',
              phone: cu.phone || existing?.phone || '(73) 98765-4321',
              avatar: resolvedAvatar,
              cpf: cu.cpf || existing?.cpf,
              pixKey: cu.pix_key || cu.pixKey || existing?.pixKey,
              bio: existing?.bio || '',
              credits: cu.credits !== undefined ? cu.credits : (existing?.credits || 20),
              status: cu.status || existing?.status || 'Ativo',
              createdAt: cu.created_at || cu.createdAt || existing?.createdAt
            };
            mergedMap.set(cleanEmail, normalized);
          });
          const mergedUsers = Array.from(mergedMap.values());
          try {
            localStorage.setItem('vagago_users', JSON.stringify(mergedUsers));
          } catch (e) {}
          return mergedUsers;
        });

        // Also update currentUser if currently logged in
        setCurrentUser(prevUser => {
          if (!prevUser || !prevUser.email) return prevUser;
          const cleanEmail = prevUser.email.toLowerCase();
          const matchingCloud = cloudUsers.find(cu => cu.email?.toLowerCase() === cleanEmail || cu.id === prevUser.id);
          if (!matchingCloud) return prevUser;

          let localAvatar = null;
          try {
            localAvatar = localStorage.getItem(`vagago_avatar_${cleanEmail}`);
          } catch (e) {}

          const finalAvatar = localAvatar || prevUser.avatar || matchingCloud.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80';

          const updatedCurrent = {
            ...prevUser,
            name: matchingCloud.name || prevUser.name,
            phone: matchingCloud.phone || prevUser.phone,
            role: matchingCloud.role || prevUser.role,
            credits: matchingCloud.credits !== undefined ? matchingCloud.credits : prevUser.credits,
            pixKey: matchingCloud.pix_key || prevUser.pixKey,
            avatar: finalAvatar
          };
          try {
            localStorage.setItem('vagago_currentUser', JSON.stringify(updatedCurrent));
          } catch (e) {}
          return updatedCurrent;
        });
      }
    };

    syncCloudData();

    if (isSupabaseConfigured) {
      try {
        spacesChannel = supabase
          .channel('public:parking_spaces')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_spaces' }, async () => {
            const updatedCloudSpaces = await fetchSpacesFromSupabase();
            if (updatedCloudSpaces && updatedCloudSpaces.length > 0) {
              setParkingSpaces(updatedCloudSpaces);
              updatedCloudSpaces.forEach(s => registerGlobalParkingSpace(s));
            }
          })
          .subscribe();

        bookingsChannel = subscribeToBookingsRealtime(
          (newBooking) => {
            setBookings(prev => {
              const exists = prev.some(b => b.id === newBooking.id || b.bookingNumber === newBooking.bookingNumber);
              if (exists) return prev;
              return [newBooking, ...prev];
            });

            if (newBooking) {
              const hId = newBooking.hostId || newBooking.host_id || newBooking.ownerId || newBooking.owner_id;
              const hEmail = newBooking.hostEmail || newBooking.host_email || newBooking.ownerEmail;
              addNotification({
                id: `not_rt_${newBooking.id || newBooking.bookingNumber || Date.now()}`,
                relatedId: newBooking.bookingNumber || newBooking.id,
                userId: hId,
                userEmail: hEmail,
                targetUserId: hId,
                category: 'bookings',
                type: 'new_booking',
                title: '🔔 Nova Reserva Recebida (Tempo Real)!',
                message: `${newBooking.driverName || 'Um motorista'} reservou a vaga "${newBooking.parkingTitle || newBooking.spaceTitle || 'em Itabuna'}" para ${newBooking.date || newBooking.startDate}.`,
                actionText: 'Ver Reservas',
                actionTab: 'owner_reservas'
              });
            }
          },
          (updatedBooking) => {
            setBookings(prev =>
              prev.map(b => (b.id === updatedBooking.id || b.bookingNumber === updatedBooking.bookingNumber) ? updatedBooking : b)
            );

            if (updatedBooking) {
              const bStatus = updatedBooking.bookingStatus || updatedBooking.status;
              const dId = updatedBooking.userId || updatedBooking.driverId || updatedBooking.driver_id;
              const dEmail = updatedBooking.userEmail || updatedBooking.driverEmail || updatedBooking.driver_email;
              const hId = updatedBooking.hostId || updatedBooking.host_id || updatedBooking.ownerId || updatedBooking.owner_id;
              const hEmail = updatedBooking.hostEmail || updatedBooking.host_email || updatedBooking.ownerEmail;

              if (bStatus === 'Confirmado') {
                addNotification({
                  id: `not_rt_conf_${updatedBooking.id || updatedBooking.bookingNumber}`,
                  relatedId: updatedBooking.bookingNumber || updatedBooking.id,
                  userId: dId,
                  userEmail: dEmail,
                  targetUserId: dId,
                  category: 'bookings',
                  type: 'booking_approved',
                  title: '✅ Reserva Confirmada!',
                  message: `Sua reserva na vaga "${updatedBooking.parkingTitle || updatedBooking.spaceTitle || 'em Itabuna'}" foi confirmada!`,
                  actionText: 'Acessar Comprovante',
                  actionTab: 'client_dashboard'
                });
              } else if (bStatus === 'Recusado') {
                addNotification({
                  id: `not_rt_rec_${updatedBooking.id || updatedBooking.bookingNumber}`,
                  relatedId: updatedBooking.bookingNumber || updatedBooking.id,
                  userId: dId,
                  userEmail: dEmail,
                  targetUserId: dId,
                  category: 'bookings',
                  type: 'booking_rejected',
                  title: '❌ Reserva Não Aprovada',
                  message: `A solicitação de reserva na vaga "${updatedBooking.parkingTitle || updatedBooking.spaceTitle || 'em Itabuna'}" não pôde ser aceita.`,
                  actionText: 'Buscar Outras Vagas',
                  actionTab: 'search'
                });
              } else if (bStatus === 'Cancelado') {
                addNotification({
                  id: `not_rt_canc_${updatedBooking.id || updatedBooking.bookingNumber}`,
                  relatedId: updatedBooking.bookingNumber || updatedBooking.id,
                  userId: hId,
                  userEmail: hEmail,
                  targetUserId: hId,
                  category: 'bookings',
                  type: 'booking_cancelled',
                  title: '⚠️ Uma Reserva Foi Cancelada',
                  message: `A reserva #${updatedBooking.bookingNumber} na sua vaga foi cancelada pelo motorista.`,
                  actionText: 'Ver Reservas',
                  actionTab: 'owner_reservas'
                });
              }
            }
          }
        );
      } catch (e) {
        console.warn("Realtime subscription notice:", e);
      }
    }

    return () => {
      if (spacesChannel) supabase.removeChannel(spacesChannel);
      if (bookingsChannel) supabase.removeChannel(bookingsChannel);
    };
  }, [addNotification]);





  // GEOLOCATION STATE - Defaulted to Pilot Launch City: ITABUNA - BA
  const [userLocation, setUserLocation] = useState({
    lat: -14.7966,
    lng: -39.2789,
    isLive: false,
    addressName: "Centro, Itabuna - BA (Cidade Piloto)",
    error: null
  });

  const requestUserLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          isLive: true,
          addressName: "Sua Posição Atual (GPS)",
          error: null
        });
      },
      (err) => {
        console.warn("Geolocation blocked, using default pilot city: Itabuna - BA");
      }
    );
  };

    // Selected & Modal State
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [isSpotDetailsOpen, setIsSpotDetailsOpen] = useState(false);
  const [isBookingFlowOpen, setIsBookingFlowOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddSpotModalOpen, setIsAddSpotModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState(null);

  // URL / Route synchronization supporting dedicated /admin and #admin
  const [activeTab, setActiveTabState] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || path === '/admin/' || hash === '#admin' || hash === '#/admin') {
        return 'admin_dashboard';
      }
    }
    return 'landing';
  });
  const [isPageLoading, setIsPageLoading] = useState(false);

  const setActiveTab = (newTab) => {
    if (newTab === activeTab) return;
    setIsPageLoading(true);
    setActiveTabState(newTab);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (newTab === 'admin_dashboard') {
        window.history.pushState(null, '', '#admin');
      } else if (window.location.hash === '#admin') {
        window.history.pushState(null, '', window.location.pathname);
      }
    }
    setTimeout(() => {
      setIsPageLoading(false);
    }, 260);
  };

  // Listen to popstate & hashchange for direct navigation to /admin
  useEffect(() => {
    const handleUrlSync = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname.toLowerCase();
        const hash = window.location.hash.toLowerCase();
        if (path === '/admin' || path === '/admin/' || hash === '#admin' || hash === '#/admin') {
          setActiveTabState('admin_dashboard');
        }
      }
    };
    window.addEventListener('popstate', handleUrlSync);
    window.addEventListener('hashchange', handleUrlSync);
    return () => {
      window.removeEventListener('popstate', handleUrlSync);
      window.removeEventListener('hashchange', handleUrlSync);
    };
  }, []);


  // Search State - Defaulted to Itabuna, BA
  const [searchLocation, setSearchLocation] = useState('Itabuna, BA');
  const [distanceRadius, setDistanceRadius] = useState('all');
  const [searchFilters, setSearchFilters] = useState({
    dateType: 'hoje',
    billingType: 'hora',
    date: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '18:00',
    vehicleType: 'Todos',
    accessHours: 'ALL', // ALL, 24H, COMMERCIAL
    coveredOnly: false,
    hasCamera: false,

    hasEVCharger: false,
    hasGate: false,
    has24h: false,
    maxPrice: 50
  });

  const handleSearchLocationChange = (query) => {
    setSearchLocation(query);
    const geocoded = geocodeAddress(query);
    if (geocoded) {
      setUserLocation(prev => ({
        ...prev,
        lat: geocoded.lat,
        lng: geocoded.lng,
        addressName: geocoded.name
      }));
    }
  };

  const enrichedParkingSpaces = (parkingSpaces || []).map(spot => {
    if (!spot) return null;
    const spotLat = Number(spot.lat || -14.7966);
    const spotLng = Number(spot.lng || -39.2789);
    const userLat = Number(userLocation?.lat || -14.7966);
    const userLng = Number(userLocation?.lng || -39.2789);

    const distKm = calculateDistanceKm(userLat, userLng, spotLat, spotLng);
    return {
      ...spot,
      lat: spotLat,
      lng: spotLng,
      calculatedDistKm: distKm,
      distFormatted: formatDistance(distKm),
      walkTime: estimateWalkingTime(distKm),
      driveTime: estimateDrivingTime(distKm)
    };
  }).filter(Boolean);

  const sortedParkingSpaces = [...enrichedParkingSpaces].sort((a, b) => (a.calculatedDistKm || 0) - (b.calculatedDistKm || 0));
  const smartParkOptions = calculateSmartParkOptions(parkingSpaces || [], userLocation?.lat || -14.7966, userLocation?.lng || -39.2789);


  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('vagago_users', JSON.stringify(users));
  }, [users]);



  useEffect(() => {
    localStorage.setItem('vagago_parkingSpaces', JSON.stringify(parkingSpaces));
  }, [parkingSpaces]);

  useEffect(() => {
    localStorage.setItem('vagago_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('vagago_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('vagago_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('vagago_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('vagago_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('vagago_withdrawals', JSON.stringify(withdrawals));
  }, [withdrawals]);

  // Handlers & Engine
  const toggleFavorite = (spotId) => {
    setFavorites(prev => prev.includes(spotId) ? prev.filter(id => id !== spotId) : [...prev, spotId]);
  };

  // AVAILABILITY ENGINE - Prevents double bookings and time slot conflicts
  const checkAvailability = (spaceId, date, startTime, endTime) => {
    if (!spaceId || !date || !startTime || !endTime) {
      return { available: false, reason: 'Informações de data ou horário incompletas.' };
    }

    const spot = parkingSpaces.find(s => s.id === spaceId);
    if (!spot) {
      return { available: false, reason: 'Vaga não encontrada.' };
    }

    if (spot.status === 'Pausada' || spot.isAvailable === false) {
      return { available: false, reason: 'Este anúncio está pausado temporariamente pelo anfitrião.' };
    }

    const toMinutes = (timeStr) => {
      const [h, m] = (timeStr || '00:00').split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    const reqStart = toMinutes(startTime);
    const reqEnd = toMinutes(endTime);

    if (reqEnd <= reqStart) {
      return { available: false, reason: 'O horário de saída deve ser posterior ao horário de entrada.' };
    }

    // Check conflict with existing active/pending bookings for same spot and date
    const conflictingBooking = bookings.find(b => {
      if (b.spaceId !== spaceId || b.date !== date) return false;
      if (b.bookingStatus === 'Cancelado' || b.bookingStatus === 'Recusado') return false;

      const bStart = toMinutes(b.startTime);
      const bEnd = toMinutes(b.endTime);

      const hasOverlap = !(reqEnd <= bStart || reqStart >= bEnd);
      return hasOverlap;
    });

    if (conflictingBooking) {
      return {
        available: false,
        reason: `Horário indisponível! Já existe uma reserva (${conflictingBooking.startTime} às ${conflictingBooking.endTime}). Escolha outro horário.`
      };
    }

    return { available: true };
  };

  const pauseParkingSpace = async (spotId) => {
    setParkingSpaces(prev => prev.map(s => s.id === spotId ? { ...s, status: 'Pausada', isAvailable: false } : s));
    const target = parkingSpaces.find(s => s.id === spotId);
    try {
      const saved = localStorage.getItem('vagago_parkingSpaces');
      if (saved) {
        const parsed = JSON.parse(saved);
        const updated = parsed.map(s => s.id === spotId ? { ...s, status: 'Pausada', isAvailable: false } : s);
        localStorage.setItem('vagago_parkingSpaces', JSON.stringify(updated));
      }
    } catch (e) {}
    try {
      if (isSupabaseConfigured) {
        await supabase.from('parking_spaces').update({ status: 'Pausada', is_available: false }).eq('id', spotId);
      }
    } catch (e) {}

    addNotification({
      id: `not_pause_${spotId}_${Date.now()}`,
      userId: target?.ownerId || currentUser?.id,
      userEmail: target?.ownerEmail || currentUser?.email,
      targetUserId: target?.ownerId || currentUser?.id,
      category: 'system',
      type: 'spot_status',
      title: '⏸️ Garagem Pausada',
      message: `A vaga "${target?.title || 'Sua vaga'}" foi pausada e não receberá novas reservas até ser reativada.`,
      actionText: 'Minhas Garagens',
      actionTab: 'owner_spots'
    });
  };

  const activateParkingSpace = async (spotId) => {
    setParkingSpaces(prev => prev.map(s => s.id === spotId ? { ...s, status: 'Ativa', isAvailable: true } : s));
    const target = parkingSpaces.find(s => s.id === spotId);
    try {
      const saved = localStorage.getItem('vagago_parkingSpaces');
      if (saved) {
        const parsed = JSON.parse(saved);
        const updated = parsed.map(s => s.id === spotId ? { ...s, status: 'Ativa', isAvailable: true } : s);
        localStorage.setItem('vagago_parkingSpaces', JSON.stringify(updated));
      }
    } catch (e) {}
    try {
      if (isSupabaseConfigured) {
        await supabase.from('parking_spaces').update({ status: 'Ativa', is_available: true }).eq('id', spotId);
      }
    } catch (e) {}

    addNotification({
      id: `not_act_${spotId}_${Date.now()}`,
      userId: target?.ownerId || currentUser?.id,
      userEmail: target?.ownerEmail || currentUser?.email,
      targetUserId: target?.ownerId || currentUser?.id,
      category: 'system',
      type: 'spot_status',
      title: '▶️ Garagem Reativada',
      message: `A vaga "${target?.title || 'Sua vaga'}" está online e disponível para receber novas reservas em Itabuna!`,
      actionText: 'Minhas Garagens',
      actionTab: 'owner_spots'
    });
  };

  const approveBooking = (bookingId) => {
    const found = bookings.find(b => b.id === bookingId || b.bookingNumber === bookingId);
    if (found) {
      setBookings(prev => prev.map(b => (b.id === bookingId || b.bookingNumber === bookingId) ? { ...b, bookingStatus: 'Confirmado', status: 'confirmed' } : b));
      updateBookingStatusInSupabase(bookingId, 'Confirmado');

      const driverUid = found.userId || found.driverId;
      const driverMail = found.userEmail || found.driverEmail;

      addNotification({
        id: `not_apprv_${found.bookingNumber || bookingId}`,
        relatedId: found.bookingNumber || bookingId,
        userId: driverUid,
        userEmail: driverMail,
        targetUserId: driverUid,
        category: 'bookings',
        type: 'booking_approved',
        title: '✅ Reserva Aprovada pelo Anfitrião!',
        message: `Sua reserva da vaga "${found.spaceTitle || found.parkingTitle || 'Garagem'}" foi confirmada para ${found.date} das ${found.startTime} às ${found.endTime}.`,
        actionText: 'Acessar QR Code',
        actionTab: 'client_dashboard'
      });
    }
  };

  const rejectBooking = (bookingId) => {
    const found = bookings.find(b => b.id === bookingId || b.bookingNumber === bookingId);
    if (found) {
      setBookings(prev => prev.map(b => (b.id === bookingId || b.bookingNumber === bookingId) ? { ...b, bookingStatus: 'Recusado', status: 'cancelled' } : b));
      updateBookingStatusInSupabase(bookingId, 'Recusado');
      if (found.paymentMethod === 'Carteira VagaGo' && found.totalPrice) {
        const refundUserId = found.userId || found.driverId;
        const refundUser = users.find(u => u.id === refundUserId);
        if (refundUser) {
          const newCredits = (refundUser.credits || 0) + found.totalPrice;
          setUsers(prev => prev.map(u => u.id === refundUserId ? { ...u, credits: newCredits } : u));
          if (currentUser && currentUser.id === refundUserId) {
            setCurrentUser(prev => ({ ...prev, credits: newCredits }));
          }
        }
      }

      const driverUid = found.userId || found.driverId;
      const driverMail = found.userEmail || found.driverEmail;

      addNotification({
        id: `not_rej_${found.bookingNumber || bookingId}`,
        relatedId: found.bookingNumber || bookingId,
        userId: driverUid,
        userEmail: driverMail,
        targetUserId: driverUid,
        category: 'bookings',
        type: 'booking_rejected',
        title: '❌ Solicitação de Reserva Não Aprovada',
        message: `O anfitrião não pôde aceitar sua reserva para "${found.spaceTitle || found.parkingTitle || 'Garagem'}". ${found.paymentMethod === 'Carteira VagaGo' ? 'Seu saldo em créditos foi reembolsado.' : ''}`,
        actionText: 'Buscar Outras Vagas',
        actionTab: 'search'
      });
    }
  };

  const addReview = ({ bookingId, spaceId, rating, comment, role, userName, userAvatar }) => {
    const newRev = {
      id: `rev_${Date.now()}`,
      bookingId,
      spaceId,
      userName: userName || currentUser?.name || 'Locatário',
      userAvatar: userAvatar || currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      rating: Number(rating || 5),
      comment: comment || 'Ótima experiência com a garagem!',
      role: role || 'LOCATARIO',
      date: new Date().toISOString().split('T')[0]
    };

    setReviews(prev => [newRev, ...prev]);

    if (spaceId) {
      setParkingSpaces(prev => prev.map(s => {
        if (s.id === spaceId) {
          const currentReviews = reviews.filter(r => r.spaceId === spaceId);
          const totalScore = currentReviews.reduce((sum, r) => sum + r.rating, Number(rating || 5));
          const newCount = currentReviews.length + 1;
          const newAvg = Number((totalScore / newCount).toFixed(1));
          return { ...s, rating: newAvg, reviewsCount: newCount };
        }
        return s;
      }));
    }

    if (bookingId) {
      setBookings(prev => prev.map(b => (b.id === bookingId || b.bookingNumber === bookingId) ? { ...b, hasReviewed: true } : b));
    }

    return newRev;
  };

  const createBooking = (newBookingData) => {
    // Run Availability Check
    const availCheck = checkAvailability(newBookingData.spaceId, newBookingData.date, newBookingData.startTime, newBookingData.endTime);
    if (!availCheck.available) {
      throw new Error(availCheck.reason);
    }

    // Resolve target spot directly from all available parking spaces
    const targetSpot = parkingSpaces.find(s => s.id === newBookingData.spaceId) ||
      getGlobalParkingSpaces().find(s => s.id === newBookingData.spaceId) || {};

    const requiresApproval = Boolean(targetSpot?.requireApproval || targetSpot?.instantBooking === false);

        const bookingId = `bk_${Date.now()}`;
    const bookingNumber = `VG-${Math.floor(10000 + Math.random() * 90000)}`;

    // Verifica se hoje é um Day Off (Isenção total da taxa da plataforma para reservas feitas hoje)
    const todayStr = new Date().toISOString().split('T')[0];
    const isDayOffToday = (daysOff || []).some(d => d.active && d.date === todayStr);

    const subtotalVal = Number(newBookingData.subtotal || newBookingData.totalPrice || 10);
    const platformFee = isDayOffToday ? 0.00 : Number((subtotalVal * 0.10).toFixed(2));
    const ownerPayout = Number((subtotalVal - platformFee).toFixed(2));

    const safeUser = currentUser || {
      id: `usr_${Date.now()}`,
      name: 'Motorista VagaGo',
      email: 'motorista@vagago.com.br',
      phone: '(73) 98765-4321',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      credits: 20
    };

    const hostId = targetSpot.ownerId || targetSpot.owner_id || newBookingData.ownerId || newBookingData.host_id || 'usr_2';
    const hostName = targetSpot.ownerName || targetSpot.owner_name || newBookingData.ownerName || newBookingData.hostName || 'Anfitrião VagaGo';
    const hostEmail = targetSpot.ownerEmail || targetSpot.owner_email || newBookingData.ownerEmail || newBookingData.hostEmail || '';
    const hostPhone = targetSpot.ownerPhone || targetSpot.owner_phone || newBookingData.ownerPhone || newBookingData.hostPhone || '(73) 99123-4567';
    const hostAvatar = targetSpot.ownerAvatar || targetSpot.owner_avatar || newBookingData.ownerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80';

    const driverId = safeUser.id;
    const driverName = safeUser.name;
    const driverEmail = safeUser.email || '';
    const driverPhone = safeUser.phone || '(73) 98765-4321';
    const driverAvatar = safeUser.avatar;

    const initialStatus = requiresApproval ? 'Aguardando Aprovação' : 'Confirmado';

    const completeBooking = {
      id: bookingId,
      bookingNumber,
      booking_number: bookingNumber,

      // Driver Identifiers (cross-compatible camelCase & snake_case)
      driverId,
      driver_id: driverId,
      userId: driverId,
      user_id: driverId,
      driverName,
      driver_name: driverName,
      userName: driverName,
      user_name: driverName,
      driverEmail,
      driver_email: driverEmail,
      userEmail: driverEmail,
      user_email: driverEmail,
      driverPhone,
      driver_phone: driverPhone,
      userPhone: driverPhone,
      user_phone: driverPhone,
      driverAvatar,
      driver_avatar: driverAvatar,
      userAvatar: driverAvatar,
      user_avatar: driverAvatar,

      // Host Identifiers (cross-compatible camelCase & snake_case)
      hostId,
      host_id: hostId,
      ownerId: hostId,
      owner_id: hostId,
      hostName,
      host_name: hostName,
      ownerName: hostName,
      owner_name: hostName,
      hostEmail,
      host_email: hostEmail,
      ownerEmail: hostEmail,
      owner_email: hostEmail,
      hostPhone,
      host_phone: hostPhone,
      ownerPhone: hostPhone,
      owner_phone: hostPhone,
      hostAvatar,
      host_avatar: hostAvatar,
      ownerAvatar: hostAvatar,
      owner_avatar: hostAvatar,

      // Space Identifiers
      parkingId: targetSpot.id || newBookingData.spaceId,
      parking_id: targetSpot.id || newBookingData.spaceId,
      spaceId: targetSpot.id || newBookingData.spaceId,
      space_id: targetSpot.id || newBookingData.spaceId,
      parkingTitle: targetSpot.title || newBookingData.spaceTitle || 'Garagem em Itabuna',
      parking_title: targetSpot.title || newBookingData.spaceTitle || 'Garagem em Itabuna',
      spaceTitle: targetSpot.title || newBookingData.spaceTitle || 'Garagem em Itabuna',
      space_title: targetSpot.title || newBookingData.spaceTitle || 'Garagem em Itabuna',
      parkingAddress: targetSpot.address || newBookingData.spaceAddress || 'Itabuna - BA',
      parking_address: targetSpot.address || newBookingData.spaceAddress || 'Itabuna - BA',
      spaceAddress: targetSpot.address || newBookingData.spaceAddress || 'Itabuna - BA',
      space_address: targetSpot.address || newBookingData.spaceAddress || 'Itabuna - BA',

      // Dates & Times
      startDate: newBookingData.date || newBookingData.startDate,
      start_date: newBookingData.date || newBookingData.startDate,
      date: newBookingData.date || newBookingData.startDate,
      startTime: newBookingData.startTime,
      start_time: newBookingData.startTime,
      endDate: newBookingData.endDate || newBookingData.date || newBookingData.startDate,
      end_date: newBookingData.endDate || newBookingData.date || newBookingData.startDate,
      endTime: newBookingData.endTime,
      end_time: newBookingData.endTime,
      totalHours: Number(newBookingData.totalHours || 1),
      total_hours: Number(newBookingData.totalHours || 1),

      // Financials
      subtotal: subtotalVal,
      platformFee,
      platform_fee: platformFee,
      ownerPayout,
      owner_payout: ownerPayout,
      discountAmount: Number(newBookingData.discountAmount || 0),
      discount_amount: Number(newBookingData.discountAmount || 0),
      totalPrice: Number(newBookingData.totalPrice || subtotalVal),
      total_price: Number(newBookingData.totalPrice || subtotalVal),
      amount: Number(newBookingData.totalPrice || subtotalVal),

      // Status
      paymentMethod: newBookingData.paymentMethod || 'PIX',
      payment_method: newBookingData.paymentMethod || 'PIX',
      paymentStatus: 'Aprovado',
      payment_status: 'Aprovado',
      bookingStatus: initialStatus,
      booking_status: initialStatus,
      status: requiresApproval ? 'pending' : 'confirmed',

      // Access & Vehicle
      qrCodeData: `VAGAGO-${bookingNumber}-${targetSpot.id || newBookingData.spaceId || 'SP1'}`,
      qr_code_data: `VAGAGO-${bookingNumber}-${targetSpot.id || newBookingData.spaceId || 'SP1'}`,
      secretAccessInstructions: targetSpot.entranceInstructions || newBookingData.secretAccessInstructions || "🔐 Instruções de portão liberadas após a confirmação.",
      vehicle: newBookingData.vehicle || { plate: 'ABC-1D23', brand: 'Carro', model: 'Passeio', type: 'Carro' },
      checkInTime: null,
      check_in_time: null,
      checkOutTime: null,
      check_out_time: null,
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Deduct credits if paid via VagaGo Wallet
    if (currentUser && newBookingData.paymentMethod === 'Carteira VagaGo') {
      const remainingCredits = Math.max(0, Number(currentUser.credits || 20) - Number(newBookingData.totalPrice || 0));
      setCurrentUser(prev => prev ? { ...prev, credits: remainingCredits } : prev);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, credits: remainingCredits } : u));
    }

    setBookings(prev => [completeBooking, ...prev]);

    // Persist to Supabase Cloud
    publishBookingToSupabase(completeBooking);

    // Send instant notification to host (Anfitrião)
    addNotification({
      id: `not_bk_host_${bookingNumber}`,
      relatedId: bookingNumber,
      userId: hostId,
      userEmail: hostEmail,
      targetUserId: hostId,
      category: 'bookings',
      type: requiresApproval ? 'new_booking_request' : 'new_booking',
      title: requiresApproval ? '🔔 Nova Solicitação de Reserva Pendente!' : '🎉 Nova Reserva Recebida!',
      message: `${driverName} solicitou vaga em "${targetSpot.title || 'sua garagem'}" para ${newBookingData.date || newBookingData.startDate} às ${newBookingData.startTime}.`,
      actionText: 'Ver Reservas',
      actionTab: 'owner_reservas'
    });

    // Send instant notification to driver (Motorista)
    addNotification({
      id: `not_bk_drv_${bookingNumber}`,
      relatedId: bookingNumber,
      userId: driverId,
      userEmail: driverEmail,
      targetUserId: driverId,
      category: 'bookings',
      type: requiresApproval ? 'booking_pending' : 'booking_confirmed',
      title: requiresApproval ? '⏳ Reserva Solicitada com Sucesso!' : '✅ Reserva Confirmada!',
      message: requiresApproval
        ? `Sua solicitação de vaga em "${targetSpot.title || 'Garagem'}" foi enviada ao anfitrião ${hostName}.`
        : `Sua vaga em "${targetSpot.title || 'Garagem'}" está confirmada para ${newBookingData.date || newBookingData.startDate} às ${newBookingData.startTime}!`,
      actionText: 'Ver Comprovante',
      actionTab: 'client_dashboard'
    });

    // Send instant notification for payment
    addNotification({
      id: `not_pay_${bookingNumber}`,
      relatedId: bookingNumber,
      userId: driverId,
      userEmail: driverEmail,
      targetUserId: driverId,
      category: 'payments',
      type: 'payment_approved',
      title: '💳 Pagamento Confirmado',
      message: `Pagamento de R$ ${Number(newBookingData.totalPrice || subtotalVal).toFixed(2)} (${newBookingData.paymentMethod || 'PIX'}) aprovado para a reserva #${bookingNumber}.`,
      actionText: 'Minhas Reservas',
      actionTab: 'client_dashboard'
    });

    return completeBooking;
  };

  const addVehicle = async (vehicleData) => {
    const safeUserId = currentUser?.id || 'usr_1';
    const isFirst = vehicles.filter(v => v && (v.userId === safeUserId || v.user_id === safeUserId)).length === 0;
    const shouldBeDefault = isFirst || Boolean(vehicleData.isDefault);

    let updatedList = vehicles;
    if (shouldBeDefault) {
      updatedList = vehicles.map(v => (v.userId === safeUserId || v.user_id === safeUserId) ? { ...v, isDefault: false, is_default: false } : v);
    }

    const cleanPlate = (vehicleData.plate || '').toUpperCase().trim();
    const newVeh = {
      id: `veh_${Date.now()}`,
      userId: safeUserId,
      user_id: safeUserId,
      isDefault: shouldBeDefault,
      is_default: shouldBeDefault,
      plate: cleanPlate,
      brand: vehicleData.brand?.trim() || 'Toyota',
      model: vehicleData.model?.trim() || 'Corolla',
      color: vehicleData.color?.trim() || 'Prata',
      type: vehicleData.type || 'Carro Passeio',
      createdAt: new Date().toISOString()
    };

    setVehicles([newVeh, ...updatedList]);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('vehicles').insert([{
          brand: newVeh.brand,
          model: newVeh.model,
          plate: newVeh.plate,
          color: newVeh.color,
          type: newVeh.type,
          is_default: Boolean(newVeh.isDefault),
          user_id: safeUserId.length === 36 ? safeUserId : null
        }]);
      } catch (e) {
        console.warn("Notice syncing new vehicle to Supabase:", e);
      }
    }

    return newVeh;
  };

  const updateVehicle = async (vehicleId, updatedData) => {
    const cleanPlate = updatedData.plate ? updatedData.plate.toUpperCase().trim() : undefined;
    const safeUserId = currentUser?.id || 'usr_1';

    setVehicles(prev => {
      let base = prev;
      if (updatedData.isDefault) {
        base = prev.map(v => (v.userId === safeUserId || v.user_id === safeUserId) ? { ...v, isDefault: false, is_default: false } : v);
      }
      return base.map(v => {
        if (v.id === vehicleId) {
          return {
            ...v,
            ...updatedData,
            plate: cleanPlate || v.plate,
            isDefault: updatedData.isDefault !== undefined ? Boolean(updatedData.isDefault) : v.isDefault,
            is_default: updatedData.isDefault !== undefined ? Boolean(updatedData.isDefault) : v.isDefault,
            updatedAt: new Date().toISOString()
          };
        }
        return v;
      });
    });

    if (isSupabaseConfigured) {
      try {
        const payload = {};
        if (updatedData.brand) payload.brand = updatedData.brand;
        if (updatedData.model) payload.model = updatedData.model;
        if (cleanPlate) payload.plate = cleanPlate;
        if (updatedData.color) payload.color = updatedData.color;
        if (updatedData.type) payload.type = updatedData.type;
        if (updatedData.isDefault !== undefined) payload.is_default = Boolean(updatedData.isDefault);

        await supabase.from('vehicles').update(payload).or(`id.eq.${vehicleId},plate.eq.${cleanPlate || updatedData.plate}`);
      } catch (e) {
        console.warn("Notice updating vehicle in Supabase:", e);
      }
    }
  };

  const deleteVehicle = async (vehicleId) => {
    const targetVeh = vehicles.find(v => v.id === vehicleId);
    if (!targetVeh) return { success: false, reason: 'Veículo não encontrado.' };

    // Validar se o veículo possui reservas ativas ou em andamento
    const activeConflict = bookings.find(b => {
      if (b.bookingStatus === 'Cancelado' || b.bookingStatus === 'Recusado' || b.status === 'cancelled') return false;
      const bPlate = b.vehicle?.plate;
      return (b.vehicle?.id === vehicleId || (bPlate && bPlate.toUpperCase() === targetVeh.plate.toUpperCase()));
    });

    if (activeConflict) {
      return {
        success: false,
        reason: `Este veículo está vinculado à reserva ativa #${activeConflict.bookingNumber}. Não é possível excluí-lo enquanto a reserva estiver em andamento.`
      };
    }

    // Exclui com segurança do cadastro ativo, preservando histórico de comprovantes
    setVehicles(prev => {
      const remaining = prev.filter(v => v.id !== vehicleId);
      if (targetVeh.isDefault && remaining.length > 0) {
        remaining[0].isDefault = true;
        remaining[0].is_default = true;
      }
      return remaining;
    });

    if (isSupabaseConfigured) {
      try {
        await supabase.from('vehicles').delete().or(`id.eq.${vehicleId},plate.eq.${targetVeh.plate}`);
      } catch (e) {
        console.warn("Notice deleting vehicle from Supabase:", e);
      }
    }

    return { success: true };
  };

  const setDefaultVehicle = async (vehicleId) => {
    const safeUserId = currentUser?.id || 'usr_1';
    setVehicles(prev => prev.map(v => {
      if (v.userId === safeUserId || v.user_id === safeUserId) {
        return { ...v, isDefault: v.id === vehicleId, is_default: v.id === vehicleId };
      }
      return v;
    }));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('vehicles').update({ is_default: false }).or(`user_id.eq.${safeUserId}`);
        await supabase.from('vehicles').update({ is_default: true }).eq('id', vehicleId);
      } catch (e) {
        console.warn("Notice setting default vehicle in Supabase:", e);
      }
    }
  };


  const saveParkingSpace = (spotData) => {
    // Convert address to Itabuna coordinates if missing or defaulted to old SP values
    let lat = spotData.lat;
    let lng = spotData.lng;
    let entranceLat = spotData.entranceLat;
    let entranceLng = spotData.entranceLng;

    if (!lat || lat < -20) {
      const geo = geocodeAddress(spotData.address || spotData.title || "Centro, Itabuna - BA");
      lat = geo.lat;
      lng = geo.lng;
      entranceLat = geo.entranceLat;
      entranceLng = geo.entranceLng;
    }

    const city = spotData.city || "Itabuna";
    const state = spotData.state || "BA";

    const safeUser = currentUser || {
      id: `usr_${Date.now()}`,
      name: 'Anfitrião VagaGo',
      email: 'anfitriao@vagago.com.br',
      phone: '(73) 99123-4567',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'
    };

    if (spotData.id) {
      const updated = {
        ...spotData,
        ownerEmail: spotData.ownerEmail || safeUser.email,
        ownerName: spotData.ownerName || safeUser.name,
        lat,
        lng,
        entranceLat: entranceLat || spotData.entranceLat,
        entranceLng: entranceLng || spotData.entranceLng,
        city,
        state
      };
      registerGlobalParkingSpace(updated);
      setParkingSpaces(prev => prev.map(s => s.id === updated.id ? updated : s));
      publishSpaceToSupabase(updated);
    } else {
      const newSpot = {
        id: `spc_${Date.now()}`,
        ownerId: safeUser.id,
        ownerEmail: safeUser.email || "anfitriao@vagago.com.br",
        ownerName: safeUser.name || "Anfitrião VagaGo",
        ownerPhone: safeUser.phone || "(73) 99123-4567",
        ownerAvatar: safeUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80",
        ownerRating: 5.0,
        rating: 5.0,
        reviewsCount: 0,
        status: 'Aprovado',
        availabilityStatus: 'Disponível',
        isAvailable: true,
        city,
        state,
        lat,
        lng,
        entranceLat: entranceLat || (lat - 0.0002),
        entranceLng: entranceLng || (lng + 0.0002),
        photos: spotData.photos?.length ? spotData.photos : [
          "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1000&q=80"
        ],
        ...spotData
      };

      
      registerGlobalParkingSpace(newSpot);
      setParkingSpaces(prev => [newSpot, ...prev]);
      publishSpaceToSupabase(newSpot);


      // Broadcast notification to host about the new garage
      addNotification({
        id: `not_spc_${newSpot.id}`,
        userId: safeUser.id,
        userEmail: safeUser.email,
        targetUserId: safeUser.id,
        category: 'system',
        type: 'new_space',
        title: '🎉 Sua Garagem está Ativa e Publicada!',
        message: `A vaga "${newSpot.title}" (${newSpot.address}) foi publicada com sucesso e já está disponível para motoristas em Itabuna!`,
        actionText: 'Minhas Garagens',
        actionTab: 'owner_spots'
      });
    }
  };

  const deleteParkingSpace = async (spotId) => {
    if (!spotId) return;
    setParkingSpaces(prev => prev.filter(s => s.id !== spotId));
    try {
      const saved = localStorage.getItem('vagago_parkingSpaces');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter(s => s.id !== spotId);
        localStorage.setItem('vagago_parkingSpaces', JSON.stringify(filtered));
      }
    } catch (e) {}

    try {
      await deleteSpaceFromSupabase(spotId);
    } catch (e) {
      console.warn("Notice deleting space from cloud:", e);
    }
  };






  const authorizeCheckIn = (bookingId) => {
    const found = bookings.find(b => b.id === bookingId || b.bookingNumber === bookingId);
    setBookings(prev => prev.map(b => (b.id === bookingId || b.bookingNumber === bookingId) ? { ...b, bookingStatus: 'Em Andamento', checkInTime: new Date().toLocaleString('pt-BR') } : b));

    if (found) {
      const driverUid = found.userId || found.driverId;
      const driverMail = found.userEmail || found.driverEmail;
      const hostUid = found.hostId || found.ownerId;
      const hostMail = found.hostEmail || found.ownerEmail;

      addNotification({
        id: `not_chkin_drv_${found.bookingNumber || bookingId}`,
        relatedId: found.bookingNumber || bookingId,
        userId: driverUid,
        userEmail: driverMail,
        targetUserId: driverUid,
        category: 'bookings',
        type: 'check_in',
        title: '🚗 Check-in Realizado com Sucesso!',
        message: `Seu check-in na vaga "${found.spaceTitle || found.parkingTitle || 'Garagem'}" foi registrado. Boa estadia!`,
        actionText: 'Acompanhar Reserva',
        actionTab: 'client_dashboard'
      });

      addNotification({
        id: `not_chkin_host_${found.bookingNumber || bookingId}`,
        relatedId: found.bookingNumber || bookingId,
        userId: hostUid,
        userEmail: hostMail,
        targetUserId: hostUid,
        category: 'bookings',
        type: 'driver_check_in',
        title: '🚗 Motorista Fez Check-in na Vaga',
        message: `O motorista ${found.driverName || 'locatário'} deu entrada na vaga "${found.spaceTitle || found.parkingTitle || 'Garagem'}" (Placa: ${found.vehicle?.plate || 'identificada'}).`,
        actionText: 'Ver Reservas',
        actionTab: 'owner_reservas'
      });
    }
  };

  const completeCheckOut = (bookingId) => {
    const found = bookings.find(b => b.id === bookingId || b.bookingNumber === bookingId);
    setBookings(prev => prev.map(b => (b.id === bookingId || b.bookingNumber === bookingId) ? { ...b, bookingStatus: 'Concluído', checkOutTime: new Date().toLocaleString('pt-BR') } : b));

    if (found) {
      const driverUid = found.userId || found.driverId;
      const driverMail = found.userEmail || found.driverEmail;
      const hostUid = found.hostId || found.ownerId;
      const hostMail = found.hostEmail || found.ownerEmail;
      const payoutVal = found.ownerPayout || (found.totalPrice ? (found.totalPrice * 0.9).toFixed(2) : '0.00');

      addNotification({
        id: `not_chkout_drv_${found.bookingNumber || bookingId}`,
        relatedId: found.bookingNumber || bookingId,
        userId: driverUid,
        userEmail: driverMail,
        targetUserId: driverUid,
        category: 'bookings',
        type: 'check_out',
        title: '🏁 Check-out Finalizado',
        message: `Check-out da reserva #${found.bookingNumber} finalizado na vaga "${found.spaceTitle || found.parkingTitle || 'Garagem'}". Obrigado por usar o VagaGo!`,
        actionText: 'Minhas Reservas',
        actionTab: 'client_dashboard'
      });

      addNotification({
        id: `not_payout_host_${found.bookingNumber || bookingId}`,
        relatedId: found.bookingNumber || bookingId,
        userId: hostUid,
        userEmail: hostMail,
        targetUserId: hostUid,
        category: 'payments',
        type: 'payout_credited',
        title: '💰 Pagamento Creditado!',
        message: `O valor líquido de R$ ${Number(payoutVal).toFixed(2)} foi liberado no seu saldo pela locação da vaga "${found.spaceTitle || found.parkingTitle || 'Garagem'}".`,
        actionText: 'Ver Saldo & Saques',
        actionTab: 'owner_finance'
      });
    }
  };

  const requestWithdrawal = async (amount) => {
    const newWtd = {
      id: `wtd_${Date.now()}`,
      ownerId: currentUser?.id || `usr_${Date.now()}`,
      ownerName: currentUser?.name || "Anfitrião VagaGo",
      amount,
      pixKey: currentUser?.pixKey || currentUser?.email || "pix@vagago.com.br",
      status: "Pendente",
      requestedAt: new Date().toISOString().split('T')[0]
    };

    setWithdrawals(prev => {
      const updated = [newWtd, ...prev];
      try {
        localStorage.setItem('vagago_withdrawals', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      if (isSupabaseConfigured) {
        await supabase.from('withdrawals').insert([{
          id: newWtd.id,
          owner_id: currentUser?.id,
          owner_name: currentUser?.name || "Anfitrião VagaGo",
          amount: Number(amount),
          pix_key: newWtd.pixKey,
          status: 'Pendente',
          created_at: new Date().toISOString()
        }]);
      }
    } catch (e) {
      console.warn("Notice saving withdrawal to Supabase:", e);
    }

    addNotification({
      id: `not_wtd_${newWtd.id}`,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      targetUserId: currentUser?.id,
      category: 'payments',
      type: 'deposit_success',
      title: '💸 Solicitação de Saque PIX Enviada',
      message: `Sua solicitação de saque de R$ ${Number(amount).toFixed(2)} para a chave PIX "${newWtd.pixKey}" está em processamento.`,
      actionText: 'Ver Financeiro',
      actionTab: 'owner_finance'
    });
  };

  const approveWithdrawal = (id) => {
    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'Concluído' } : w));
  };

  const toggleEventPricing = (spaceId) => {
    setParkingSpaces(prev => prev.map(s => {
      if (s.id === spaceId) {
        const currentlyActive = Boolean(s.isEventPricingActive);
        const newActive = !currentlyActive;
        const basePrice = s.basePriceHourly || s.priceHourly;
        const newPrice = newActive ? parseFloat((basePrice * 1.3).toFixed(2)) : basePrice;

        return {
          ...s,
          basePriceHourly: basePrice,
          isEventPricingActive: newActive,
          priceHourly: newPrice
        };
      }
      return s;
    }));
  };


  const extendBooking = (bookingId, additionalMinutes, extraPrice) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId || b.bookingNumber === bookingId) {
        // Calculate new end time string
        const [h, m] = (b.endTime || '12:00').split(':').map(Number);
        const totalMins = h * 60 + m + additionalMinutes;
        const newH = Math.floor(totalMins / 60) % 24;
        const newM = totalMins % 60;
        const formattedEndTime = `${newH < 10 ? '0' + newH : newH}:${newM < 10 ? '0' + newM : newM}`;

        return {
          ...b,
          endTime: formattedEndTime,
          subtotal: Number(b.subtotal || 0) + extraPrice,
          totalPrice: Number(b.totalPrice || 0) + extraPrice,
          totalHours: Number(b.totalHours || 1) + (additionalMinutes / 60)
        };
      }
      return b;
    }));

    addNotification({
      id: `not_ext_${bookingId}_${Date.now()}`,
      relatedId: bookingId,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      targetUserId: currentUser?.id,
      category: 'bookings',
      type: 'booking_confirmed',
      title: '⏱️ Reserva Estendida com Sucesso!',
      message: `Tempo de permanência estendido em ${additionalMinutes} minutos por R$ ${extraPrice.toFixed(2)}.`,
      actionText: 'Minhas Reservas',
      actionTab: 'client_dashboard'
    });
  };

  const cancelBooking = (bookingId) => {
    const found = bookings.find(b => b.id === bookingId || b.bookingNumber === bookingId);
    if (found) {
      setBookings(prev => prev.map(b => (b.id === bookingId || b.bookingNumber === bookingId) ? { ...b, bookingStatus: 'Cancelado', status: 'cancelled' } : b));
      updateBookingStatusInSupabase(bookingId, 'Cancelado');
      // Refund credits
      if (currentUser && found.totalPrice) {
        const refundedCredits = (currentUser.credits || 0) + found.totalPrice;
        setCurrentUser(prev => ({ ...prev, credits: refundedCredits }));
        setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, credits: refundedCredits } : u));
      }

      const driverUid = found.userId || found.driverId;
      const driverMail = found.userEmail || found.driverEmail;
      const hostUid = found.hostId || found.ownerId;
      const hostMail = found.hostEmail || found.ownerEmail;

      // Notification to driver
      addNotification({
        id: `not_canc_drv_${found.bookingNumber || bookingId}`,
        relatedId: found.bookingNumber || bookingId,
        userId: driverUid,
        userEmail: driverMail,
        targetUserId: driverUid,
        category: 'bookings',
        type: 'booking_cancelled',
        title: '⚠️ Reserva Cancelada',
        message: `A reserva #${found.bookingNumber} para a vaga "${found.spaceTitle || found.parkingTitle || 'Garagem'}" foi cancelada. O valor de R$ ${Number(found.totalPrice || 0).toFixed(2)} foi estornado em créditos na sua carteira.`,
        actionText: 'Minhas Reservas',
        actionTab: 'client_dashboard'
      });

      // Notification to host
      addNotification({
        id: `not_canc_host_${found.bookingNumber || bookingId}`,
        relatedId: found.bookingNumber || bookingId,
        userId: hostUid,
        userEmail: hostMail,
        targetUserId: hostUid,
        category: 'bookings',
        type: 'booking_cancelled',
        title: '⚠️ Uma Reserva Foi Cancelada',
        message: `A reserva #${found.bookingNumber} na vaga "${found.spaceTitle || found.parkingTitle || 'Garagem'}" foi cancelada. A vaga voltou a ficar disponível para locação.`,
        actionText: 'Ver Garagens',
        actionTab: 'owner_spots'
      });
    }
  };

  const depositWalletCredits = async (amount) => {
    if (currentUser && amount > 0) {
      const newCredits = Number((currentUser.credits || 0) + amount);
      setCurrentUser(prev => prev ? ({ ...prev, credits: newCredits }) : prev);
      setUsers(prev => prev.map(u => (u.id === currentUser.id || u.email === currentUser.email) ? { ...u, credits: newCredits } : u));
      
      // Persist credit recharge to Supabase Cloud
      if (isSupabaseConfigured) {
        try {
          await supabase
            .from('users')
            .update({ credits: newCredits })
            .or(`id.eq.${currentUser.id},email.eq.${currentUser.email}`);
        } catch (e) {
          console.warn("Notice syncing credits to Supabase Cloud:", e);
        }
      }

      addNotification({
        id: `not_dep_${Date.now()}`,
        userId: currentUser.id,
        userEmail: currentUser.email,
        targetUserId: currentUser.id,
        category: 'payments',
        type: 'deposit_success',
        title: '💵 Recarga de Carteira Concluída!',
        message: `Recarga de R$ ${Number(amount).toFixed(2)} confirmada. Seu saldo atual é R$ ${newCredits.toFixed(2)}.`,
        actionText: 'Minhas Reservas',
        actionTab: 'client_dashboard'
      });
    }
  };

  const addCoupon = (couponData) => {
    setCoupons(prev => [{ id: `cp_${Date.now()}`, status: 'Ativo', usageCount: 0, ...couponData }, ...prev]);
  };

  const openSpotDetails = (spot) => {
    setSelectedSpot(spot);
    setIsSpotDetailsOpen(true);
  };


  const openBookingFlow = (spot) => {
    if (!isAuthenticated) {
      setSelectedSpot(spot);
      setIsSpotDetailsOpen(false);
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedSpot(spot);
    setIsSpotDetailsOpen(false);
    setIsBookingFlowOpen(true);
  };

  const syncGlobalParkingSpaces = () => {
    setParkingSpaces([...getGlobalParkingSpaces()]);
  };

  const safeUserId = currentUser?.id || 'usr_1';
  const userVehicles = (vehicles || []).filter(v => v && (
    v.userId === safeUserId ||
    v.user_id === safeUserId ||
    (!v.userId && !v.user_id) ||
    v.userId === 'usr_1' ||
    safeUserId === 'usr_1'
  ));

  const unreadNotificationsCount = (notifications || []).filter(n => {
    if (!n || n.read) return false;
    if (!n.userId && !n.userEmail && !n.targetUserId) return true;
    const safeUser = currentUser || {};
    return (
      (n.userId && (n.userId === safeUser.id || n.userId === safeUser.email)) ||
      (n.targetUserId && n.targetUserId === safeUser.id) ||
      (n.userEmail && safeUser.email && n.userEmail.toLowerCase() === safeUser.email.toLowerCase())
    );
  }).length;

  return (


    <AppContext.Provider value={{
      isAuthenticated,
      authToken,
      login,
      logout,
      resetPassword,
      register,
      users,
      currentUser,
      activeRole,
      setActiveRole,
      switchRole,
      isAuthModalOpen,
      setIsAuthModalOpen,
      authModalMode,
      setAuthModalMode,
      openLoginModal,
      openRegisterModal,
      suggestedAccountType,



      parkingSpaces: enrichedParkingSpaces,
      rawParkingSpaces: parkingSpaces,
      syncGlobalParkingSpaces,

      setParkingSpaces,
      bookings,
      setBookings,
      vehicles,
      setVehicles,
      favorites,
      toggleFavorite,
      notifications,
      unreadNotificationsCount,
      notificationPreferences,
      updateNotificationPreferences,
      liveToast,
      clearLiveToast,
      addNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      coupons,
      addCoupon,

      reviews,
      demandRegions,
      withdrawals,
      requestWithdrawal,
      approveWithdrawal,
      userLocation,
      setUserLocation,
      requestUserLocation,
      distanceRadius,
      setDistanceRadius,
      smartParkOptions,
      selectedSpot,
      setSelectedSpot,
      isSpotDetailsOpen,
      setIsSpotDetailsOpen,
      isBookingFlowOpen,
      setIsBookingFlowOpen,
      isScannerOpen,
      setIsScannerOpen,
      isAddSpotModalOpen,
      setIsAddSpotModalOpen,
      isReferralModalOpen,
      setIsReferralModalOpen,
      isEditProfileModalOpen,
      setIsEditProfileModalOpen,
      openEditProfileModal,
      updateUserProfile,
      editingSpot,
      setEditingSpot,

      activeTab,
      setActiveTab,
      isPageLoading,
      searchLocation,
      setSearchLocation: handleSearchLocationChange,
      searchFilters,
      setSearchFilters,


      checkAvailability,
      pauseParkingSpace,
      activateParkingSpace,
      approveBooking,
      rejectBooking,
      addReview,
      createBooking,
      extendBooking,
      cancelBooking,
      depositWalletCredits,
      toggleEventPricing,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      setDefaultVehicle,
      userVehicles,
      saveParkingSpace,
      deleteParkingSpace,

      authorizeCheckIn,
      completeCheckOut,
      openSpotDetails,
      openBookingFlow
    }}>

      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
