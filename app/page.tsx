'use client';

import { useState, type MouseEvent } from 'react';
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
        <Box className="flex-1 p-2 md:ml-2 md:p-6">
          <div className="welcome-card mb-2 overflow-hidden rounded-3xl border border-amber-100 p-5 shadow-sm shadow-amber-100/70 md:mb-2 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className=" flex flex-col gap-1">
                <Text className="text-sl font-semibold uppercase tracking-[0.24em] text-amber-600">
                  Welcome to DevConnect
                </Text>
                <Text className="text-sm text-slate-900">
                Here developers connect, share knowledge, fix problems, and collaborate on projects.
              </Text>
              <Text className="text-sm text-slate-900">
                explore discussions, join communities, and stay updated with the latest in the tech world
              </Text>
              </div>
                
              <div className="flex flex-col justify-center gap-3 md:items-center">
                <div className="welcome-badge flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 shadow-sm">
                  <span className="welcome-dot h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <Text className="text-sm font-medium text-slate-700">
                    Fresh conversations are live
                  </Text>
                </div>

                <Pressable className="mt-3 w-40 items-center rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-amber-700 md:mt-0">
                  <Text className="text-sl font-semibold text-white">Sign In</Text>
                </Pressable>
              </div>
              
            </div>
          </div>

          <Box className="sticky top-0 z-30 -mx-4 border-b border-slate-200/70 bg-white/90 px-4 py-3 pl-16 backdrop-blur-md md:-mx-10 md:px-10 md:py-4 md:pl-10">
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

          <Box className="flex flex-col gap-4 md:flex-row md:gap-6">
            <VStack className="w-full md:w-[65%] gap-6">
              {/* Feed posts */}
              {visiblePosts.map((post) => (
                <Card
                  key={post.name}
                  className="w-full rounded-2xl bg-slate-100 p-6 shadow-md shadow-slate-950/20"
                >
                  <Box className="mb-3 flex-row items-center justify-between">
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

                  <Text className="text-3xl font-bold text-slate-900">
                    Internet Service Providers and Local Devs
                  </Text>
                  <Text className="mt-3 text-sm text-slate-600">
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

            <Box className="w-full md:w-[35%]">
              <Card className="h-[20%] w-full rounded-2xl bg-slate-100 p-6 shadow-md shadow-slate-950/20">
                <Text className="text-2xl text-center font-semibold text-slate-900">Upcoming Live Hangout</Text>
                <Box className='flex-row gap-3 justify-center'>
                  <Avatar className='h-20 w-20 md:p-6'>
                  <AvatarImage
                    source={{
                      uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
                    }}
                  />
                  </Avatar>
                  <Box className='gap-3 md:p-2'>
                    <Text className='text-gray'>
                      Topic
                    </Text>
                    <Text className='text-xl font-semibold'>
                      Tech Market Pricing in Nigeria
                    </Text>
                  </Box>
                </Box>
                <Box className='gap-3 items-center justify-between '>
                  <Text className='text-gray'>
                    Starts In
                  </Text>
                  <Text className='text-xl font-bold'>
                    05: 56: 43
                  </Text>
                  <Button className='mt-4 w-[60%] h-[35%]'>
                    <Text className='text-xl text-white'>
                      Set Reminder
                    </Text>
                  </Button>
                </Box>

              </Card>

              <Box className='h-[5%] w-full rounded-2xl mt-10 p-6 shadow-md shadow-slate-950/10'>
                <Text>
                  Join our new letter
                </Text>
              </Box>
            </Box>

            
          </Box>
        </Box>
      </Box>

      {/* ── Mobile drawer, toggle, and backdrop ──────────────────────────
          Rendered as siblings AFTER the main flex row above, at the same
          nesting level as the outermost Box. Since they come later in DOM
          order and aren't nested inside a lower-z Box, they naturally paint
          above the main content on mobile without fighting z-index across
          separate stacking contexts. 
      */}

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
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sl font-medium text-slate-300 transition duration-200 hover:bg-slate-800 hover:text-white"
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

      <button
        type="button"
        className="fixed left-4 top-4 z-[60] rounded-md border border-slate-200 bg-white p-2 text-slate-700 shadow-sm md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

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