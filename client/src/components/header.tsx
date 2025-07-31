import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Quote, User, LogOut } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { MobileNav } from "./mobile-nav";

const navItems = [
  { label: "Discover", href: "/" },
  { label: "Messages", href: "/messages" },
  { label: "All Content", href: "/content" },
  { label: "Daily Check-In", href: "/daily" },
  { label: "Bookmarks", href: "/bookmarks" },
  { label: "Rewards", href: "/rewards" },
  { label: "Invite & Earn", href: "/invite" },
];

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, userProfile, signOut } = useAuth();

  // Listen for mobile nav close event
  useEffect(() => {
    const handleCloseMobileNav = () => {
      setMobileMenuOpen(false);
    };

    window.addEventListener('closeMobileNav', handleCloseMobileNav);
    return () => window.removeEventListener('closeMobileNav', handleCloseMobileNav);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href="/">
                <div className="flex-shrink-0 flex items-center cursor-pointer">
                  <Quote className="text-primary text-2xl mr-3" />
                  <h1 className="text-2xl font-bold text-primary">Boomquotes</h1>
                </div>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={`transition-colors pb-2 cursor-pointer ${
                      location === item.href
                        ? "text-primary font-medium border-b-2 border-primary"
                        : "text-neutral-500 hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>

            {/* User Menu & Mobile menu button */}
            <div className="flex items-center space-x-4">
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-white text-sm">
                          {getUserInitials(user.email || 'U')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">{user.email}</p>
                      {userProfile?.phone && (
                        <p className="text-xs leading-none text-muted-foreground">
                          {userProfile.phone}
                        </p>
                      )}
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(true)}
                  className="text-neutral-500 hover:text-primary"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <MobileNav />
      )}
    </>
  );
}
