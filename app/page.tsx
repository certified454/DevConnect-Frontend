'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
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

// Navigation items
const navItems = [
  { label: 'Home', href: '#home', icon: <GlobeIcon className="h-5 w-5" /> },
  { label: 'Hangout', href: '#hangout', icon: <CalendarDaysIcon className="h-5 w-5" /> },
  { label: 'Discussion', href: '#discussion', icon: <MessageCircleIcon className="h-5 w-5" /> },
  { label: 'Hub', href: '#hub', icon: <SunIcon className="h-5 w-5" /> },
];

const nigerianStates = NaijaStates.states();

const feedPosts = [
  {
    id: 'p1',
    name: 'Sighter tech ltd',
    state: 'Lagos',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    comments: 6,
    views: 312,
    replyCount: 2,
    replies: [
      { id: 'r1', name: 'techmania', text: 'Great point!' },
      { id: 'r2', name: 'sanuxtech', text: 'We should optimize for offline too.' },
    ],
  },
  {
    id: 'p2',
    name: 'Marry technologies',
    state: 'Rivers',
    avatar: 'https://th.bing.com/th/id/OIP.xjq0g6I85ja3eBJRD0kdKAHaHa?w=202&h=202&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    comments: 2,
    views: 148,
    replyCount: 0,
    replies: [],
  },
  {
    id: 'p3',
    name: 'SoulTech',
    state: 'Oyo',
    avatar: 'https://th.bing.com/th/id/OIP.fNM5cKvrKHTcZ_0dilaaXgHaNN?w=187&h=333&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    comments: 1,
    views: 96,
    replyCount: 1,
    replies: [{ id: 'r3', name: 'devChidi', text: 'Nice work' }],
  },
  {
    id: 'p4',
    name: 'Favour Emmanuel',
    state: 'FCT - Abuja',
    avatar: 'https://th.bing.com/th/id/OIP.fNM5cKvrKHTcZ_0dilaaXgHaNN?w=187&h=333&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    comments: 0,
    views: 40,
    replyCount: 0,
    replies: [],
  },
  {
    id: 'p5',
    name: 'Sanux tech',
    state: 'Lagos',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    comments: 6,
    views: 312,
    replyCount: 0,
    replies: [],
  },
];

const tags = ["#today'stopic", '#Devwahala', '#dev', '#NgPower'];

/**
 * Detailed SportyBet-style dark footer card component.
 */
