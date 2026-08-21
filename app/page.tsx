'use client';

import { useEffect, useState, useRef, useMemo, type MouseEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import {
  ArrowUpIcon,
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
import { Avatar, AvatarImage } from '@/components/ui/avatar';
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

interface CurrentUser {
  _id: string;
  id?: string;
  username: string;
  profilePic?: string;
  country?: { 
    name: string; 
    code: string; 
    dialCode: string 
  } | string;
  isVerified?: boolean;
  language?: string[];
  languages?: string[];
  framework?: string[];
  frameworks?: string[];
}

interface Reply {
  _id: string;
  user?: { _id: string; username: string; profilePic?: string };
  text: string;
  createdAt?: string;
}

interface Comment {
  _id: string;
  user?: { _id: string; username: string; profilePic?: string };
  text: string;
  createdAt?: string;
  replies?: Reply[];
}

interface Post {
  _id: string;
  id?: string;
  user?: { _id: string; username: string; profilePic?: string; country?: any };
  title?: string;
  content: string;
  codeSnippet?: string;
  imageUrl?: string;
  tags?: string[];
  likes: string[];
  comments: Comment[];
  views?: number;
  createdAt: string;
  country?: string;
  state?: string;
}


const HANGOUT_STORAGE_KEY = 'devconnect-joined-hangouts';
const HANGOUT_ID = 'devconnect-hangout-1';
const PROFILE_REMINDER_DISMISS_KEY = 'devconnect-profile-reminder-dismissed';
const FALLBACK_AVATAR = 'https://th.bing.com/th/id/OIP.AhjRvsXgcvfCcr8Zj07lcgHaE7?w=280&h=187&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3';
const PULL_THRESHOLD = 60;

function getApiBase() {
  return (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');
}

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return (
    window.localStorage.getItem('authToken') ??
    window.sessionStorage.getItem('authToken') ??
    window.localStorage.getItem('token') ??
    ''
  );
}

function authHeaders(token: string): Record<string, string> {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

function getStoredJoinedHangouts(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const s = window.localStorage.getItem(HANGOUT_STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

function timeAgo(iso?: string): string {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (isNaN(diff)) return '';
  if (diff < 60)    return 'just now';
  if (diff < 3600)  { const m = Math.floor(diff / 60);    return `${m} ${m === 1 ? 'min' : 'mins'} ago`; }
  if (diff < 86400) { const h = Math.floor(diff / 3600);  return `${h} ${h === 1 ? 'hr' : 'hrs'} ago`; }
  if (diff < 604800){ const d = Math.floor(diff / 86400); return `${d} ${d === 1 ? 'day' : 'days'} ago`; }
  return new Date(iso).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
}

function getUserId(u: CurrentUser | null): string {
  return u?._id ?? u?.id ?? '';
}

function getUserLanguages(u: CurrentUser | null): string[] {
  if (!u) return [];
  if (Array.isArray(u.languages)) return u.languages;
  if (Array.isArray(u.language)) return u.language;
  return [];
}

function getUserFrameworks(u: CurrentUser | null): string[] {
  if (!u) return [];
  if (Array.isArray(u.frameworks)) return u.frameworks;
  if (Array.isArray(u.framework)) return u.framework;
  return [];
}

function getCountryName(c: any): string {
  if (!c) return 'Global';
  if (typeof c === 'string') return c;
  return c.name ?? 'Global';
}

function HouseIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12.53 3.3a1 1 0 0 0-1.06 0l-8 5.95A1 1 0 0 0 3 9.95V20a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4h6v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V9.95a1 1 0 0 0-.47-.9l-8-5.95Z" /></svg>;
}
function CalendarIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 8H4v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8Z" /></svg>;
}
function MessageIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M5 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5.5l-3.6 3.2a1 1 0 0 1-1.6-.8V18H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2 4a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H7Zm0 4a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2H7Z" /></svg>;
}
function SparkIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="m12 2 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" /></svg>;
}
function HeartIcon({ filled, className = 'h-4 w-4' }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.08C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 14.5 12 21 12 21Z" />
    </svg>
  );
}
function ReplyIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M9 17l-4-4 4-4M5 13h8a4 4 0 0 1 4 4v1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SiteFooter({ className = '' }: { className?: string }) {
  return (
    <Box className={`shrink-0 overflow-hidden bg-slate-900 border border-slate-800 p-4 rounded-2xl text-slate-300 ${className}`}>
      <Box className="flex-row items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <Box className="flex-row items-center gap-2">
          <Text className="text-emerald-400 font-bold text-base">DevConnect</Text>
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full text-xs font-medium">GL</span>
        </Box>
        <Text className="text-sm text-slate-500">v1.0</Text>
      </Box>
      <Box className="grid grid-cols-3 gap-2 mb-4 text-left">
        {[
          { title: 'Company', links: [['About Us', '/company/aboutus'], ['Privacy', '/company/privacy'], ['Terms', '/company/terms']] },
          { title: 'Community', links: [['Guidelines', '/community/guideline'], ['Support', '/community/support'], ['FAQs', '/community/faq']] },
          { title: 'Connect', links: [['Contact', '/connect/contact'], ['Socials', '/connect/socials'], ['Newsletter', '/connect/newsletter']] },
        ].map((col) => (
          <Box key={col.title} className="flex flex-col gap-1.5">
            <Text className="text-[11px] font-bold text-slate-100 uppercase tracking-wider">{col.title}</Text>
            {col.links.map(([label, href]) => (
              <a key={label} href={href} className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors">{label}</a>
            ))}
          </Box>
        ))}
      </Box>
      <Box className="border-t border-slate-800/80 pt-3 flex flex-col gap-1">
        <Text className="text-[10px] text-slate-400 leading-tight">Global premier tech hub for developers, creators, and innovators.</Text>
        <Text className="text-[9px] text-slate-500 mt-1">© {new Date().getFullYear()} DevConnect. All rights reserved.</Text>
      </Box>
    </Box>
  );
}

