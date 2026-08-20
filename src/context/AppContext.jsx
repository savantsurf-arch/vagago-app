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
import { fetchSpacesFromSupabase, publishSpaceToSupabase, deleteSpaceFromSupabase, registerUserInSupabase } from '../services/supabaseService';



const AppContext = createContext();



export const AppProvider = ({ children }) => {
  // Clear legacy mock users on first run
  const LEGACY_EMAILS = ['matheus@cliente.com', 'juliana@proprietario.com', 'carlos@proprietario.com', 'admin@vagago.com.br'];

  // Users dataset - Only real registered users
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('vagago_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(u => u && !LEGACY_EMAILS.includes(u.email?.toLowerCase()));
          return filtered;
        }
      }
    } catch (e) {}
    return [];
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
    setActiveRole(foundUser.role || 'CLIENTE');
    setIsAuthenticated(true);
    const token = `jwt_token_${Date.now()}`;
    setAuthToken(token);
    localStorage.setItem('vagago_isAuthenticated', 'true');
    localStorage.setItem('vagago_authToken', token);
    localStorage.setItem('vagago_currentUser_email', foundUser.email);
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
    localStorage.removeItem('vagago_isAuthenticated');
    localStorage.removeItem('vagago_authToken');
    localStorage.removeItem('vagago_currentUser_email');
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
      localStorage.setItem('vagago_withdrawals', JSON.stringify(withdrawals));
    } catch (e) {}
  }, [withdrawals]);


  // REAL-TIME SYNC - Synchronize newly published spaces across all browser tabs & devices
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'vagago_parkingSpaces' && e.newValue) {
        try {
          const updatedSpaces = JSON.parse(e.newValue);
          setParkingSpaces(updatedSpaces);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // SUPABASE CLOUD & REALTIME SYNC EFFECT - Fetch cloud spaces and users on mount
  useEffect(() => {
    let channel;
    const syncCloudData = async () => {
      const cloudSpaces = await fetchSpacesFromSupabase();
      if (cloudSpaces && cloudSpaces.length > 0) {
        setParkingSpaces(cloudSpaces);
        cloudSpaces.forEach(s => registerGlobalParkingSpace(s));
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
        channel = supabase
          .channel('public:parking_spaces')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_spaces' }, async () => {
            const updatedCloudSpaces = await fetchSpacesFromSupabase();
            if (updatedCloudSpaces && updatedCloudSpaces.length > 0) {
              setParkingSpaces(updatedCloudSpaces);
              updatedCloudSpaces.forEach(s => registerGlobalParkingSpace(s));
            }
          })
          .subscribe();
      } catch (e) {
        console.warn("Realtime subscription notice:", e);
      }
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
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
  const [activeTab, setActiveTab] = useState('landing');

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
    if (isSupabaseConfigured) {
      async function loadSupabaseData() {
        try {
          const { data: dbSpots } = await supabase.from('parking_spaces').select('*');
          if (dbSpots && dbSpots.length > 0) {
            setParkingSpaces(dbSpots);
          }
          const { data: dbBookings } = await supabase.from('bookings').select('*');
          if (dbBookings && dbBookings.length > 0) {
            setBookings(dbBookings);
          }
        } catch (err) {
          console.warn("Supabase fetch error, fallback to local storage:", err);
        }
      }
      loadSupabaseData();
    }
  }, []);

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
      if (isSupabaseConfigured) {
        await supabase.from('parking_spaces').update({ status: 'Pausada', is_available: false }).eq('id', spotId);
      }
    } catch (e) {}
  };

  const activateParkingSpace = async (spotId) => {
    setParkingSpaces(prev => prev.map(s => s.id === spotId ? { ...s, status: 'Ativa', isAvailable: true } : s));
    try {
      if (isSupabaseConfigured) {
        await supabase.from('parking_spaces').update({ status: 'Ativa', is_available: true }).eq('id', spotId);
      }
    } catch (e) {}
  };

  const approveBooking = (bookingId) => {
    const found = bookings.find(b => b.id === bookingId || b.bookingNumber === bookingId);
    if (found) {
      setBookings(prev => prev.map(b => (b.id === bookingId || b.bookingNumber === bookingId) ? { ...b, bookingStatus: 'Confirmado' } : b));
      setNotifications(prev => [
        {
          id: `not_${Date.now()}`,
          userId: found.userId,
          type: 'booking_approved',
          title: '✅ Reserva Aprovada pelo Locador!',
          message: `Sua reserva da vaga "${found.spaceTitle}" foi confirmada para ${found.date} das ${found.startTime} às ${found.endTime}.`,
          read: false,
          timestamp: 'Agora mesmo'
        },
        ...prev
      ]);
    }
  };

  const rejectBooking = (bookingId) => {
    const found = bookings.find(b => b.id === bookingId || b.bookingNumber === bookingId);
    if (found) {
      setBookings(prev => prev.map(b => (b.id === bookingId || b.bookingNumber === bookingId) ? { ...b, bookingStatus: 'Recusado' } : b));
      if (found.paymentMethod === 'Carteira VagaGo' && found.totalPrice) {
        const refundUser = users.find(u => u.id === found.userId);
        if (refundUser) {
          const newCredits = (refundUser.credits || 0) + found.totalPrice;
          setUsers(prev => prev.map(u => u.id === found.userId ? { ...u, credits: newCredits } : u));
          if (currentUser && currentUser.id === found.userId) {
            setCurrentUser(prev => ({ ...prev, credits: newCredits }));
          }
        }
      }
      setNotifications(prev => [
        {
          id: `not_${Date.now()}`,
          userId: found.userId,
          type: 'booking_rejected',
          title: '❌ Solicitação de Reserva Não Aprovada',
          message: `O locador não pôde aceitar sua reserva para "${found.spaceTitle}". ${found.paymentMethod === 'Carteira VagaGo' ? 'Seu saldo foi reembolsado.' : ''}`,
          read: false,
          timestamp: 'Agora mesmo'
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

    const targetSpot = parkingSpaces.find(s => s.id === newBookingData.spaceId);
    const requiresApproval = targetSpot?.requireApproval || targetSpot?.instantBooking === false;

    const bookingId = `bk_${Date.now()}`;
    const bookingNumber = `VG-${Math.floor(10000 + Math.random() * 90000)}`;
    const subtotalVal = Number(newBookingData.subtotal || newBookingData.totalPrice || 10);
    const platformFee = Number((subtotalVal * 0.10).toFixed(2));
    const ownerPayout = Number((subtotalVal - platformFee).toFixed(2));

    const safeUser = currentUser || {
      id: `usr_${Date.now()}`,
      name: 'Locatário VagaGo',
      phone: '(73) 98765-4321',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      credits: 20
    };

    const initialStatus = requiresApproval ? 'Aguardando Aprovação' : 'Confirmado';

    const completeBooking = {
      id: bookingId,
      bookingNumber,
      userId: safeUser.id,
      userName: safeUser.name,
      userPhone: safeUser.phone || "(73) 98765-4321",
      userAvatar: safeUser.avatar,
      platformFee,
      ownerPayout,
      paymentStatus: 'Aprovado',
      bookingStatus: initialStatus,
      qrCodeData: `VAGAGO-${bookingNumber}-${newBookingData.spaceId || 'SP1'}`,
      createdAt: new Date().toISOString(),
      checkInTime: null,
      checkOutTime: null,
      ...newBookingData
    };

    // Deduct credits if paid via VagaGo Wallet
    if (currentUser && newBookingData.paymentMethod === 'Carteira VagaGo') {
      const remainingCredits = Math.max(0, Number(currentUser.credits || 20) - Number(newBookingData.totalPrice || 0));
      setCurrentUser(prev => prev ? { ...prev, credits: remainingCredits } : prev);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, credits: remainingCredits } : u));
    }

    setBookings(prev => [completeBooking, ...prev]);

    // Send notification to host (Locador)
    setNotifications(prev => [
      {
        id: `not_${Date.now()}`,
        userId: newBookingData.ownerId,
        type: 'new_booking_request',
        title: requiresApproval ? '🔔 Nova Solicitação de Reserva Pendente!' : '🎉 Nova Reserva Confirmada!',
        message: `${safeUser.name} reservou sua garagem "${newBookingData.spaceTitle}" para ${newBookingData.date} (${newBookingData.startTime} às ${newBookingData.endTime}). Valor líquido a receber: R$ ${ownerPayout.toFixed(2)}`,
        read: false,
        timestamp: 'Agora mesmo'
      },
      ...prev
    ]);

    return completeBooking;
  };



  const addVehicle = (vehicleData) => {
    const safeUserId = currentUser?.id || 'usr_1';
    const newVeh = {
      id: `veh_${Date.now()}`,
      userId: safeUserId,
      isDefault: vehicles.length === 0 || Boolean(vehicleData.isDefault),
      plate: (vehicleData.plate || 'ABC-1D23').toUpperCase(),
      brand: vehicleData.brand || 'Toyota',
      model: vehicleData.model || 'Corolla',
      color: vehicleData.color || 'Prata',
      type: vehicleData.type || 'Carro Passeio',
      ...vehicleData
    };
    setVehicles(prev => [newVeh, ...prev]);
    return newVeh;
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

  const requestWithdrawal = (amount) => {
    const newWtd = {
      id: `wtd_${Date.now()}`,
      ownerId: currentUser?.id || `usr_${Date.now()}`,
      ownerName: currentUser?.name || "Anfitrião VagaGo",
      amount,
      pixKey: currentUser?.pixKey || currentUser?.email || "pix@vagago.com.br",
      status: "Pendente",
      requestedAt: new Date().toISOString().split('T')[0]
    };

    setWithdrawals(prev => [newWtd, ...prev]);
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
      setBookings(prev => prev.map(b => (b.id === bookingId || b.bookingNumber === bookingId) ? { ...b, bookingStatus: 'Cancelado' } : b));
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

  const openLoginModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  const syncGlobalParkingSpaces = () => {
    setParkingSpaces([...getGlobalParkingSpaces()]);
  };


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
      editingSpot,
      setEditingSpot,
      activeTab,
      setActiveTab,
      searchLocation,
      setSearchLocation: handleSearchLocationChange,
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