function SiteFooter({ className = '' }: { className?: string }) {
  return (
    <Box className={`bg-slate-900 border border-slate-800 p-4 rounded-2xl text-slate-300 ${className}`}>
      {/* Brand Header */}
      <Box className="flex-row items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <Box className="flex-row items-center gap-2">
          <Text className="text-emerald-400 font-bold text-base">DevConnect</Text>
          <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-medium">
            NG
          </span>
        </Box>
        <Text className="text-[10px] text-slate-500">v1.0</Text>
      </Box>

      {/* Link Columns */}
      <Box className="grid grid-cols-3 gap-2 mb-4 text-left">

        <Box className="flex flex-col gap-1.5">
          <Text className="text-[11px] font-bold text-slate-100 uppercase tracking-wider">Company</Text>
          <a href="#about" className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors">About Us</a>
          <a href="#privacy" className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors">Privacy</a>
          <a href="#terms" className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors">Terms</a>
        </Box>

        <Box className="flex flex-col gap-1.5">
          <Text className="text-[11px] font-bold text-slate-100 uppercase tracking-wider">Community</Text>
          <a href="#rules" className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors">Guidelines</a>
          <a href="#topics" className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors">Topics</a>
          <a href="#help" className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors">Support</a>
          <a href="#faq" className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors">FAQs</a>
        </Box>

        <Box className="flex flex-col gap-1.5">
          <Text className="text-[11px] font-bold text-slate-100 uppercase tracking-wider">Connect</Text>
          <a href="#contact" className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors">Contact</a>
          <a href="#socials" className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors">Socials</a>
          <a href="#newsletter" className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors">Newsletter</a>
        </Box>
      </Box>

      {/* Footer Tagline & Copyright */}
      <Box className="border-t border-slate-800/80 pt-3 flex flex-col gap-1">
        <Text className="text-[10px] text-slate-400 leading-tight">
          Nigeria's premier tech hub for developers, creators, and innovators.
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
  const [selectedState, setSelectedState] = useState('all');
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [activeReplies, setActiveReplies] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const router = useRouter();

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
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

  const handleSignIn = () => {
    router.push('/auth/signin');
  }

  const handleOpen = (postId: string) => setOpenPopover(postId);
  const handleClose = () => setOpenPopover(null);
  const closeReplies = () => setActiveReplies(null);

  const visiblePosts =
    selectedState === 'all'
      ? feedPosts
      : feedPosts.filter((post) => post.state === selectedState);

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
                  <Icon as={GlobeIcon} className="h-4 w-4 text-emerald-600" />
                  <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                    Filter by state:
                  </Text>
                </Box>

                <Select
                  selectedValue={selectedState}
                  onValueChange={(value: any) => setSelectedState(value)}
                >
                  <SelectTrigger
                    variant="outline"
                    size="sm"
                    className="w-44 rounded-full border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 px-4 py-1.5 data-[focus=true]:border-emerald-400 data-[focus=true]:ring-2 data-[focus=true]:ring-emerald-100"
                  >
                    <SelectInput
                      placeholder="All States"
                      value={selectedState === 'all' ? 'All States' : selectedState}
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
                        label="All States"
                        value="all"
                        className="mx-1 mb-1 rounded-lg border-b border-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 data-[highlighted=true]:bg-emerald-50 data-[highlighted=true]:text-emerald-700"
                      />

                      {nigerianStates.map((state) => (
                        <SelectItem
                          key={state}
                          label={state}
                          value={state}
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
            {/* Infinite Feed Column */}
            <VStack className="order-2 w-full gap-4 md:order-1 md:h-full md:w-[63%] md:min-h-0 md:overflow-y-auto md:pr-2 md:pb-6 scrollbar-hide">
              {visiblePosts.map((post) => (
                <Card
                  key={post.id}
                  className="w-full shadow shadow-slate-200 rounded-2xl bg-white border border-slate-100 p-5 dark:shadow-slate-950/40 dark:bg-slate-900 dark:border-slate-800"
                >
                  <Box className="flex-row items-center justify-between">
                    <Box className="flex-row items-center gap-3">
                      <Avatar>
                        <AvatarImage source={{ uri: post.avatar }} />
                      </Avatar>
                      <Box>
                        <Text className="font-semibold">{post.name}</Text>
                        <Text className="text-sm text-gray-500 dark:text-slate-400">3 hr ago · {post.state}</Text>
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
                    Internet Service Providers and Local Devs
                  </Text>
                  <Text className="text-xs text-slate-600 dark:text-slate-400 md:text-sm leading-relaxed">
                    Nigerian developers are out here building world-class fintechs, SaaS platforms, and mobile
                    apps—while waging a daily war against latency, packet loss, and data costs. From switching
                    between 4G/5G mobile networks, fiber providers, and Starlink to optimizing apps for slow
                    connections, local devs are masters of resilience. Good ISP infrastructure isn&apos;t just
                    about fast downloads; it&apos;s the engine powering Nigeria&apos;s tech economy. Respect to
                    every dev shipping clean code through tough network conditions! 🚀
                  </Text>

                  <Box className="mt-4 flex-row flex-wrap gap-2">
                    {tags.map((tag) => (
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
                  <Text className="text-slate-500 dark:text-slate-400">No posts found for {selectedState}.</Text>
                </Card>
              )}
            </VStack>

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
                  <Button className="h-7 shrink-0 rounded-full px-3 py-0 bg-emerald-600 md:hidden">
                    <ButtonText className="text-[11px] font-semibold text-white">
                      Join
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
                  <Button className="mt-1 w-full bg-emerald-600 hover:bg-emerald-700 py-2 rounded-xl">
                    <Text className="text-xs font-semibold text-white">
                      Join Hangout
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
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition duration-200 hover:bg-slate-800 hover:text-white"
              >
                <span className="text-emerald-400">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </Box>

          {/* User Profile Card */}
          <Box className="mb-6 rounded-xl border border-slate-800 bg-slate-800/60 p-4">
            <a className="flex items-center gap-3 rounded-lg py-2 text-sm font-medium text-slate-300">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  source={{
                    uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
                  }}
                />
              </Avatar>
              <Text className="text-slate-100 text-sm font-semibold">Sighter Tech</Text>
            </a>
            <a href="#create" className="mt-3 flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-center text-xs font-bold text-white transition hover:bg-emerald-700">
              CREATE A TOPIC
            </a>
          </Box>

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
                  <Text className="font-semibold">Replies</Text>
                  <button type="button" onClick={closeReplies} className="text-sm text-slate-500">Close</button>
                </div>

                <div className="mt-3 max-h-64 overflow-y-auto">
                  {post.replies.length === 0 ? (
                    <Text className="text-sm text-slate-500">No replies yet.</Text>
                  ) : (
                    post.replies.map((r) => (
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