function CommentThread({
  comment,
  postId,
  currentUser,
  onReplyAdded,
}: {
  comment: Comment;
  postId: string;
  currentUser: CurrentUser | null;
  onReplyAdded: (postId: string, commentId: string, replies: Reply[]) => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyDraft, setReplyDraft] = useState('');
  const [replying, setReplying] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const router = useRouter();

  const handleAddReply = async () => {
    const token = getToken();
    if (!token) { router.push('/auth/signin'); return; }
    if (!replyDraft.trim()) return;
    setReplying(true);
    try {
      const res = await fetch(`${getApiBase()}/api/posts/${postId}/comment/${comment._id}/reply`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ text: replyDraft.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        onReplyAdded(postId, comment._id, data.replies);
        setReplyDraft('');
        setShowReplyInput(false);
        setShowReplies(true);
      }
    } catch (err) { console.error('addReply error:', err); }
    finally { setReplying(false); }
  };

  const replies = comment.replies ?? [];

  return (
    <Box className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
      {/* Comment row */}
      <Box className="flex items-start px-3 py-2.5">
        <Box className="flex flex-row gap-2">
          <Avatar className="h-7 w-7 shrink-0 mt-0.5">
            <AvatarImage source={{ uri: comment.user?.profilePic ?? FALLBACK_AVATAR }} />
          </Avatar>
          <Text className="text-xs mt-2 font-semibold text-emerald-600">{comment.user?.username ?? 'User'}</Text>
        </Box>
        {comment.createdAt ? (
          <Text className="text-[10px] text-center ml-10 text-slate-400">{timeAgo(comment.createdAt)}</Text>
        ) : null}
        <Box className="flex-1 min-w-0">
          <Text className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">{comment.text}</Text>
          <Box className="flex flex-row items-center gap-3 mt-1.5">
            {currentUser ? (
              <button
                type="button"
                onClick={() => setShowReplyInput((v) => !v)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-600 transition"
              >
                <ReplyIcon className="h-3.5 w-3.5" />
                Reply
              </button>
            ) : null}
            {replies.length > 0 && (
              <button
                type="button"
                onClick={() => setShowReplies((v) => !v)}
                className="text-[11px] text-slate-400  text-emerald-600 hover:underline"
              >
                {showReplies ? 'Hide' : `View ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
              </button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Reply input */}
      {showReplyInput && currentUser ? (
        <Box className="px-3 pb-2.5 flex gap-2 bg-slate-50 dark:bg-slate-800/50">
          <Avatar className="h-6 w-6 shrink-0 mt-1.5">
            <AvatarImage source={{ uri: currentUser.profilePic ?? FALLBACK_AVATAR }} />
          </Avatar>
          <input
            value={replyDraft}
            onChange={(e) => setReplyDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddReply(); }}
            placeholder={`Reply to ${comment.user?.username ?? 'User'}...`}
            className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none"
          />
          <button
            type="button"
            onClick={handleAddReply}
            disabled={replying || !replyDraft.trim()}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            {replying ? '...' : 'Send'}
          </button>
        </Box>
      ) : null}

      {/* Nested replies */}
      {showReplies && replies.length > 0 ? (
        <Box className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 px-3 py-2 flex flex-col gap-2">
          {replies.map((reply) => (
            <Box key={reply._id} className="flex gap-0.5 items-start">
              <Box className="flex flex-row gap-2">
              <Avatar className="h-6 w-6 shrink-0 mt-0.5">
                <AvatarImage source={{ uri: reply.user?.profilePic ?? FALLBACK_AVATAR }} />
              </Avatar>
                  <Text className="text-[11px] font-semibold mt-1.5 text-emerald-600">{reply.user?.username ?? 'User'}</Text>
              </Box>
              {reply.createdAt ? (
                <Text className="text-[10px] ml-10 text-slate-400">{timeAgo(reply.createdAt)}</Text>
              ) : null}
              <Text className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">{reply.text}</Text>
          
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showProfileReminder, setShowProfileReminder] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [joinedHangouts, setJoinedHangouts] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [commentDraft, setCommentDraft] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const feedRef = useRef<HTMLDivElement | null>(null);
  const pullStartRef = useRef<number | null>(null);
  const viewedPostsRef = useRef<Set<string>>(new Set());
  const uid = getUserId(currentUser);

  const router = useRouter();
  const pathname = usePathname();
  const toggleTheme = () => setTheme((p) => (p === 'light' ? 'dark' : 'light'));

  const countryOptions = useMemo(() => {
    const s = new Set<string>();
    posts.forEach((p) => {
      const c = p.country ?? getCountryName(p.user?.country);
      if (c && c !== 'Global') s.add(c);
    });
    return Array.from(s).sort();
  }, [posts]);

  useEffect(() => {
    const s = window.localStorage.getItem('theme');
    if (s === 'dark' || s === 'light') setTheme(s);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Hangout storage ────────────────────────────────────────────────────────
  useEffect(() => { setJoinedHangouts(getStoredJoinedHangouts()); }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${getApiBase()}/api/auth/current-user`, { headers: authHeaders(token) })
      .then((r) => r.json())
      .then((data) => {
        const user = data?.user ?? (data?.username ? data : null);
        if (!user) return;
        setCurrentUser(user);

        const langs = getUserLanguages(user);
        const fws = getUserFrameworks(user);
        const profileIncomplete = langs.length === 0 || fws.length === 0;

        if (profileIncomplete) {
          const alreadyDismissed =
            typeof window !== 'undefined' &&
            window.sessionStorage.getItem(PROFILE_REMINDER_DISMISS_KEY) === '1';
          if (!alreadyDismissed) setShowProfileReminder(true);
        }
      })
      .catch((err) => console.error('getCurrentUser error:', err));
  }, []);

  useEffect(() => {
    if (refreshCounter > 0) setIsRefreshing(true);
    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    fetch(`${getApiBase()}/api/posts`, { headers })
      .then((r) => r.json())
      .then((data) => {
        const raw = Array.isArray(data) ? data : data?.posts ?? data?.data?.posts ?? [];
        setPosts(raw);
      })
      .catch((err) => console.error('fetchPosts error:', err))
      .finally(() => { setPostsLoading(false); setIsRefreshing(false); });
  }, [refreshCounter]);

  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;

    const isDesktopScroll = () =>
      typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;

    const atPageTop = () =>
      (window.scrollY || document.documentElement.scrollTop) <= 0;

    const isAtTop = () => (isDesktopScroll() ? el.scrollTop <= 0 : atPageTop());

    const onTouchStart = (e: TouchEvent) => {
      if (!isAtTop()) {
        pullStartRef.current = null;
        return;
      }
      pullStartRef.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (pullStartRef.current === null) return;

      if (!isAtTop()) {
        pullStartRef.current = null;
        setPullDistance(0);
        return;
      }

      const dy = e.touches[0].clientY - pullStartRef.current;
      if (dy > 0) {
        e.preventDefault();
        setPullDistance(Math.min(dy / 1.5, 120));
      }
    };

    const onTouchEnd = () => {
      if (pullDistance > PULL_THRESHOLD) setRefreshCounter((c) => c + 1);
      setPullDistance(0);
      pullStartRef.current = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove as any);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [pullDistance]);

  const registerView = async (postId: string) => {
    if (!postId || viewedPostsRef.current.has(postId)) return;
    viewedPostsRef.current.add(postId);
    try {
      const res = await fetch(`${getApiBase()}/api/posts/${postId}/view`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.map((p) =>
          (p._id ?? p.id) === postId ? { ...p, views: data.views } : p
        ));
      }
    } catch (err) {
      console.error('incrementView error:', err);
      viewedPostsRef.current.delete(postId); // allow retry on next scroll-into-view
    }
  };

  const handleToggleLike = async (postId: string) => {
    const token = getToken();
    if (!token) { router.push('/auth/signin'); return; }
    const uid = getUserId(currentUser);

    // Optimistic
    setPosts((prev) => prev.map((p) => {
      if ((p._id ?? p.id) !== postId) return p;
      const liked = p.likes.includes(uid);
      return { ...p, likes: liked ? p.likes.filter((id) => id !== uid) : [...p.likes, uid] };
    }));

    try {
      const res = await fetch(`${getApiBase()}/api/posts/${postId}/like`, {
        method: 'PUT', headers: authHeaders(token),
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.map((p) =>
          (p._id ?? p.id) === postId ? { ...p, likes: data.likes } : p
        ));
      }
    } catch (err) { console.error('toggleLike error:', err); }
  };

  const handleAddComment = async (postId: string) => {
    const token = getToken();
    if (!token) { router.push('/auth/signin'); return; }
    if (!commentDraft.trim()) return;
    setCommentSubmitting(true);
    try {
      const res = await fetch(`${getApiBase()}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ text: commentDraft.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.map((p) =>
          (p._id ?? p.id) === postId ? { ...p, comments: data.comments } : p
        ));
        setCommentDraft('');
      }
    } catch (err) { console.error('addComment error:', err); }
    finally { setCommentSubmitting(false); }
  };

  const handleReplyAdded = (postId: string, commentId: string, replies: Reply[]) => {
    setPosts((prev) => prev.map((p) => {
      if ((p._id ?? p.id) !== postId) return p;
      return {
        ...p,
        comments: p.comments.map((c) =>
          c._id === commentId ? { ...c, replies } : c
        ),
      };
    }));
  };

  const handleJoinHangout = () => {
    const updated = joinedHangouts.includes(HANGOUT_ID) ? joinedHangouts : [...joinedHangouts, HANGOUT_ID];
    setJoinedHangouts(updated);
    window.localStorage.setItem(HANGOUT_STORAGE_KEY, JSON.stringify(updated));
    router.push('/hangout');
  };

  const handleSignIn = () => router.push('/auth/signin');
  const handleCreateTopic = () => router.push('/topic');

  const handleLogout = async () => {
    const token = getToken();
    try {
      if (token) {
        await fetch(`${getApiBase()}/api/auth/logout`, {
          method: 'POST',
          headers: authHeaders(token),
        });
      }
    } catch (err) {
      console.error('logout error:', err);
    } finally {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('authToken');
        window.localStorage.removeItem('token');
        window.sessionStorage.removeItem('authToken');
      }
      setCurrentUser(null);
      setMobileOpen(false);
      dismissProfileReminder();
      router.push('/');
    }
  };

  const dismissProfileReminder = () => {
    setShowProfileReminder(false);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(PROFILE_REMINDER_DISMISS_KEY, '1');
    }
  };

  const goUpdateProfile = () => {
    dismissProfileReminder();
    router.push('/auth/updateaccount');
  };

  const currentSection = pathname === '/hangout' ? 'hangout' : 'home';
  const navItems = [
    { label: 'Home', href: '/', icon: <HouseIcon />, active: currentSection === 'home' },
    { label: 'Hangout', href: '/hangout', icon: <CalendarIcon />, active: currentSection === 'hangout' },
    { label: 'Discussion', href: '#discussion', icon: <MessageIcon />, active: false },
    { label: 'Hub', href: '#hub', icon: <SparkIcon />, active: false },
  ];

  const visiblePosts = selectedCountry === 'all'
    ? posts
    : posts.filter((p) => {
        const c = p.country ?? getCountryName(p.user?.country);
        return c === selectedCountry;
      });

  const activePost = activePostId
    ? posts.find((p) => (p._id ?? p.id) === activePostId) ?? null
    : null;

  const needsStackSetup = !!currentUser &&
    (getUserLanguages(currentUser).length === 0 || getUserFrameworks(currentUser).length === 0);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const postId = entry.target.getAttribute('data-post-id');
            if (postId) registerView(postId);
          }
        });
      },
      { threshold: 0.5 }
    );

    const cards = document.querySelectorAll('[data-post-id]');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [visiblePosts]);

  return (
    <Box className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Box className="flex min-h-screen flex-col md:h-screen md:flex-row md:overflow-hidden">
        <Box className="hidden md:block md:w-64 md:shrink-0" />

        <Box className="flex-1 px-3 pb-8 md:ml-2 md:h-screen md:overflow-hidden md:p-6">

          {/* Sticky header */}
          <div className="sticky top-0 z-40 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800 md:relative md:border-b-0 md:bg-transparent">
            <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 py-3 md:hidden">
              <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation" className="rounded-md p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                <MenuIcon className="h-5 w-5" />
              </button>
              <Box className="flex-row ml-auto items-center">
                <Text className="text-lg font-semibold dark:text-slate-100">DevConnect</Text>
                <img src="/icon/logo.png" className="h-10 w-10 rounded-[0.8em] ml-2" alt="logo" />
              </Box>
              <div className="w-9" />
            </div>

            <Box className="px-4 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md md:rounded-2xl md:bg-white md:dark:bg-slate-900 md:border md:border-slate-200/70 dark:border-slate-800 md:px-6 md:py-3.5 md:mb-3">
              <Box className="flex-row items-center gap-3">
                <Box className="flex-row items-center gap-2">
                  <Icon as={GlobeIcon} className="h-4 w-4 text-emerald-600" />
                  <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Filter posts</Text>
                </Box>
                <Select selectedValue={selectedCountry} onValueChange={(v: any) => setSelectedCountry(v)}>
                  <SelectTrigger variant="outline" size="sm" className="w-44 rounded-full border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 px-4 py-1.5">
                    <SelectInput placeholder="All Countries" value={selectedCountry === 'all' ? 'All Countries' : selectedCountry} className="text-sm font-medium text-slate-700 dark:text-slate-200" />
                    <SelectIcon className="mr-3" as={ChevronDownIcon} />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent className="max-h-[70vh] scrollbar-hide rounded-t-2xl bg-white px-2 pb-6 md:max-h-96 md:rounded-2xl md:border md:p-2 md:shadow-xl dark:bg-slate-900 dark:border-slate-800">
                      <SelectDragIndicatorWrapper className="py-3">
                        <SelectDragIndicator className="bg-slate-200 dark:bg-slate-700" />
                      </SelectDragIndicatorWrapper>
                      <SelectItem label="All Countries" value="all" className="mx-1 mb-1 rounded-lg border-b border-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200" />
                      {countryOptions.map((c) => (
                        <SelectItem key={c} label={c} value={c} className="mx-1 rounded-lg px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300" />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
                <button type="button" onClick={toggleTheme} aria-label="Toggle dark mode" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                  <Icon as={theme === 'dark' ? SunIcon : MoonIcon} className="h-4 w-4" />
                </button>
              </Box>
            </Box>
          </div>

          {/* Welcome banner — guests only */}
          {!currentUser && (
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
          )}

          {/* Complete-your-profile banner — signed-in users missing languages/frameworks */}
          {currentUser && needsStackSetup && (
            <div className="stack-setup-card relative mt-3 mb-3 overflow-hidden rounded-2xl border border-emerald-100 p-3 shadow-sm shadow-emerald-100/70 md:mb-4 md:rounded-3xl md:p-6 bg-gradient-to-r from-emerald-50/60 to-amber-50/50 dark:from-slate-800/80 dark:to-slate-900/90">
              <div className="relative flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-3">
                <div className="flex flex-col gap-1">
                  <Text className="text-[15px] tracking-[0.20em] md:text-xl md:tracking-[0.24em] font-bold uppercase text-emerald-600">
                    Complete Your Profile
                  </Text>
                  <Text className="text-[13px] text-slate-900 dark:text-slate-100 md:text-sm">
                    Add the languages and frameworks you work with so we can match you with the right people, hangouts, and discussions.
                  </Text>
                </div>

                <div className="flex w-auto flex-col items-center justify-center gap-2 md:gap-3">
                  <div className="stack-setup-badge flex items-center gap-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 px-2.5 py-1.5 shadow-sm md:gap-2 md:px-3 md:py-2">
                    <span className="stack-setup-dot h-2 w-2 rounded-full bg-emerald-500 md:h-2.5 md:w-2.5" />
                    <Text className="text-sm font-medium text-slate-700 dark:text-slate-200 md:text-xs">
                      It only takes a minute — unlock full access to DevConnect!
                    </Text>
                  </div>

                  <Pressable onPress={() => router.push('/auth/updateaccount')} className="mt-1 w-40 items-center rounded-full bg-emerald-600 px-3 py-1.5 shadow-sm transition duration-200 hover:bg-emerald-700 md:mt-0 md:w-48 md:px-4 md:py-2">
                    <Text className="text-xs font-semibold text-white md:text-sm">Update Profile</Text>
                  </Pressable>
                </div>
              </div>
            </div>
          )}

          {/* Feed + sidebar */}
          <Box className="flex flex-col gap-4 md:min-h-0 md:flex-1 md:flex-row md:gap-6">

            {/* Feed */}
            <div
              ref={feedRef}
              className="order-2 w-full md:order-1 md:h-full md:w-[63%] md:min-h-0 md:overflow-y-auto md:pr-2 md:pb-6 scrollbar-hide"
              style={{ WebkitOverflowScrolling: 'touch' as any }}
            >
              <div style={{ transform: `translateY(${pullDistance}px)`, transition: isRefreshing ? 'transform 200ms' : undefined }}>
                <div className="flex items-center justify-center h-8">
                  {pullDistance > 0 && !isRefreshing && (
                    <Text className="text-xs text-slate-400">{pullDistance > PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}</Text>
                  )}
                  {isRefreshing && <Text className="text-xs text-slate-400">Refreshing...</Text>}
                </div>

                <VStack className="w-full gap-4">
                  {postsLoading && (
                    <Card className="w-full rounded-2xl bg-white border border-slate-100 p-6 dark:bg-slate-900 dark:border-slate-800">
                      <Text className="text-slate-400 text-sm text-center">Loading posts...</Text>
                    </Card>
                  )}

                  {!postsLoading && visiblePosts.length === 0 && (
                    <Card className="w-full rounded-2xl dark:bg-slate-900 dark:border-slate-800 p-6 border border-slate-100">
                      <Text className="text-slate-500 dark:text-slate-400">No posts yet.</Text>
                    </Card>
                  )}

                  {!postsLoading && visiblePosts.map((post) => {
                    const postId = post._id ?? post.id ?? '';
                    const isLiked = uid ? post.likes.some((l) => l === uid || (l as any)?._id === uid) : false;
                    const authorName = post.user?.username ?? 'Unknown';
                    const authorAvatar = post.user?.profilePic ?? FALLBACK_AVATAR;
                    const authorCountry = getCountryName(post.user?.country);
                    const postTags: string[] = post.tags ?? [];

                    return (
                      <Card
                        key={postId}
                        data-post-id={postId}
                        className="w-full shadow shadow-slate-200 rounded-2xl bg-white border border-slate-100 p-5 dark:shadow-slate-950/40 dark:bg-slate-900 dark:border-slate-800"
                      >
                        {/* Header */}
                        <Box className="flex-row items-center justify-between">
                          <Box className="flex-row items-center gap-3">
                            <Avatar>
                              <AvatarImage source={{ uri: authorAvatar }} />
                            </Avatar>
                            <Box>
                              <Text className="font-semibold">{authorName}</Text>
                              <Text className="text-sm text-gray-500 dark:text-slate-400">
                                {timeAgo(post.createdAt)} · {authorCountry}
                              </Text>
                            </Box>
                          </Box>
                          <Popover
                            isOpen={openPopover === postId}
                            onClose={() => setOpenPopover(null)}
                            onOpen={() => setOpenPopover(postId)}
                            placement="bottom"
                            trigger={(triggerProps) => (
                              <Button className="bg-slate-100 dark:bg-slate-800 rounded-full p-2" {...triggerProps}>
                                <ButtonText><Icon as={ThreeDotsIcon} className="h-5 w-5 text-black dark:text-slate-100" /></ButtonText>
                              </Button>
                            )}
                          >
                            <PopoverBackdrop />
                            <PopoverContent>
                              <PopoverArrow />
                              <PopoverBody><Text className="text-foreground">Skip this post</Text></PopoverBody>
                            </PopoverContent>
                          </Popover>
                        </Box>

                        {/* Body */}
                        {post.title ? (
                          <Text className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1">{post.title}</Text>
                        ) : null}
                        <Text className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-2">{post.content}</Text>

                        {post.codeSnippet ? (
                          <pre className="mt-3 rounded-xl bg-slate-950 text-emerald-300 p-4 text-xs overflow-x-auto">
                            <code>{post.codeSnippet}</code>
                          </pre>
                        ) : null}

                        {post.imageUrl ? (
                          <img src={post.imageUrl} alt="post" className="mt-3 rounded-xl w-full object-cover max-h-64" />
                        ) : null}

                        {/* Tags */}
                        {postTags.length > 0 && (
                          <Box className="mt-3 flex-row flex-wrap gap-2">
                            {postTags.map((tag) => (
                              <Card key={tag} className="bg-emerald-50 items-center justify-center rounded-full px-3 py-1 border border-emerald-100 shadow-none dark:bg-emerald-900/20 dark:border-emerald-800">
                                <Text className="text-emerald-700 dark:text-emerald-300 text-xs font-medium">{tag}</Text>
                              </Card>
                            ))}
                          </Box>
                        )}

                        {/* Actions */}
                        <Box className="mt-3 flex-row items-center gap-5 border-t border-slate-100 dark:border-slate-800 pt-3">
                          {/* Like */}
                          <button
                            type="button"
                            onClick={() => handleToggleLike(postId)}
                            className={`flex items-center gap-1.5 text-xs font-medium transition ${isLiked ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'}`}
                          >
                            <HeartIcon filled={isLiked} className="h-4 w-4" />
                            <span>{post.likes.length}</span>
                          </button>

                          {/* Comments icon */}
                          <button
                            type="button"
                            onClick={() => { setActivePostId(postId); setCommentDraft(''); }}
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-emerald-600 transition"
                          >
                            <Icon as={MessageCircleIcon} className="h-4 w-4" />
                            <span>{post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}</span>
                          </button>

                          {/* Views icon */}
                          <Box className="flex-row items-center gap-1.5 ml-auto">
                            <Icon as={EyeIcon} className="h-4 w-4 text-slate-400" />
                            <Text className="text-xs font-medium text-slate-400">{post.views ?? 0}</Text>
                          </Box>
                        </Box>
                      </Card>
                    );
                  })}
                </VStack>
              </div>
            </div>

            {/* Right sidebar */}
            <Box className="order-1 w-full flex flex-col gap-4 md:order-2 md:h-full md:w-[35%] md:overflow-y-auto scrollbar-hide">
              <Card className="w-full rounded-2xl bg-white border border-slate-100 p-4 dark:bg-slate-900 dark:border-slate-800 shadow shadow-slate-200 dark:shadow-slate-950/40">
                <Box className="flex-row items-center justify-between md:block">
                  <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100 md:text-center md:text-base">Upcoming Live Hangout</Text>
                  <Text className="text-xs font-bold text-emerald-700 md:hidden">05:56:43</Text>
                </Box>
                <Box className="flex-row items-center gap-3 mt-3 md:justify-center">
                  <Avatar className="h-10 w-10 md:h-12 md:w-12 border border-slate-700">
                    <AvatarImage source={{ uri: FALLBACK_AVATAR }}/>
                  </Avatar>
                  <Box className="min-w-0 flex-1 gap-0.5 md:flex-none md:text-center">
                    <Text className="text-[10px] text-slate-400 dark:text-slate-300 md:text-xs">Topic</Text>
                    <Text className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100 md:text-sm">Tech Market Pricing in Nigeria</Text>
                  </Box>
                  <Button onPress={handleJoinHangout} className={`h-7 shrink-0 rounded-full px-3 py-0 md:hidden ${joinedHangouts.includes(HANGOUT_ID) ? 'bg-slate-500' : 'bg-emerald-600'}`}>
                    <ButtonText className="text-[11px] font-semibold text-white">{joinedHangouts.includes(HANGOUT_ID) ? 'Joined' : 'Join'}</ButtonText>
                  </Button>
                </Box>
                <Box className="hidden items-center gap-2 mt-4 md:flex md:flex-col">
                  <Text className="text-xs text-slate-400 dark:text-slate-300">Starts In</Text>
                  <Text className="text-lg font-bold text-slate-900 dark:text-slate-100">05 : 56 : 43</Text>
                  <Button onPress={handleJoinHangout} className={`mt-1 w-full py-2 rounded-xl ${joinedHangouts.includes(HANGOUT_ID) ? 'bg-slate-500' : 'bg-emerald-600'}`}>
                    <Text className="text-xs font-semibold text-white">{joinedHangouts.includes(HANGOUT_ID) ? 'Joined' : 'Join Hangout'}</Text>
                  </Button>
                </Box>
              </Card>
              <SiteFooter className="hidden md:block" />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Nav drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 -translate-x-full transform bg-slate-900 text-white shadow-2xl transition-transform duration-300 ease-out md:w-64 md:translate-x-0 md:shadow-none ${mobileOpen ? 'translate-x-0' : ''}`}
        onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <Box className="flex h-full w-full flex-col p-6 overflow-y-auto scrollbar-hide">
          <Box className="mb-6 flex-row items-center justify-between">
            <Text className="text-emerald-400 text-xl font-bold">DevConnect</Text>
            <img src="/icon/logo.png" className="h-10 w-10 rounded-[0.8em]" alt="logo" />
            <button type="button" className="rounded-md p-2 text-slate-300 hover:bg-slate-800 md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
              <CloseIcon className="h-4 w-4" />
            </button>
          </Box>
          <Box className="gap-1.5 mb-6">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition duration-200 ${item.active ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-transparent text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <span className={item.active ? 'text-emerald-300' : 'text-emerald-400'}>{item.icon}</span>
                <span className={item.active ? 'font-semibold' : 'font-medium'}>{item.label}</span>
              </a>
            ))}
          </Box>
          <Box className="mb-6 rounded-xl border border-slate-800 bg-slate-800/60 p-4">
            <Box className="flex flex-row items-center gap-3 py-2">
              <Avatar className="h-10 w-10 border border-slate-700">
                <AvatarImage source={{ uri: currentUser?.profilePic ?? FALLBACK_AVATAR }} />
              </Avatar>
              <Box className="min-w-0 flex-1">
                <Text className="text-slate-100 text-sm font-semibold truncate">{currentUser?.username ?? 'Guest'}</Text>
              </Box>
            </Box>
            {currentUser ? (
              <>
                <Pressable onPress={handleCreateTopic} className="mt-3 flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5">
                  <Text className="text-sm font-semibold text-white">Create Topic</Text>
                </Pressable>
                <Pressable onPress={() => setShowLogoutConfirm(true)} className="mt-2 flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 dark:border-red-900/40 dark:bg-red-950/20">
                  <Text className="text-sm font-semibold text-red-600 dark:text-red-400">Log out</Text>
                </Pressable>
              </>
            ) : (
              <Pressable onPress={handleSignIn} className="mt-3 flex items-center justify-center rounded-xl bg-amber-600 px-4 py-2.5">
                <Text className="text-sm font-semibold text-white">Sign In</Text>
              </Pressable>
            )}
          </Box>
          <Box className="mt-auto pt-4 border-t border-slate-800 md:hidden">
            <SiteFooter className="border-0 bg-transparent p-0" />
          </Box>
        </Box>
      </div>

      {/* Scroll to top */}
      {showScrollTop ? (
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-slate-100 shadow-lg transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950">
          <Icon as={ArrowUpIcon} className="h-5 w-5" />
        </button>
      ) : null}

      {/* Profile-incomplete reminder popup */}
      {showProfileReminder ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
            onClick={dismissProfileReminder}
          />
          <div
            className="relative z-10 w-full max-w-sm rounded-3xl border border-emerald-100 bg-white p-6 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-[popIn_250ms_ease-out]"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white animate-pulse">
                <SparkIcon className="h-4 w-4" />
              </span>
            </div>
            <Text className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Finish setting up your stack
            </Text>
            <Text className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              You haven't added your languages and frameworks yet. Add them now to unlock full access — matching, hangouts, and more.
            </Text>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={dismissProfileReminder}
                className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Later
              </button>
              <button
                type="button"
                onClick={goUpdateProfile}
                className="flex-1 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Logout confirmation popup */}
      {showLogoutConfirm ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-[popIn_250ms_ease-out]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white">
                <CloseIcon className="h-4 w-4" />
              </span>
            </div>
            <Text className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Log out of DevConnect?
            </Text>
            <Text className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              You'll need to sign in again to like posts, comment, and join hangouts.
            </Text>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { setShowLogoutConfirm(false); handleLogout(); }}
                className="flex-1 rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Comments & Replies Modal */}
      {activePost ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActivePostId(null)} />
          <div className="relative z-10 w-full max-w-lg flex flex-col rounded-t-2xl bg-white dark:bg-slate-900 shadow-2xl md:rounded-2xl" style={{ maxHeight: '85vh' }}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <Text className="font-semibold text-slate-900 dark:text-slate-100">
                  What People Are Saying
                </Text>
                
              </div>
              <button type="button" onClick={() => setActivePostId(null)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Like summary */}
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => handleToggleLike(activePost._id ?? activePost.id ?? '')}
                className={`flex items-center gap-1.5 text-sm font-medium transition ${uid && activePost.likes.some((l) => l === uid || (l as any)?._id === uid) ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'}`}
              >
                <HeartIcon filled={uid ? activePost.likes.some((l) => l === uid || (l as any)?._id === uid) : false} className="h-4 w-4" />
                {activePost.likes.length} {activePost.likes.length === 1 ? 'like' : 'likes'}
              </button>
            </div>

            {/* list of comments */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
              {activePost.comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Icon as={MessageCircleIcon} className="h-8 w-8 text-slate-300" />
                  <Text className="text-sm text-slate-400">Be the first on this post!</Text>
                </div>
              ) : (
                activePost.comments.map((comment) => (
                  <CommentThread
                    key={comment._id}
                    comment={comment}
                    postId={activePost._id ?? activePost.id ?? ''}
                    currentUser={currentUser}
                    onReplyAdded={handleReplyAdded}
                  />
                ))
              )}
            </div>

            {/* Add your comment */}
            <div className="shrink-0 px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage source={{ uri: currentUser.profilePic ?? FALLBACK_AVATAR }} />
                  </Avatar>
                  <input
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(activePost._id ?? activePost.id ?? ''); }}
                    placeholder="Write a comment..."
                    className="flex-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddComment(activePost._id ?? activePost.id ?? '')}
                    disabled={commentSubmitting || !commentDraft.trim()}
                    className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 transition hover:bg-emerald-500 shrink-0"
                  >
                    {commentSubmitting ? '...' : 'Post'}
                  </button>
                </div>
              ) : (
                <button type="button" onClick={handleSignIn} className="w-full rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">
                  Sign in to comment
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Mobile drawer overlay */}
      {mobileOpen ? (
        <button type="button" className="fixed inset-0 z-40 bg-slate-950/50 md:hidden backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" />
      ) : null}
    </Box>
  );
}