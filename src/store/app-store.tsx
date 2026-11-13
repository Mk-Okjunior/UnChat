import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import * as Crypto from 'expo-crypto';
import type { ImagePickerAsset } from 'expo-image-picker';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { useColorScheme } from '../hooks/use-color-scheme';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { uploadStudentIdCard } from '../services/student-id-upload';
import { setThemeMode as applyTheme } from '../theme';

const STORAGE_KEY = 'unchat-demo-state-v1';
const DEMO_USERS_KEY = 'unchat-demo-users-v1';
const DEMO_SESSION_KEY = 'unchat-demo-session-v1';

const buildDemoImage = (label: string, bg: string, fg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320">
    <rect width="320" height="320" rx="32" fill="${bg}"/>
    <circle cx="160" cy="115" r="56" fill="${fg}" fill-opacity="0.9"/>
    <path d="M72 248c16-36 48-56 88-56s72 20 88 56" fill="${fg}" fill-opacity="0.9"/>
    <text x="50%" y="285" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="white">${label}</text>
  </svg>
`)}`;

const DEMO_SEED_ACCOUNTS: Account[] = [
  {
    id: 'demo-admin',
    fullName: 'Admin Demo',
    email: 'admin@demo.local',
    university: 'Chuo Kikuu cha Dar es Salaam',
    course: 'Administration',
    year: 'Mwaka 3',
    role: 'admin',
    avatarUrl: buildDemoImage('AD', '#1d4ed8', '#dbeafe'),
  },
  {
    id: 'demo-student',
    fullName: 'Student Demo',
    email: 'student@demo.local',
    university: 'Ardhi University',
    course: 'Computer Science',
    year: 'Mwaka 2',
    role: 'student',
    avatarUrl: buildDemoImage('SD', '#0f766e', '#ccfbf1'),
  },
];

const readDemoAccounts = async (): Promise<Account[]> => {
  try {
    const raw = await AsyncStorage.getItem(DEMO_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Account[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeDemoAccounts = async (accounts: Account[]) => {
  await AsyncStorage.setItem(DEMO_USERS_KEY, JSON.stringify(accounts));
};

const ensureDemoAccounts = async (): Promise<Account[]> => {
  const accounts = await readDemoAccounts();
  if (accounts.length > 0) return accounts;
  await writeDemoAccounts(DEMO_SEED_ACCOUNTS);
  return DEMO_SEED_ACCOUNTS;
};

const readDemoSession = async (): Promise<Account | null> => {
  try {
    const raw = await AsyncStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Account>;
    return parsed && parsed.id && parsed.email ? (parsed as Account) : null;
  } catch {
    return null;
  }
};

const writeDemoSession = async (account: Account | null) => {
  if (!account) {
    await AsyncStorage.removeItem(DEMO_SESSION_KEY);
    return;
  }
  await AsyncStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(account));
};

export type Account = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  university: string;
  course: string;
  year: string;
  role: 'student' | 'admin';
  avatarUrl?: string | null;
  studentIdCardPath?: string | null;
};

type ProfileRow = {
  id: string;
  email: string;
  phone: string | null;
  full_name: string;
  university: string;
  course: string;
  year: string;
  role: 'student' | 'admin';
  student_id_card_path: string | null;
};

export type Post = {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  university: string;
  text: string;
  image?: string | null;
  createdAt: string;
  likes: string[];
  comments: { id: string; authorName: string; text: string }[];
};

export type Group = {
  id: string;
  name: string;
  category: string;
  members: number;
  memberIds: string[];
};

export type Message = { id: string; senderId: string; text: string; createdAt: string };
export type Conversation = { id: string; name: string; messages: Message[] };

type AppData = {
  posts: Post[];
  groups: Group[];
  conversations: Conversation[];
  followedIds: string[];
  savedJobs: string[];
  savedResources: string[];
  notificationsEnabled: boolean;
  themeMode: 'system' | 'light' | 'dark';
};

type Registration = Pick<Account, 'fullName' | 'email' | 'phone' | 'university' | 'course' | 'year'> & { password: string };

type AppStore = {
  ready: boolean;
  user: Account | null;
  authError: string | null;
  posts: Post[];
  groups: Group[];
  conversations: Conversation[];
  followedIds: string[];
  savedJobs: string[];
  savedResources: string[];
  notificationsEnabled: boolean;
  themeMode: AppData['themeMode'];
  isDarkMode: boolean;
  register: (input: Registration) => Promise<{ error: string | null; confirmationRequired: boolean }>;
  verifySignupOtp: (email: string, token: string, studentIdCard: ImagePickerAsset) => Promise<string | null>;
  completeStudentRegistration: (studentIdCard: ImagePickerAsset) => Promise<string | null>;
  resendSignupOtp: (email: string) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  updateProfile: (input: Pick<Account, 'fullName' | 'university' | 'course' | 'year'> & { avatarUrl?: string | null }) => Promise<string | null>;
  addPost: (text: string, image?: string | null) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  addGroup: (name: string, category: string) => void;
  joinGroup: (groupId: string) => void;
  toggleFollow: (id: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  toggleSavedJob: (id: string) => void;
  toggleSavedResource: (id: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setThemeMode: (mode: AppData['themeMode']) => void;
};

const sampleGroups: Group[] = [
  { id: 'udsm', name: 'UDSM - Wanachuo', category: 'Vyuo', members: 12400, memberIds: [] },
  { id: 'aru', name: 'Ardhi University (ARU)', category: 'Vyuo', members: 8700, memberIds: [] },
  { id: 'muhas', name: 'MUHAS - Wanachuo', category: 'Vyuo', members: 6200, memberIds: [] },
  { id: 'cs-study', name: 'Computer Science Study Group', category: 'Masomo', members: 482, memberIds: [] },
  { id: 'year-two', name: 'UDSM Year 2', category: 'Madarasa', members: 316, memberIds: [] },
];

const samplePosts: Post[] = [
  {
    id: 'welcome-post',
    authorId: 'sample-amina',
    authorName: 'Amina Hassan',
    authorAvatarUrl: buildDemoImage('AH', '#1d4ed8', '#dbeafe'),
    university: 'Chuo Kikuu cha Dar es Salaam',
    text: 'Nafasi za masomo za mwaka huu zimetangazwa! Hakikisheni mnatuma maombi mapema.',
    image: buildDemoImage('MASOMO', '#0f172a', '#3b82f6'),
    createdAt: new Date().toISOString(),
    likes: [],
    comments: [],
  },
  {
    id: 'study-post',
    authorId: 'sample-neema',
    authorName: 'Neema John',
    authorAvatarUrl: buildDemoImage('NJ', '#0f766e', '#ccfbf1'),
    university: 'Ardhi University',
    text: 'Nani yuko tayari kujiunga na study group ya Calculus wiki hii?',
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
    likes: [],
    comments: [],
  },
];

const sampleConversations: Conversation[] = [
  {
    id: 'daniel',
    name: 'Daniel Mwakalonge',
    messages: [{ id: 'daniel-1', senderId: 'daniel', text: 'Karibu UniChat! Umeanza semester vizuri?', createdAt: new Date().toISOString() }],
  },
  {
    id: 'class-cs',
    name: 'Group ya Darasa (CS)',
    messages: [{ id: 'cs-1', senderId: 'class-cs', text: 'Tumeweka notes mpya za leo.', createdAt: new Date().toISOString() }],
  },
  {
    id: 'neema',
    name: 'Neema John',
    messages: [{ id: 'neema-1', senderId: 'neema', text: 'Unaweza kunitumia notes za jana?', createdAt: new Date().toISOString() }],
  },
];

const initialData: AppData = {
  posts: samplePosts,
  groups: sampleGroups,
  conversations: sampleConversations,
  followedIds: [],
  savedJobs: [],
  savedResources: [],
  notificationsEnabled: true,
  themeMode: 'system',
};

function mapProfile(row: ProfileRow): Account {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone ?? '',
    fullName: row.full_name,
    university: row.university,
    course: row.course,
    year: row.year,
    role: row.role,
    avatarUrl: null,
    studentIdCardPath: row.student_id_card_path,
  };
}

const StoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(initialData);
  const [user, setUser] = useState<Account | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [authError, setAuthError] = useState<string | null>(null);
  const dataRef = useRef(data);
  const ready = storageReady && authReady;
  const systemColorScheme = useColorScheme();
  const isDarkMode = data.themeMode === 'dark' || (data.themeMode === 'system' && systemColorScheme === 'dark');
  applyTheme(isDarkMode);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!active) return;
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<AppData> & { users?: unknown; sessionId?: unknown; darkMode?: unknown };
          const { users: legacyUsers, sessionId: legacySession, darkMode: legacyDarkMode, ...persistedData } = parsed;
          const themeMode = persistedData.themeMode ?? (legacyDarkMode === true ? 'dark' : 'system');
          dataRef.current = { ...initialData, ...persistedData, themeMode };
          setData(dataRef.current);
          if (legacyUsers !== undefined || legacySession !== undefined || legacyDarkMode !== undefined) {
            return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataRef.current));
          }
        }
      })
      .catch((error: unknown) => {
        console.error('Failed to load local app data:', error);
      })
      .finally(() => {
        if (active) setStorageReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const commit = (update: (current: AppData) => AppData) => {
    const next = update(dataRef.current);
    dataRef.current = next;
    setData(next);
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch((error: unknown) => {
      console.error('Failed to save local app data:', error);
    });
  };

  const loadProfile = async (session: Session) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id,full_name,email,phone,university,course,year,role,student_id_card_path')
      .eq('id', session.user.id)
      .single();
    if (error) throw new Error(error.message);
    if (profile.role !== 'admin' && profile.role !== 'student') {
      throw new Error('Role ya akaunti haijatambulika.');
    }
    return mapProfile(profile as ProfileRow);
  };

  const saveStudentIdCard = async (userId: string, studentIdCard: ImagePickerAsset) => {
    const path = await uploadStudentIdCard(userId, studentIdCard);
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ student_id_card_path: path })
      .eq('id', userId)
      .select('id,full_name,email,phone,university,course,year,role,student_id_card_path')
      .single();
    if (error) {
      await supabase.storage.from('student-id-cards').remove([path]).catch(() => undefined);
      throw new Error(error.message);
    }
    const account = mapProfile(profile as ProfileRow);
    setUser(account);
    return account;
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      void readDemoSession().then((sessionUser) => {
        if (sessionUser) {
          setUser(sessionUser);
          setAuthError(null);
          setAuthReady(true);
          return;
        }

        const demoUser = DEMO_SEED_ACCOUNTS[0];
        void writeDemoSession(demoUser)
          .then(() => {
            setUser(demoUser);
            setAuthError(null);
          })
          .finally(() => {
            setAuthReady(true);
          });
      });
      return;
    }

    let active = true;
    let profileLoadTimer: ReturnType<typeof setTimeout> | undefined;
    let sessionVersion = 0;
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentVersion = ++sessionVersion;
      if (profileLoadTimer) clearTimeout(profileLoadTimer);
      if (!session) {
        setUser(null);
        setAuthError(null);
        setAuthReady(true);
        return;
      }

      setAuthReady(false);
      profileLoadTimer = setTimeout(() => {
        void loadProfile(session)
          .then((profile) => {
            if (!active || currentVersion !== sessionVersion) return;
            setUser(profile);
            setAuthError(null);
          })
          .catch((error: unknown) => {
            if (!active || currentVersion !== sessionVersion) return;
            setUser(null);
            setAuthError(error instanceof Error ? error.message : 'Imeshindikana kupakia profaili.');
          })
          .finally(() => {
            if (active && currentVersion === sessionVersion) setAuthReady(true);
          });
      }, 0);
    });

    return () => {
      active = false;
      if (profileLoadTimer) clearTimeout(profileLoadTimer);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const register = async (input: Registration) => {
    if (!isSupabaseConfigured) {
      return { error: 'Uthibitishaji wa barua pepe unahitaji kuunganisha Supabase.', confirmationRequired: false };
    }
    const { data: result, error } = await supabase.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: {
        data: {
          full_name: input.fullName.trim(),
          phone: input.phone?.trim() ?? '',
          university: input.university.trim(),
          course: input.course.trim(),
          year: input.year,
        },
      },
    });
    if (!error && result.session) {
      await supabase.auth.signOut({ scope: 'local' });
      return { error: 'Washa Email confirmations kwenye Supabase ili OTP ithibitishwe kabla ya kuingia.', confirmationRequired: false };
    }
    return {
      error: error?.message ?? null,
      confirmationRequired: !error && !!result.user,
    };
  };

  const verifySignupOtp = async (email: string, token: string, studentIdCard: ImagePickerAsset) => {
    if (!isSupabaseConfigured) return 'Uthibitishaji wa barua pepe unahitaji kuunganisha Supabase.';
    const { data: result, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: 'email',
    });
    if (error) return error.message;
    if (!result.user) return 'Imeshindikana kuthibitisha akaunti. Jaribu tena.';
    try {
      await saveStudentIdCard(result.user.id, studentIdCard);
      return null;
    } catch (cause) {
      return cause instanceof Error ? cause.message : 'Imeshindikana kuhifadhi picha ya kitambulisho.';
    }
  };

  const completeStudentRegistration = async (studentIdCard: ImagePickerAsset) => {
    if (!isSupabaseConfigured) return 'Usajili unahitaji kuunganisha Supabase.';
    if (!user || user.role !== 'student') return 'Ingia tena ili kukamilisha usajili.';
    try {
      await saveStudentIdCard(user.id, studentIdCard);
      return null;
    } catch (cause) {
      return cause instanceof Error ? cause.message : 'Imeshindikana kuhifadhi picha ya kitambulisho.';
    }
  };

  const resendSignupOtp = async (email: string) => {
    if (!isSupabaseConfigured) return 'Uthibitishaji wa barua pepe unahitaji kuunganisha Supabase.';
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim().toLowerCase() });
    return error?.message ?? null;
  };

  const login = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const demoPassword = 'demo123';
    const demoAccount = DEMO_SEED_ACCOUNTS.find((item) => item.email.toLowerCase() === normalizedEmail);

    if (demoAccount && password === demoPassword) {
      await writeDemoSession(demoAccount);
      setUser(demoAccount);
      setAuthError(null);
      return null;
    }

    if (!isSupabaseConfigured) {
      const accounts = await ensureDemoAccounts();
      const matched = accounts.find((item) => item.email.toLowerCase() === normalizedEmail);
      if (!matched) return 'Barua pepe haipo kwenye demo accounts.';
      if (password !== demoPassword) return 'Nenosiri si sahihi.';
      await writeDemoSession(matched);
      setUser(matched);
      setAuthError(null);
      return null;
    }
    const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    return error?.message ?? null;
  };

  const toggleListItem = (list: string[], id: string) => list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

  const value: AppStore = {
    ready,
    user,
    authError,
    posts: data.posts,
    groups: data.groups,
    conversations: data.conversations,
    followedIds: data.followedIds,
    savedJobs: data.savedJobs,
    savedResources: data.savedResources,
    notificationsEnabled: data.notificationsEnabled,
    themeMode: data.themeMode,
    isDarkMode,
    register,
    verifySignupOtp,
    completeStudentRegistration,
    resendSignupOtp,
    login,
    logout: async () => {
      if (!isSupabaseConfigured) {
        setUser(null);
        await writeDemoSession(null);
        return;
      }
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
    },
    updateProfile: async (input) => {
      if (!user) return 'Ingia tena kabla ya kusasisha profaili.';
      if (!isSupabaseConfigured) {
        const nextUser: Account = {
          ...user,
          fullName: input.fullName,
          university: input.university,
          course: input.course,
          year: input.year,
          avatarUrl: input.avatarUrl ?? user.avatarUrl ?? null,
        };
        const accounts = await readDemoAccounts();
        const updatedAccounts = accounts.map((item) => item.id === user.id ? nextUser : item);
        await writeDemoAccounts(updatedAccounts.length ? updatedAccounts : [nextUser]);
        await writeDemoSession(nextUser);
        setUser(nextUser);
        return null;
      }
      const { data: profile, error } = await supabase
        .from('profiles')
        .update({
          full_name: input.fullName,
          university: input.university,
          course: input.course,
          year: input.year,
        })
        .eq('id', user.id)
        .select('id,full_name,email,university,course,year,role')
        .single();
      if (error) return error.message;
      if (profile.role !== 'admin' && profile.role !== 'student') return 'Role ya akaunti haijatambulika.';
      setUser({
        id: profile.id,
        fullName: profile.full_name,
        email: profile.email,
        university: profile.university,
        course: profile.course,
        year: profile.year,
        role: profile.role,
        avatarUrl: input.avatarUrl ?? user.avatarUrl ?? null,
      });
      return null;
    },
    addPost: (text, image = null) => {
      if (!user) return;
      const cleanText = text.trim();
      if (!cleanText && !image) return;
      const post: Post = {
        id: Crypto.randomUUID(), authorId: user.id, authorName: user.fullName,
        authorAvatarUrl: user.avatarUrl ?? null,
        university: user.university || 'Mwanachuo', text: cleanText, image: image || null, createdAt: new Date().toISOString(), likes: [], comments: [],
      };
      commit((current) => ({ ...current, posts: [post, ...current.posts] }));
    },
    toggleLike: (postId) => {
      if (!user) return;
      commit((current) => ({ ...current, posts: current.posts.map((post) => post.id === postId
        ? { ...post, likes: toggleListItem(post.likes, user.id) } : post) }));
    },
    addComment: (postId, text) => {
      if (!user || !text.trim()) return;
      commit((current) => ({ ...current, posts: current.posts.map((post) => post.id === postId
        ? { ...post, comments: [...post.comments, { id: Crypto.randomUUID(), authorName: user.fullName, text: text.trim() }] } : post) }));
    },
    addGroup: (name, category) => {
      if (!user || !name.trim()) return;
      const group: Group = { id: Crypto.randomUUID(), name: name.trim(), category, members: 1, memberIds: [user.id] };
      commit((current) => ({ ...current, groups: [group, ...current.groups] }));
    },
    joinGroup: (groupId) => {
      if (!user) return;
      commit((current) => ({ ...current, groups: current.groups.map((group) => {
        if (group.id !== groupId) return group;
        const joined = group.memberIds.includes(user.id);
        return { ...group, members: group.members + (joined ? -1 : 1), memberIds: toggleListItem(group.memberIds, user.id) };
      }) }));
    },
    toggleFollow: (id) => commit((current) => ({ ...current, followedIds: toggleListItem(current.followedIds, id) })),
    sendMessage: (conversationId, text) => {
      if (!user || !text.trim()) return;
      const message: Message = { id: Crypto.randomUUID(), senderId: user.id, text: text.trim(), createdAt: new Date().toISOString() };
      commit((current) => ({
        ...current,
        conversations: current.conversations.some((item) => item.id === conversationId)
          ? current.conversations.map((item) => item.id === conversationId ? { ...item, messages: [...item.messages, message] } : item)
          : [...current.conversations, { id: conversationId, name: conversationId, messages: [message] }],
      }));
    },
    toggleSavedJob: (id) => commit((current) => ({ ...current, savedJobs: toggleListItem(current.savedJobs, id) })),
    toggleSavedResource: (id) => commit((current) => ({ ...current, savedResources: toggleListItem(current.savedResources, id) })),
    setNotificationsEnabled: (enabled) => commit((current) => ({ ...current, notificationsEnabled: enabled })),
    setThemeMode: (themeMode) => {
      applyTheme(themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark'));
      commit((current) => ({ ...current, themeMode }));
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useAppStore must be used within AppStoreProvider');
  return context;
}