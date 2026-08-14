'use client';

import { useEffect, useState, useRef, useMemo, type MouseEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import NaijaStates from 'naija-state-local-government';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import {
  ArrowUpIcon,
  CalendarDaysIcon,
  CloseIcon,
  EyeIcon,
  GlobeIcon,
  Icon,
  MenuIcon,
  MessageCircleIcon,
  SunIcon,
  MoonIcon,
  ThreeDotsIcon,
  ChevronDownIcon,
} from '@/components/ui/icon';
import {
  Avatar,
  AvatarImage,
} from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
} from '@/components/ui/select';
import {
  Popover,
  PopoverBackdrop,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
} from '@/components/ui/popover';
import { Pressable } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';

interface User {
  id: string;
  username: string;
  profilePic: string;
  country: string;
}

interface Comment {
  id: string;
  name: string;
  text: string;
}

interface Post {
  id: string;
  user: {
    username: string;
    profilePic: string;
  };
  avatar: string;
  state: string;
  country: string;
  title: string;
  content: string;
  codeSnippet?: string;
  imageUrl?: string;
  likes: string[];
  comments: Comment[];
  replyCount: number;
  views: number;
  tags?: string[];
  createdAt: string;
}

function HouseIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.53 3.3a1 1 0 0 0-1.06 0l-8 5.95A1 1 0 0 0 3 9.95V20a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4h6v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V9.95a1 1 0 0 0-.47-.9l-8-5.95Z" />
    </svg>
  );
}

function CalendarIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8Z" />
    </svg>
  );
}

function MessageIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M5 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5.5l-3.6 3.2a1 1 0 0 1-1.6-.8V18H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2 4a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H7Zm0 4a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2H7Z" />
    </svg>
  );
}

function SparkIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="m12 2 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" />
    </svg>
  );
}

const HANGOUT_STORAGE_KEY = 'devconnect-joined-hangouts';
const HANGOUT_ID = 'devconnect-hangout-1';

