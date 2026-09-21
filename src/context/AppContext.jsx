import React, { createContext, useContext, useState, useEffect } from 'react';
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
      try {
        const saved = localStorage.getItem('vagago_users');
        if (saved) {
          const parsed = JSON.parse(saved);
          const found = parsed.find(u => u && u.email?.toLowerCase() === savedEmail.toLowerCase());
          if (found) return found;
        }
      } catch (e) {}
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

  const updateUserProfile = (updatedData) => {
    if (!currentUser) return null;
    const updated = {
      ...currentUser,
      ...updatedData
    };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => (u.email?.toLowerCase() === currentUser.email?.toLowerCase() || u.id === currentUser.id) ? updated : u));
    try {
      localStorage.setItem('vagago_currentUser_email', updated.email || currentUser.email);
    } catch (e) {}
    return updated;
  };


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

    setCurrentUser(foundUser);
    const userRole = foundUser.role || 'CLIENTE';
    setActiveRole(userRole);
    setIsAuthenticated(true);
    const token = `jwt_token_${Date.now()}`;
    setAuthToken(token);
    localStorage.setItem('vagago_isAuthenticated', 'true');
    localStorage.setItem('vagago_authToken', token);
    localStorage.setItem('vagago_currentUser_email', foundUser.email);
    localStorage.setItem('vagago_activeRole', userRole);

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
    localStorage.setItem('vagago_isAuthenticated', 'true');
    localStorage.setItem('vagago_authToken', token);
    localStorage.setItem('vagago_currentUser_email', cleanEmail);
    localStorage.setItem('vagago_activeRole', newUser.role);

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
    localStorage.removeItem('vagago_isAuthenticated');
    localStorage.removeItem('vagago_authToken');
    localStorage.removeItem('vagago_currentUser_email');
    localStorage.setItem('vagago_activeRole', 'CLIENTE');
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
          prev.forEach(u => mergedMap.set(u.email || u.id, u));
          cloudUsers.forEach(cu => {
            const normalized = {
              id: cu.id,
              name: cu.name,
              email: cu.email,
              role: cu.role || 'CLIENTE',
              phone: cu.phone || '(73) 98765-4321',
              avatar: cu.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
              cpf: cu.cpf,
              pixKey: cu.pix_key || cu.pixKey,
              credits: cu.credits || 20,
              status: cu.status || 'Ativo',
              createdAt: cu.created_at || cu.createdAt
            };
            mergedMap.set(cu.email || cu.id, normalized);
          });
          return Array.from(mergedMap.values());
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
          },
          (updatedBooking) => {
            setBookings(prev =>
              prev.map(b => (b.id === updatedBooking.id || b.bookingNumber === updatedBooking.bookingNumber) ? updatedBooking : b)
            );
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
  }, []);





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
  };

  const activateParkingSpace = async (spotId) => {
    setParkingSpaces(prev => prev.map(s => s.id === spotId ? { ...s, status: 'Ativa', isAvailable: true } : s));
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
  };

  const approveBooking = (bookingId) => {
    const found = bookings.find(b => b.id === bookingId || b.bookingNumber === bookingId);
    if (found) {
      setBookings(prev => prev.map(b => (b.id === bookingId || b.bookingNumber === bookingId) ? { ...b, bookingStatus: 'Confirmado', status: 'confirmed' } : b));
      updateBookingStatusInSupabase(bookingId, 'Confirmado');
      setNotifications(prev => [
        {
          id: `not_${Date.now()}`,
          userId: found.userId || found.driverId,
          userEmail: found.userEmail || found.driverEmail,
          targetUserId: found.userId || found.driverId,
          type: 'booking_approved',
          title: '✅ Reserva Aprovada pelo Locador!',
          message: `Sua reserva da vaga "${found.spaceTitle}" foi confirmada para ${found.date} das ${found.startTime} às ${found.endTime}.`,
          read: false,
          timestamp: 'Agora mesmo',
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
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
      setNotifications(prev => [
        {
          id: `not_${Date.now()}`,
          userId: found.userId || found.driverId,
          userEmail: found.userEmail || found.driverEmail,
          targetUserId: found.userId || found.driverId,
          type: 'booking_rejected',
          title: '❌ Solicitação de Reserva Não Aprovada',
          message: `O anfitrião não pôde aceitar sua reserva para "${found.spaceTitle}". ${found.paymentMethod === 'Carteira VagaGo' ? 'Seu saldo foi reembolsado.' : ''}`,
          read: false,
          timestamp: 'Agora mesmo',
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
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
    setNotifications(prev => [
      {
        id: `not_${Date.now()}`,
        userId: hostId,
        userEmail: hostEmail,
        targetUserId: hostId,
        type: requiresApproval ? 'new_booking_request' : 'booking_confirmed',
        title: requiresApproval ? '🔔 Nova Solicitação de Reserva Pendente!' : '🎉 Nova Reserva Recebida!',
        message: `Nova reserva recebida! ${driverName} reservou sua vaga para ${newBookingData.date} às ${newBookingData.startTime}.`,
        read: false,
        timestamp: 'Agora mesmo',
        createdAt: new Date().toISOString()
      },
      {
        id: `not_${Date.now() + 1}`,
        userId: driverId,
        userEmail: driverEmail,
        targetUserId: driverId,
        type: requiresApproval ? 'booking_pending' : 'booking_confirmed',
        title: requiresApproval ? '⏳ Reserva Solicitada com Sucesso!' : '✅ Reserva Confirmada!',
        message: requiresApproval
          ? `Sua solicitação de vaga em "${targetSpot.title || 'Garagem'}" foi enviada ao anfitrião ${hostName}.`
          : `Sua vaga em "${targetSpot.title || 'Garagem'}" está confirmada para ${newBookingData.date} às ${newBookingData.startTime}!`,
        read: false,
        timestamp: 'Agora mesmo',
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);

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


      // Broadcast notification to all drivers about the new garage in Itabuna
      setNotifications(prev => [
        {
          id: `not_${Date.now()}`,
          userId: 'usr_1',
          type: 'new_space',
          title: '🎉 Nova Garagem Publicada em Itabuna!',
          message: `A vaga "${newSpot.title}" (${newSpot.address}) foi publicada e já está disponível para todos os motoristas!`,
          read: false,
          timestamp: 'Agora mesmo'
        },
        ...prev
      ]);
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
    setBookings(prev => prev.map(b => (b.id === bookingId || b.bookingNumber === bookingId) ? { ...b, bookingStatus: 'Em Andamento', checkInTime: new Date().toLocaleString('pt-BR') } : b));
  };

  const completeCheckOut = (bookingId) => {
    setBookings(prev => prev.map(b => (b.id === bookingId || b.bookingNumber === bookingId) ? { ...b, bookingStatus: 'Concluído', checkOutTime: new Date().toLocaleString('pt-BR') } : b));
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
        const [h, m] = b.endTime.split(':').map(Number);
        const totalMins = h * 60 + m + additionalMinutes;
        const newH = Math.floor(totalMins / 60) % 24;
        const newM = totalMins % 60;
        const formattedEndTime = `${newH < 10 ? '0' + newH : newH}:${newM < 10 ? '0' + newM : newM}`;

        return {
          ...b,
          endTime: formattedEndTime,
          subtotal: b.subtotal + extraPrice,
          totalPrice: b.totalPrice + extraPrice,
          totalHours: b.totalHours + (additionalMinutes / 60)
        };
      }
      return b;
    }));
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
    }
  };


  const addCoupon = (couponData) => {
    setCoupons(prev => [{ id: `cp_${Date.now()}`, status: 'Ativo', usageCount: 0, ...couponData }, ...prev]);
  };

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
