'use client';

import { useState, type MouseEvent } from 'react';
import Image from 'next/image';
import NaijaStates from 'naija-state-local-government';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import {
  CalendarDaysIcon,
  CloseIcon,
  EyeIcon,
  GlobeIcon,
  Icon,
  MenuIcon,
  MessageCircleIcon,
  SunIcon,
  ThreeDotsIcon,
  ChevronDownIcon,
} from '@/components/ui/icon';
import {
  Avatar,
  AvatarFallbackText,
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

// Dummy data for navigation items
const navItems = [
  { label: 'Home', href: '#home', icon: <GlobeIcon className="h-5 w-5" /> },
  { label: 'Hangout', href: '#hangout', icon: <CalendarDaysIcon className="h-5 w-5" /> },
  { label: 'Discussion', href: '#discussion', icon: <MessageCircleIcon className="h-5 w-5" /> },
  { label: 'Hub', href: '#hub', icon: <SunIcon className="h-5 w-5" /> },
];

// Nigerian states used for the filter
const nigerianStates = NaijaStates.states();

//dummy data for feed posts and tags
const feedPosts = [
  {
    name: 'Sighter',
    state: 'Lagos',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    likes: 24,
    comments: 6,
    views: 312,
  },
  {
    name: 'Marry technologies',
    state: 'Rivers',
    avatar: 'https://th.bing.com/th/id/OIP.xjq0g6I85ja3eBJRD0kdKAHaHa?w=202&h=202&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    likes: 11,
    comments: 2,
    views: 148,
  },
  {
    name: 'SoulTech',
    state: 'Oyo',
    avatar: 'https://th.bing.com/th/id/OIP.fNM5cKvrKHTcZ_0dilaaXgHaNN?w=187&h=333&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    likes: 8,
    comments: 1,
    views: 96,
  },
  {
    name: 'Favour Emmanuel',
    state: 'FCT - Abuja',
    avatar: 'https://th.bing.com/th/id/OIP.fNM5cKvrKHTcZ_0dilaaXgHaNN?w=187&h=333&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
    likes: 3,
    comments: 0,
    views: 40,
  },
];

const tags = ["#today'stopic", '#Devwahala', '#dev', '#NgPower'];

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedState, setSelectedState] = useState('all');
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const visiblePosts =
    selectedState === 'all'
      ? feedPosts
      : feedPosts.filter((post) => post.state === selectedState);

  return (
    <Box className="min-h-screen bg-slate-50 text-slate-900">
      <Box className="flex min-h-screen flex-col md:flex-row">
        {/* Desktop sidebar spacer — reserves horizontal space in the flex row on desktop. */}
        <Box className="hidden md:block md:w-64 md:shrink-0" />

        {/* Main content */}
        <Box className="flex-1 px-3 pb-3 md:ml-2 md:p-6">
          {/* ── Sticky top group: mobile logo bar + filter bar ────────────── */}
          <div className="sticky top-0 z-40">
            {/* Mobile-only top bar with logo + menu button */}
            <div className="flex items-center justify-between border-b border-slate-200/70 bg-white/95 px-4 py-3 backdrop-blur-md md:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
                className="rounded-md p-2 text-slate-700 hover:bg-slate-100"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
              <Box className=" flex-row ml-auto items-center">
                <Text className="text-primary text-lg font-semibold">DevConnect</Text>
                <Icon as={SunIcon} className="h-7 w-7 ml-3 text-amber-500" />
              </Box>
              {/* Spacer matching the button's width so the logo stays visually centered */}
              <div className="w-9" />
            </div>

            <Box className="-mx-4 border-b border-slate-200/70 bg-white/90 px-4 py-3 backdrop-blur-md md:-mx-10 md:px-10 md:py-4">
              <Box className="flex-row items-center gap-3">
                <Box className="flex-row items-center gap-2">
                  <Icon as={GlobeIcon} className="h-4 w-4 text-emerald-600" />
                  <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                    className="w-44 rounded-full border-slate-200 bg-white px-4 py-1.5 data-[focus=true]:border-emerald-400 data-[focus=true]:ring-2 data-[focus=true]:ring-emerald-100"
                  >
                    <SelectInput
                      placeholder="All States"
                      value={selectedState === 'all' ? 'All States' : selectedState}
                      className="text-sm font-medium text-slate-700"
                    />
                    <SelectIcon className="mr-3" as={ChevronDownIcon} />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent className="max-h-[70vh] scrollbar-hide rounded-t-2xl border-t border-slate-100 px-2 pb-6 md:max-h-96 md:rounded-2xl md:border md:p-2 md:shadow-xl md:shadow-slate-950/10">
                      <SelectDragIndicatorWrapper className="py-3">
                        <SelectDragIndicator className="bg-slate-200" />
                      </SelectDragIndicatorWrapper>

                      <SelectItem
                        label="All States"
                        value="all"
                        className="mx-1 mb-1 rounded-lg border-b border-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 data-[highlighted=true]:bg-emerald-50 data-[highlighted=true]:text-emerald-700"
                      />

                      {nigerianStates.map((state) => (
                        <SelectItem
                          key={state}
                          label={state}
                          value={state}
                          className="mx-1 rounded-lg px-3 py-2.5 text-sm text-slate-600 data-[highlighted=true]:bg-emerald-50 data-[highlighted=true]:text-emerald-700"
                        />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </Box>
            </Box>
          </div>

          {/* ── Welcome card ──────────────────────────
              Smaller padding/rounding/text on mobile via base classes;
              md: classes restore the original desktop sizing exactly,
              so desktop is unchanged.
          */}
          <div className="welcome-card relative mt-3 mb-3 overflow-hidden rounded-2xl border border-amber-100 p-3 shadow-sm shadow-amber-100/70 md:mb-2 md:rounded-3xl md:p-6">

            <div className="relative flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-3">
              <div className="flex flex-col gap-1">
                <Text className="text-[15px] tracking-[0.20em] md:text-xl md:tracking-[0.24em] font-bold uppercase text-amber-600">
                  Welcome to DevConnect
                </Text>
                <Text className="text-[13px] text-slate-900 md:text-sl">
                  Here developers connect, share knowledge, fix problems, and collaborate on projects. Explore discussions, join communities, and stay updated with the latest in the tech world.
                </Text>
              </div>

              <div className="flex flex-col items-center justify-center gap-2 md:gap-3">
                <div className="welcome-badge flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1.5 shadow-sm md:gap-2 md:px-3 md:py-2">
                  <span className="welcome-dot h-2 w-2 rounded-full bg-amber-500 md:h-2.5 md:w-2.5" />
                  <Text className="text-xs font-medium text-slate-700 md:text-sm">
                    Fresh conversations are live
                  </Text>
                </div>

                <Pressable className="mt-1 w-32 items-center rounded-full bg-amber-600 px-3 py-1.5 shadow-sm transition duration-200 hover:bg-amber-700 md:mt-0 md:w-40 md:px-4 md:py-2">
                  <Text className="text-xs font-semibold text-white md:text-sm">Sign In</Text>
                </Pressable>
              </div>
            </div>
          </div>

          <Box className="flex flex-col gap-4 md:flex-row md:gap-6">
            {/* Posts column — order-2 on mobile so the sidebar (Upcoming
                Hangout) shows first without scrolling; order-1 on desktop
                restores the original left-column position. */}
            <VStack className="order-2 w-full gap-4 md:order-1 md:w-[60%]">
              {/* Feed posts */}
              {visiblePosts.map((post) => (
                <Card
                  key={post.name}
                  className="w-full rounded-2xl bg-slate-100 p-6 shadow-md shadow-slate-950/20"
                >
                  <Box className=" flex-row items-center justify-between">
                    <Box className="flex-row items-center gap-3">
                      <Avatar>
                        <AvatarImage source={{ uri: post.avatar }} />
                      </Avatar>
                      <Box>
                        <Text className="font-semibold">{post.name}</Text>
                        <Text className="text-sm text-gray">3 hr ago · {post.state}</Text>
                      </Box>
                    </Box>
                    <Popover
                      isOpen={isOpen}
                      onClose={handleClose}
                      onOpen={handleOpen}
                      placement="bottom"
                      trigger={(triggerProps) => {
                        return (
                          <Button className='bg-slate-950/10' {...triggerProps}>
                            <ButtonText>
                              <Icon as={ThreeDotsIcon} className="h-5 w-5 text-black" />
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

                  <Text className="text-xl md:text-3xl font-bold text-slate-900">
                    Internet Service Providers and Local Devs
                  </Text>
                  <Text className="text-xs text-slate-600 md:text-sm">
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
                        className="bg-primary items-center justify-center rounded-full px-4 py-1.5 shadow-none"
                      >
                        <Text className="text-primary-foreground text-xs font-medium">{tag}</Text>
                      </Card>
                    ))}
                  </Box>

                  <Box className="mt-3 flex-row items-center justify-end gap-5 border-t border-slate-200/70 pt-3">

                    <Box className="flex-row items-center gap-1.5">
                      <Icon as={EyeIcon} className="h-4 w-4 text-slate-400" />
                      <Text className="text-xs font-medium text-slate-500">{post.views}</Text>
                    </Box>
                  </Box>
                </Card>
              ))}

              {visiblePosts.length === 0 && (
                <Card className="w-full rounded-2xl bg-slate-100 p-6 shadow-md shadow-slate-950/20">
                  <Text className="text-slate-500">No posts found for {selectedState}.</Text>
                </Card>
              )}
            </VStack>

            {/* Sidebar — order-1 on mobile so it appears right after the
                welcome card, before the posts feed. order-2 on desktop
                restores the original right-column position. Percentage
                heights (h-[20%]/h-[5%]) removed — those had no defined
                parent height to resolve against, which is what caused the
                cards to collapse and overlap whenever the posts column
                was short (e.g. "no posts found" for a filtered state).
                Auto height driven by padding + content is used instead,
                so this can never break regardless of how many posts show.
            */}
            <Box className="order-1 w-full md:order-2 md:w-[35%]">
              <Card className="w-full rounded-2xl bg-slate-100 p-4 shadow-md shadow-slate-950/20 md:p-6">
                <Text className="text-center text-lg font-semibold text-slate-900 md:text-2xl">
                  Upcoming Live Hangout
                </Text>
                <Box className="flex-row items-center gap-3 justify-center mt-2 md:mt-3">
                  <Avatar className="h-14 w-14 md:h-20 md:w-20">
                    <AvatarImage
                      source={{
                        uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
                      }}
                    />
                  </Avatar>
                  <Box className="gap-1 md:gap-3">
                    <Text className="text-xs text-gray md:text-base">
                      Topic
                    </Text>
                    <Text className="text-sm font-semibold md:text-xl">
                      Tech Market Pricing in Nigeria
                    </Text>
                  </Box>
                </Box>
                <Box className="gap-2 items-center justify-between mt-3 md:gap-3 md:mt-4">
                  <Text className="text-xs text-gray md:text-base">
                    Starts In
                  </Text>
                  <Text className="text-lg font-bold md:text-xl">
                    05: 56: 43
                  </Text>
                  <Button className="mt-2 w-[70%] py-2 md:mt-4 md:w-[60%] md:py-3">
                    <Text className="text-sm text-white md:text-xl">
                      Set Reminder
                    </Text>
                  </Button>
                </Box>
              </Card>

              <Box className="w-full rounded-2xl mt-3 p-4 shadow-md shadow-slate-950/10 md:mt-10 md:p-6">
                <Text className="text-sm md:text-base">
                  Join our new letter
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Mobile drawer and backdrop ────────────────────────── */}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 -translate-x-full transform bg-slate-900 text-white shadow-2xl shadow-slate-950/30 transition-transform duration-300 ease-out md:w-64 md:translate-x-0 md:shadow-none ${
          mobileOpen ? 'translate-x-0' : ''
        }`}
        onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
      >
        <Box className="flex h-full w-full flex-col p-8">
          <Box className="mb-10 flex-row w-1000 items-center justify-between">
            {/* Logo will be only be here on mobile view */}
            <Text className="text-primary text-xl font-semibold">DevConnect Logo</Text>
            <button
              type="button"
              className="rounded-md p-2 text-slate-300 hover:bg-slate-800 hover:text-white md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </Box>

          <Box className="gap-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition duration-200 hover:bg-slate-800 hover:text-white"
              >
                <span className="text-emerald-400">{item.icon}</span>
                <span className="">{item.label}</span>
              </a>
            ))}
          </Box>

          <Box className="mt-auto rounded-xl border border-slate-800 bg-slate-800/70 p-4">
            <a className="flex items-center gap-3 rounded-lg py-3 text-sm font-medium text-slate-300 transition duration-200 hover:bg-slate-800 hover:text-white">
              <Avatar>
                <AvatarImage
                  source={{
                    uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
                  }}
                />
              </Avatar>
              <Text className="text-primary-foreground text-sm">Sighter Tech</Text>
            </a>
            <a href='' className="mt-3 flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground transition duration-200 hover:bg-primary/90">
                <Text className=" text-sm font-bold ">CREATE A TOPIC</Text>
            </a>
          </Box>
        </Box>
      </div>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation overlay"
        />
      ) : null}
    </Box>
  );
}