function timeAgo(dateString?: string) {
  if (!dateString) return '';
  const then = new Date(dateString).getTime();
  if (isNaN(then)) return '';
  const now = Date.now();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}months ago`;
  const years = Math.floor(months / 12);
  return `${years}years ago`;
}

function SiteFooter({ className = '' }: { className?: string }) {
  return (
    <Box className={`bg-slate-900 border border-slate-800 p-4 rounded-2xl text-slate-300 ${className}`}>
      {/* Brand Header */}
      <Box className="flex-row items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <Box className="flex-row items-center gap-2">
          <Text className="text-emerald-400 font-bold text-base">DevConnect</Text>
          <span className="text-sl bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-medium">
            GL
          </span>
        </Box>
        <Text className="text-sm text-slate-500">v1.0</Text>
      </Box>

      {/* Link Columns */}
      <Box className="grid grid-cols-3 gap-2 mb-4 text-left">

        <Box className="flex flex-col gap-1.5">
          <Text className="text-[11px] font-bold text-slate-100 uppercase tracking-wider">Company</Text>
          <a href="/company/aboutus" className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors">About Us</a>
          <a href="/company/privacy" className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors">Privacy</a>
          <a href="/company/terms" className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors">Terms</a>
        </Box>

        <Box className="flex flex-col gap-1.5">
          <Text className="text-[11px] font-bold text-slate-100 uppercase tracking-wider">Community</Text>
          <a href="/community/guideline" className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors">Guidelines</a>
          <a href="/community/support" className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors">Support</a>
          <a href="/community/faq" className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors">FAQs</a>
        </Box>

        <Box className="flex flex-col gap-1.5">
          <Text className="text-[11px] font-bold text-slate-100 uppercase tracking-wider">Connect</Text>
          <a href="/connect/contact" className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors">Contact</a>
          <a href="/connect/socials" className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors">Socials</a>
          <a href="/connect/newsletter" className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors">Newsletter</a>
        </Box>
      </Box>

      {/* Footer Tagline & Copyright */}
      <Box className="border-t border-slate-800/80 pt-3 flex flex-col gap-1">
        <Text className="text-[10px] text-slate-400 leading-tight">
          Global premier tech hub for developers, creators, and innovators.
        </Text>
        <Text className="text-[9px] text-slate-500 mt-1">
          © {new Date().getFullYear()} DevConnect Tech Ltd. All rights reserved.
        </Text>
      </Box>
    </Box>
  );
}

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [activeReplies, setActiveReplies] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [joinedHangouts, setJoinedHangouts] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const feedRef = useRef<HTMLDivElement | null>(null);
  
  const countryOptions = useMemo(() => {
  const s = new Set<string>();
  feedPosts.forEach((p) => s.add(p.country ?? (p.state ?? 'Global')));
  return Array.from(s).sort();
  }, [feedPosts]);

  const pullStartRef = useRef<number | null>(null);
  const PULL_THRESHOLD = 60;

  // persistent anonymous viewer id so anonymous views can be distinct across browsers
  const viewerId = useMemo(() => {
    try {
      if (typeof window === 'undefined') return 'anon';
      const stored = window.localStorage.getItem('devconnect-viewer-id');
      if (stored) return stored;
      const id = `anon-${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem('devconnect-viewer-id', id);
      return id;
    } catch {
      return 'anon';
    }
  }, []);

  const router = useRouter();
  const pathname = usePathname();
  
  // API URL targeting backend route
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
  const userURL = `${apiBaseUrl}/api/auth/current-user`;
  const feedPostsURL = `${apiBaseUrl}/api/posts`;

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  // fetch current authenticated user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        if (typeof window === 'undefined') return;

        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (!token) return;

        const res = await fetch(userURL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.warn('current-user fetch failed status:', res.status);
          return;
        }

        const data = await res.json().catch(() => null);
        const user = data?.user ?? data;

        if (user) {
          setCurrentUser(user);
        }
      } catch (err) {
        console.error('Fetch current user error:', err);
      }
    };

    fetchCurrentUser();
  }, [userURL]);

  // fetch feed posts
  useEffect(() => {
    const fetchFeedPosts = async () => {
      try {
        if (typeof window === 'undefined') return;

        if (refreshCounter > 0) setIsRefreshing(true);

        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        // Feed is public; include auth header only when available
        const res = await fetch(feedPostsURL, {
          method: 'GET',
          headers,
        });

        if (!res.ok) {
          console.warn('feed-posts fetch failed status:', res.status);
          return;
        }

        const data = await res.json().catch(() => null);
        if (!data) {
          console.debug('Feed fetch returned empty body');
        } else {
          console.debug('Feed fetch response shape:', data);
        }

        // Support multiple backend shapes: array, { posts: [] }, { data: { posts: [] } }
        const rawPosts = Array.isArray(data)
          ? data
          : data?.posts ?? data?.data?.posts ?? data?.data ?? [];

        // Normalize Backend Data -> Frontend Data
        const normalizedPosts: Post[] = rawPosts.map((p: any) => ({
          id: p._id,
          user: {
            username: p.user?.username ?? 'Anonymous',
            profilePic: p.user?.profilePic ?? '/icon/logo.png',
          },
          avatar: p.user?.profilePic ?? '/icon/logo.png',
          // Prefer server-provided post.state; fall back to user.country (object or string)
          state: p.state ?? (p.user?.country?.name ?? p.user?.country ?? 'Global'),
          // Explicit country for filtering
          country: p.country ?? (p.user?.country?.name ?? p.user?.country ?? 'Global'),
          title: p.title ?? '',
          content: p.content ?? '',
          codeSnippet: p.codeSnippet ?? '',
          imageUrl: p.imageUrl ?? '',
          likes: p.likes ?? [],
          comments: (p.comments || []).map((c: any) => ({
            id: c._id,
            name: c.user?.username ?? 'Anonymous',
            text: c.text,
          })),
          replyCount: p.comments ? p.comments.length : 0,
          views: p.views ?? 0,
          createdAt: p.createdAt,
          tags: p.tags ?? [],
        }));

        setFeedPosts(normalizedPosts);
      } catch (err) {
        console.error('Fetch feed posts error:', err);
      } finally {
        if (refreshCounter > 0) setIsRefreshing(false);
      }
    };

    fetchFeedPosts();
  }, [feedPostsURL, refreshCounter]);

  // Pull-to-refresh handlers
  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (el.scrollTop > 0) return;
      pullStartRef.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (pullStartRef.current === null) return;
      const dy = e.touches[0].clientY - (pullStartRef.current || 0);
      if (dy > 0) {
        e.preventDefault();
        setPullDistance(Math.min(dy / 1.5, 150));
      }
    };

    const onTouchEnd = () => {
      if (pullStartRef.current === null) return;
      if (pullDistance > PULL_THRESHOLD) {
        setIsRefreshing(true);
        setRefreshCounter((c) => c + 1);
      }
      setPullDistance(0);
      pullStartRef.current = null;
    };

    const onMouseDown = (e: MouseEvent) => {
      // only when at top
      if ((el as HTMLElement).scrollTop > 0) return;
      pullStartRef.current = (e as any).clientY;
      window.addEventListener('mousemove', onMouseMove as any, { passive: false });
      window.addEventListener('mouseup', onMouseUp as any);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (pullStartRef.current === null) return;
      const dy = (e as any).clientY - (pullStartRef.current || 0);
      if (dy > 0) {
        e.preventDefault();
        setPullDistance(Math.min(dy / 1.5, 150));
      }
    };

    const onMouseUp = () => {
      if (pullStartRef.current === null) return;
      if (pullDistance > PULL_THRESHOLD) {
        setIsRefreshing(true);
        setRefreshCounter((c) => c + 1);
      }
      setPullDistance(0);
      pullStartRef.current = null;
      window.removeEventListener('mousemove', onMouseMove as any);
      window.removeEventListener('mouseup', onMouseUp as any);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('mousedown', onMouseDown as any);

    return () => {
      el.removeEventListener('touchstart', onTouchStart as any);
      el.removeEventListener('touchmove', onTouchMove as any);
      el.removeEventListener('touchend', onTouchEnd as any);
      el.removeEventListener('mousedown', onMouseDown as any);
      window.removeEventListener('mousemove', onMouseMove as any);
      window.removeEventListener('mouseup', onMouseUp as any);
    };
  }, [pullDistance]);

  // Observe posts entering viewport to count views (once per session)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const activeViewer = currentUser?.id ?? viewerId ?? 'anon';
    const viewedKey = `devconnect-viewed-posts-${activeViewer}`;
    const viewedRaw = sessionStorage.getItem(viewedKey);
    const viewed = new Set<string>(viewedRaw ? JSON.parse(viewedRaw) : []);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const postId = el.dataset.postId;
          if (!postId) return;
          if (viewed.has(postId)) return;

          // mark as viewed in this session
          viewed.add(postId);
          try {
            sessionStorage.setItem(viewedKey, JSON.stringify(Array.from(viewed)));
          } catch {}

          // call backend to increment view count
          try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers.Authorization = `Bearer ${token}`;
            const res = await fetch(`${apiBaseUrl}/api/posts/${postId}/view`, {
              method: 'PUT',
              headers,
            });
            if (res.ok) {
              const body = await res.json().catch(() => null);
              const serverViews = body?.views ?? null;
              setFeedPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, views: serverViews ?? ((p.views ?? 0) + 1) } : p)));
            }
          } catch (err) {
            console.error('Increment view error:', err);
          }
        });
      },
      { threshold: 0.6 },
    );

    // observe current post elements
    feedPosts.forEach((p) => {
      const el = document.querySelector(`[data-post-id=\"${p.id}\"]`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [feedPosts, apiBaseUrl, currentUser?.id]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = window.localStorage.getItem(HANGOUT_STORAGE_KEY);
      const parsed = stored ? (JSON.parse(stored) as string[]) : [];
      setJoinedHangouts(parsed);
    } catch {
      setJoinedHangouts([]);
    }
  }, []);

  const handleJoinHangout = () => {
    const updated = joinedHangouts.includes(HANGOUT_ID)
      ? joinedHangouts
      : [...joinedHangouts, HANGOUT_ID];

    setJoinedHangouts(updated);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(HANGOUT_STORAGE_KEY, JSON.stringify(updated));
    }

    router.push('/hangout');
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  }

  const handleCreateTopic = () => {
    router.push('/topic');
  }

  const currentSection = pathname === '/hangout' ? 'hangout' : pathname === '/' ? 'home' : 'home';

  const navItems = [
    { label: 'Home', href: '/', icon: <HouseIcon className="h-5 w-5" />, active: currentSection === 'home' },
    { label: 'Hangout', href: '/hangout', icon: <CalendarIcon className="h-5 w-5" />, active: currentSection === 'hangout' },
    { label: 'Discussion', href: '#discussion', icon: <MessageIcon className="h-5 w-5" />, active: false },
    { label: 'Hub', href: '#hub', icon: <SparkIcon className="h-5 w-5" />, active: false },
  ];

  const handleOpen = (postId: string) => setOpenPopover(postId);
  const handleClose = () => setOpenPopover(null);
  const closeReplies = () => setActiveReplies(null);

  const visiblePosts =
    selectedCountry === 'all'
      ? feedPosts
      : feedPosts.filter((post) => post.country === selectedCountry);

  return (
    <Box className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Box className="flex min-h-screen flex-col md:h-screen md:flex-row md:overflow-hidden">
        {/* Desktop Left Sidebar Spacer */}
        <Box className="hidden md:block md:w-64 md:shrink-0" />

        {/* Main Content Area */}
        <Box className="flex-1 px-3 pb-8 md:ml-2 md:h-screen md:overflow-hidden md:p-6">
          {/* Top Zone: Fixed Header on desktop, Sticky Header on mobile */}
          <div className="sticky top-0 z-40 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800 md:relative md:border-b-0 md:bg-transparent">
            {/* Mobile Top Navigation Bar */}
            <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 py-3 md:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
                className="rounded-md p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
              <Box className="flex-row ml-auto items-center">
                <Text className="text-prima text-lg font-semibold dark:text-slate-100">DevConnect</Text>
                <img src="/icon/logo.png" className="h-10 w-10 rounded-[0.8em] ml-2" />
              </Box>
              <div className="w-9" />
            </div>

            {/* State Filter Bar */}
            <Box className="px-4 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md md:rounded-2xl md:bg-white md:dark:bg-slate-900 md:border md:border-slate-200/70 dark:border-slate-800 md:px-6 md:py-3.5 md:mb-3">
              <Box className="flex-row items-center gap-3">
                <Box className="flex-row items-center gap-2">
                 
                  <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                    Filter posts
                  </Text>
                </Box>

                <Select
                  selectedValue={selectedCountry}
                  onValueChange={(value: any) => setSelectedCountry(value)}
                >
                  <SelectTrigger
                    variant="outline"
                    size="sm"
                    className="w-44 rounded-full border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 px-4 py-1.5 data-[focus=true]:border-emerald-400 data-[focus=true]:ring-2 data-[focus=true]:ring-emerald-100"
                  >
                    <SelectInput
                      placeholder="All Countries"
                      value={selectedCountry === 'all' ? 'All Countries' : selectedCountry}
                      className="text-sm font-medium text-slate-700 dark:text-slate-200"
                    />
                    <SelectIcon className="mr-3" as={ChevronDownIcon} />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent className="max-h-[70vh] scrollbar-hide rounded-t-2xl border-t border-slate-100 bg-white px-2 pb-6 md:max-h-96 md:rounded-2xl md:border md:p-2 md:shadow-xl md:shadow-slate-950/10 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200">
                      <SelectDragIndicatorWrapper className="py-3">
                        <SelectDragIndicator className="bg-slate-200 dark:bg-slate-700" />
                      </SelectDragIndicatorWrapper>

                      <SelectItem
                        label="All Countries"
                        value="all"
                        className="mx-1 mb-1 rounded-lg border-b border-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 data-[highlighted=true]:bg-emerald-50 data-[highlighted=true]:text-emerald-700"
                      />

                      {countryOptions.map((c) => (
                        <SelectItem
                          key={c}
                          label={c}
                          value={c}
                          className="mx-1 rounded-lg px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 data-[highlighted=true]:bg-emerald-50 data-[highlighted=true]:text-emerald-700"
                        />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Toggle dark mode"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Icon as={theme === 'dark' ? SunIcon : MoonIcon} className="h-4 w-4" />
                </button>
              </Box>
            </Box>
          </div>

          {/* Welcome Card Banner */}
          <div className="welcome-card relative mt-3 mb-3 overflow-hidden rounded-2xl border border-amber-100 p-3 shadow-sm shadow-amber-100/70 md:mb-4 md:rounded-3xl md:p-6 bg-gradient-to-r from-amber-50/50 to-emerald-50/50 dark:from-slate-800/80 dark:to-slate-900/90">
            <div className="relative flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-3">
              <div className="flex flex-col gap-1">
                <Text className="text-[15px] tracking-[0.20em] md:text-xl md:tracking-[0.24em] font-bold uppercase text-amber-600">
                  Welcome to DevConnect
                </Text>
                <Text className="text-[13px] text-slate-900 dark:text-slate-100 md:text-sm">
                  Here developers connect, share knowledge, fix problems, collaborate on projects, explore discussions, join communities, and stay updated with the latest in the tech world.
                </Text>
              </div>

              <div className="flex w-auto flex-col items-center justify-center gap-2 md:gap-3">
                <div className="welcome-badge flex items-center gap-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 px-2.5 py-1.5 shadow-sm md:gap-2 md:px-3 md:py-2">
                  <span className="welcome-dot h-2 w-2 rounded-full bg-amber-500 md:h-2.5 md:w-2.5" />
                  <Text className="text-sm font-medium text-slate-700 dark:text-slate-200 md:text-xs">
                    It only takes a minute to sign in and start connecting with other developers!
                  </Text>
                </div>

                <Pressable onPress={handleSignIn} className="mt-1 w-32 items-center rounded-full bg-amber-600 px-3 py-1.5 shadow-sm transition duration-200 hover:bg-amber-700 md:mt-0 md:w-40 md:px-4 md:py-2">
                  <Text className="text-xs font-semibold text-white md:text-sm">Sign Up</Text>
                </Pressable>
              </div>
            </div>
          </div>

          {/* Grid/Flex Layout for Feed & Sidebar */}
          <Box className="flex flex-col gap-4 md:min-h-0 md:flex-1 md:flex-row md:gap-6">
            {/* Infinite Feed Column with pull-to-refresh wrapper */}
            <div
              ref={feedRef}
              className="order-2 w-full md:order-1 md:h-full md:w-[63%] md:min-h-0 md:overflow-y-auto md:pr-2 md:pb-6 scrollbar-hide"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div style={{ transform: `translateY(${pullDistance}px)`, transition: isRefreshing ? 'transform 200ms' : undefined }}>
                <div className="flex items-center justify-center h-10">
                  {pullDistance > 0 && !isRefreshing && (
                    <span className="text-sm text-slate-500">{pullDistance > PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}</span>
                  )}
                  {isRefreshing && (
                    <span className="text-sm text-slate-500">Refreshing...</span>
                  )}
                </div>
                <VStack className="w-full gap-4">
                  {visiblePosts.map((post) => (
                    <Card
                      key={post.id}
                      data-post-id={post.id}
                      className="w-full shadow shadow-slate-200 rounded-2xl bg-white border border-slate-100 p-5 dark:shadow-slate-950/40 dark:bg-slate-900 dark:border-slate-800"
                    >
                  <Box className="flex-row items-center justify-between">
                    <Box className="flex-row items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          source={{
                            uri:
                              post.user?.profilePic ??
                              post.avatar ??
                              '/icon/logo.png',
                          }}
                        />
                      </Avatar>
                      <Box>
                        <Text className="font-semibold">
                          {post.user?.username ?? 'Unknown'}
                        </Text>
                            <Text className="text-sm text-gray-500 dark:text-slate-400">
                              {post.createdAt ? `${timeAgo(post.createdAt)} · ${post.country ?? post.state ?? ''}` : post.country ?? post.state ?? ''}
                            </Text>
                      </Box>
                    </Box>
                    <Popover
                      isOpen={openPopover === post.id}
                      onClose={handleClose}
                      onOpen={() => handleOpen(post.id)}
                      placement="bottom"
                      trigger={(triggerProps) => {
                        return (
                          <Button className='bg-slate-100 dark:bg-slate-800 rounded-full p-2' {...triggerProps}>
                            <ButtonText>
                              <Icon as={ThreeDotsIcon} className="h-5 w-5 text-black dark:text-slate-100" />
                            </ButtonText>
                          </Button>
                        );
                      }}
                    >
                      <PopoverBackdrop />
                      <PopoverContent>
                        <PopoverArrow />
                        <PopoverBody>
                          <Text className="text-foreground">
                            Skip this post
                          </Text>
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  </Box>

                  <Text className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-3 mb-2">
                    {post.title}
                  </Text>
                  <Text className="text-xs text-slate-600 dark:text-slate-400 md:text-sm leading-relaxed">
                    {post.content}
                  </Text>

                  <Box className="mt-4 flex-row flex-wrap gap-2">
                    {(((post as any).tags) || []).map((tag: string) => (
                      <Card
                        key={tag}
                        className="bg-emerald-50 text-emerald-700 items-center justify-center rounded-full px-3 py-1 border border-emerald-100 shadow-none dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800"
                      >
                        <Text className="text-emerald-700 text-xs font-medium">{tag}</Text>
                      </Card>
                    ))}
                  </Box>

                  <Box className="mt-3 flex-row items-center justify-end gap-5 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <Box className="flex-row items-center gap-1">
                      <Icon as={MessageCircleIcon} className="h-4 w-4 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setActiveReplies(post.id)}
                        className="text-xs text-slate-600 dark:text-slate-300 hover:underline ml-1"
                      >
                        {post.replyCount} repl{post.replyCount === 1 ? 'y' : 'ies'}
                      </button>
                    </Box>

                    <Box className="flex-row items-center gap-1.5">
                      <Icon as={EyeIcon} className="h-4 w-4 text-slate-400" />
                      <Text className="text-xs font-medium text-slate-500">{post.views}</Text>
                    </Box>
                  </Box>
                    </Card>
                  ))}

              {visiblePosts.length === 0 && (
                <Card className="w-full rounded-2xl bg-white p-6 border border-slate-100 shadow-sm">
                  <Text className="text-slate-500 dark:text-slate-400">No posts found for {selectedCountry}.</Text>
                </Card>
              )}
                </VStack>
              </div>
            </div>

            {/* Right Sidebar (Upcoming Hangout & Desktop Footer) */}
            <Box className="order-1 w-full flex flex-col gap-4 md:order-2 md:h-full md:w-[35%] md:overflow-y-auto scrollbar-hide">
              {/* Hangout Card */}
              <Card className="w-full shadow shadow-slate-200 rounded-2xl bg-white border border-slate-100 p-4 shadow-sm dark:shadow-slate-950/40 dark:bg-slate-900 dark:border-slate-800">
                <Box className="flex-row items-center justify-between md:block">
                  <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100 md:text-center md:text-base">
                    Upcoming Live Hangout
                  </Text>
                  <Text className="text-xs font-bold text-emerald-700 md:hidden">
                    05:56:43
                  </Text>
                </Box>

                <Box className="flex-row items-center gap-3 mt-3 md:justify-center">
                  <Avatar className="h-10 w-10 md:h-12 md:w-12">
                    <AvatarImage
                      source={{
                        uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
                      }}
                    />
                  </Avatar>
                  <Box className="min-w-0 flex-1 gap-0.5 md:flex-none md:text-center">
                    <Text className="text-[10px] text-slate-400 dark:text-slate-300 md:text-xs">
                      Topic
                    </Text>
                    <Text className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100 md:text-sm">
                      Tech Market Pricing in Nigeria
                    </Text>
                  </Box>
                  <Button
                    onPress={handleJoinHangout}
                    className={joinedHangouts.includes(HANGOUT_ID) ? 'h-7 shrink-0 rounded-full px-3 py-0 bg-slate-500 md:hidden' : 'h-7 shrink-0 rounded-full px-3 py-0 bg-emerald-600 md:hidden'}
                  >
                    <ButtonText className="text-[11px] font-semibold text-white">
                      {joinedHangouts.includes(HANGOUT_ID) ? 'Joined' : 'Join'}
                    </ButtonText>
                  </Button>
                </Box>

                <Box className="hidden items-center justify-between gap-2 mt-4 md:flex md:flex-col">
                  <Text className="text-xs text-slate-400 dark:text-slate-300">
                    Starts In
                  </Text>
                  <Text className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    05 : 56 : 43
                  </Text>
                  <Button
                    onPress={handleJoinHangout}
                    className={joinedHangouts.includes(HANGOUT_ID) ? 'mt-1 w-full bg-slate-500 hover:bg-slate-600 py-2 rounded-xl' : 'mt-1 w-full bg-emerald-600 hover:bg-emerald-700 py-2 rounded-xl'}
                  >
                    <Text className="text-xs font-semibold text-white">
                      {joinedHangouts.includes(HANGOUT_ID) ? 'Joined' : 'Join Hangout'}
                    </Text>
                  </Button>
                </Box>
              </Card>

              {/* Desktop-only Footer aligned right below the Hangout card */}
              <SiteFooter className="hidden md:block" />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Navigation Drawer Menu (Holds Mobile Footer for easy access) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 -translate-x-full transform bg-slate-900 text-white shadow-2xl transition-transform duration-300 ease-out md:w-64 md:translate-x-0 md:shadow-none ${
          mobileOpen ? 'translate-x-0' : ''
        }`}
        onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
      >
        <Box className="flex h-full w-full flex-col p-6 overflow-y-auto scrollbar-hide">
          <Box className="mb-6 flex-row items-center justify-between">
            <Text className="text-emerald-400 text-xl font-bold">DevConnect</Text>
            <img src="/icon/logo.png" className="h-10 w-10 rounded-[0.8em]" />
            <button
              type="button"
              className="rounded-md p-2 text-slate-300 hover:bg-slate-800 hover:text-white md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </Box>

          {/* Nav Items */}
          <Box className="gap-1.5 mb-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition duration-200 ${
                  item.active
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.15)]'
                    : 'border-transparent text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className={item.active ? 'text-emerald-300' : 'text-emerald-400'}>{item.icon}</span>
                <span className={item.active ? 'font-semibold' : 'font-medium'}>{item.label}</span>
              </a>
            ))}
          </Box>

          {/* User Profile Card */}
          {currentUser && (
            <Box className="mb-6 rounded-xl border border-slate-800 bg-slate-800/60 p-4">
              <a className="flex items-center gap-3 rounded-lg py-2 text-sm font-medium text-slate-300">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    source={{
                      uri:
                        currentUser.profilePic ??
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
                    }}
                  />
                </Avatar>
                <Text className="text-sm font-semibold text-slate-100">
                  {currentUser.username}
                </Text>
              </a>

              <Pressable
                onPress={handleCreateTopic}
                className="mt-3 flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-center transition hover:bg-emerald-700"
              >
                <Text className="text-sm font-semibold text-white">Create Topic</Text>
              </Pressable>
            </Box>
          )}
          {/* Mobile Footer Inside Drawer */}
          <Box className="mt-auto pt-4 border-t border-slate-800 md:hidden">
            <SiteFooter className="border-0 bg-transparent p-0" />
          </Box>
        </Box>
      </div>

      {showScrollTop ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-slate-100 shadow-lg shadow-slate-950/20 transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
        >
          <Icon as={ArrowUpIcon} className="h-5 w-5" />
        </button>
      ) : null}

      {/* Replies Modal (simple inline) */}
      {activeReplies ? (
        (() => {
          const post = feedPosts.find((p) => p.id === activeReplies);
          if (!post) return null;
          return (
            <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
              <div className="absolute inset-0 bg-slate-900/50" onClick={closeReplies} />
              <div className="relative z-10 w-full max-w-lg rounded-t-2xl bg-white p-4 shadow-xl dark:bg-slate-900 md:rounded-2xl md:p-6">
                <div className="flex items-center justify-between">
                  <Text className="font-semibold">Comments</Text>
                  <button type="button" onClick={closeReplies} className="text-sm text-slate-500">Close</button>
                </div>

                <div className="mt-3 max-h-64 overflow-y-auto">
                  {post.comments.length === 0 ? (
                    <Text className="text-sm text-slate-500">No comments yet.</Text>
                  ) : (
                    post.comments.map((r) => (
                      <Box key={r.id} className="mb-3">
                        <Text className="font-semibold">{r.name}</Text>
                        <Text className="text-sm text-slate-600 dark:text-slate-300">{r.text}</Text>
                      </Box>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })()
      ) : null}

      {/* Drawer Overlay Backdrop */}
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/50 md:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation overlay"
        />
      ) : null}
    </Box>
  );
}