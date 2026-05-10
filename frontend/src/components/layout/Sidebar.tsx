"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { 
  LayoutDashboard, 
  Map, 
  Building2, 
  Layers, 
  Users, 
  GraduationCap, 
  BookOpen,
  ClipboardList,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUiStore();

  const adminLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Zones', href: '/zones', icon: Map },
    { name: 'Schools', href: '/schools', icon: Building2 },
    { name: 'Levels', href: '/levels', icon: Layers },
    { name: 'Classes', href: '/classes', icon: Users },
    { name: 'Subjects', href: '/subjects', icon: BookOpen },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const headTeacherLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', href: '/students', icon: GraduationCap },
    { name: 'Classes', href: '/classes', icon: Users },
    { name: 'Results', href: '/results', icon: ClipboardList },
    { name: 'Reports', href: '/reports', icon: FileText },
  ];

  const teacherLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Classes', href: '/classes', icon: Users },
    { name: 'Enter Marks', href: '/marks', icon: ClipboardList },
    { name: 'Reports', href: '/reports', icon: FileText },
  ];

  const links = user?.role === 'ADMIN' ? adminLinks 
              : user?.role === 'HEAD_TEACHER' ? headTeacherLinks 
              : teacherLinks;

  return (
    <motion.div 
      initial={{ width: 280 }}
      animate={{ width: sidebarOpen ? 280 : 80 }}
      className="h-screen bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] flex flex-col relative z-20 shadow-xl"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-10 z-30 bg-background border border-border rounded-full shadow-md hover:bg-muted"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform text-foreground", !sidebarOpen && "rotate-180")} />
      </Button>

      <div className="p-6 flex items-center gap-3 border-b border-[hsl(var(--sidebar-border))] h-20">
        <div className="bg-primary/20 p-2 rounded-xl">
          <GraduationCap className="h-6 w-6 text-primary" />
        </div>
        {sidebarOpen && (
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold tracking-tight text-white"
          >
            Mayeso
          </motion.h1>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link key={link.name} href={link.href}>
              <div
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-white/10 text-white shadow-lg" 
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <link.icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                {sidebarOpen && <span className="font-medium">{link.name}</span>}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-6 border-t border-[hsl(var(--sidebar-border))] bg-black/10">
        {sidebarOpen && (
          <div className="flex flex-col mb-6 bg-white/5 p-3 rounded-xl">
            <span className="text-sm font-semibold text-white">{user?.fullName || 'Guest User'}</span>
            <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{user?.role?.replace('_', ' ') || 'UNAUTHENTICATED'}</span>
            {user?.schoolName && <span className="text-xs text-primary/80 truncate">{user.schoolName}</span>}
          </div>
        )}
        <Button 
          variant="ghost" 
          className={cn(
            "w-full text-white/60 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all", 
            sidebarOpen ? "justify-start px-4" : "justify-center px-0"
          )}
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {sidebarOpen && <span className="ml-3 font-medium">Log out</span>}
        </Button>
      </div>
    </motion.div>
  );
}
