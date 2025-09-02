"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { BookOpen, Menu, Settings, User, LogOut, Globe, Bell } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { useChangeLocale, useI18n } from "@/locales/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { NotificationType } from "@/types";

type Checked = boolean;

function DashboardHeader() {
  const { toggleSidebar, isMobile } = useSidebar();
  const { data: session } = useSession();
  const changeLocale = useChangeLocale();
  const t = useI18n();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    // Only create WebSocket if user is authenticated
    if (session?.user?.id && session?.user?.accessToken) {
      const BACKEND_DOMAIN = process.env.NEXT_PUBLIC_BACKEND_DOMAIN || 'localhost:8000';
      const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      
      // Create WebSocket connection with better error handling
      const wsUrl = `${wsProtocol}://${BACKEND_DOMAIN}/ws/user-notifications/${session.user.id}/?token=${session.user.accessToken}`;
      console.log('Attempting to connect to:', wsUrl.replace(/token=([^&]*)/, 'token=REDACTED'));
      
      let socket: WebSocket;
      try {
        socket = new WebSocket(wsUrl);
        
        socket.onopen = () => {
          console.log('Connected to notifications WebSocket');
          // Request initial unread count, not the full list
          socket.send(JSON.stringify({ command: 'get_unread_count' }));
        };
        
        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'notification') {
              // Add new notification to list
              setNotifications(prev => {
                // Keep only the 5 most recent notifications
                const updated = [data, ...prev].slice(0, 5);
                return updated;
              });
              setUnreadCount(prev => prev + 1);
              
              // Show toast notification
              toast(data.title, {
                description: data.message,
                duration: 5000,
              });
            } else if (data.type === 'unread_count') {
              // Update unread count
              setUnreadCount(data.count);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        socket.onerror = (error) => {
          // More detailed error logging
          console.error('WebSocket error:', error);
          
          // Try to provide more context about the error
          if (error instanceof Event) {
            console.error('WebSocket connection error - check if the backend endpoint exists and is properly configured');
          }
          
          // Fallback to traditional notification fetching if WebSocket fails
          fallbackToTraditionalFetching();
        };
        
        socket.onclose = (event) => {
          console.log(`WebSocket closed with code ${event.code}. Reason: ${event.reason || 'No reason provided'}`);
          
          // Attempt reconnection for unexpected closures
          if (event.code !== 1000) { // 1000 is normal closure
            console.log('Attempting to reconnect in 5 seconds...');
            setTimeout(() => {
              // Only try to reconnect if component is still mounted
              if (socketRef.current === socket) {
                console.log('Reconnecting to WebSocket...');
                // This will trigger this useEffect again
                socketRef.current = null;
              }
            }, 5000);
          }
        };
        
        socketRef.current = socket;
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        fallbackToTraditionalFetching();
      }
      
      // Clean up WebSocket on unmount
      return () => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.close(1000, "Component unmounted");
        }
      };
    }
  }, [session?.user?.id, session?.user?.accessToken]);

  // Fallback mechanism for when WebSockets fail
  const fallbackToTraditionalFetching = () => {
    console.log('Falling back to traditional notification fetching');
    // Fetch unread count through a regular API call
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications/unread-count', {
          headers: {
            'Authorization': `Bearer ${session?.user?.accessToken}`
          }
        });
        const data = await response.json();
        setUnreadCount(data.count || 0);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };
    
    fetchUnreadCount();
  };

  const markAllAsRead = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ command: 'mark_all_as_read' }));
      setUnreadCount(0);
      // Clear notifications from the dropdown
      setNotifications([]);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    changeLocale(lang);
  };

  const getProfileUrl = () => {
    if (session?.user.role == "admin") {
      return "/admin/profile";
    } else if (session?.user.role == "teacher") {
      return "/dashboard/profile";
    } else {
      return "/dashboard/profile";
    }
  };

  const getInitials = (name: string) => {
    const [firstName, lastName] = name.split(" ");
    return firstName?.[0] + lastName?.[0];
  };

  const viewAllNotifications = () => {
    // Redirect to notifications page based on user role
    const basePath = session?.user.role === "admin" ? "/admin" : "/dashboard";
    window.location.href = `${basePath}/notifications`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className={cn("flex h-16 items-center justify-end px-4", isMobile && "justify-between")}>
        {isMobile && (
          <Button onClick={toggleSidebar} size="icon" variant="ghost">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center gap-4">
          {/* Notifications Dropdown with WebSocket */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-red-500 text-xs text-white font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="font-semibold flex justify-between items-center sticky top-0 bg-white z-10">
                {t("notifications.title")}
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                    {t("notifications.markAllAsRead")}
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto px-1">
                {notifications.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {t("notifications.noNew")}
                  </div>
                )}
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start my-1 p-2 cursor-default">
                    <span className="font-medium">{notification.title}</span>
                    <span 
                      className="text-xs text-gray-500 mt-1"
                      dangerouslySetInnerHTML={{ __html: notification.message }}
                    />
                    <span className="text-[10px] text-gray-400 mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="justify-center text-sm font-medium text-primary"
                onClick={viewAllNotifications}
              >
                {t("notifications.viewAll")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Existing Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9 border">
                  <AvatarImage
                    src={session?.user?.avatar}
                    alt={session?.user.first_name}
                  />
                  <AvatarFallback>
                    {getInitials(`${session?.user.first_name} ${session?.user.last_name}`)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {session?.user.first_name} {session?.user.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session?.user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link href={getProfileUrl()} className="cursor-pointer">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    {t("nav.profile")}
                  </DropdownMenuItem>
                </Link>
                {session?.user?.role == "admin" && (
                  <Link href={"/admin/settings"}>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      {t("dashboardPage.settings")}
                    </DropdownMenuItem>
                  </Link>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Globe className="mr-2 h-4 w-4" />
                  <span>{t("nav.language")}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuCheckboxItem
                    checked={selectedLanguage === "en"}
                    onCheckedChange={() => handleLanguageChange("en")}
                  >
                    <span className="mr-2">🇺🇸</span>
                    <span>English</span>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedLanguage === "fr"}
                    onCheckedChange={() => handleLanguageChange("fr")}
                  >
                    <span className="mr-2">🇫🇷</span>
                    <span>Français</span>
                  </DropdownMenuCheckboxItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ redirectTo: "/auth/login" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t("nav.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
