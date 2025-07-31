import { Link, useLocation } from "wouter";
import { 
  Home, 
  MessageCircle, 
  Calendar, 
  Heart, 
  Gift, 
  User,
  LogOut,
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/messages", icon: MessageCircle, label: "Messages" },
  { href: "/daily", icon: Calendar, label: "Check-in" },
  { href: "/bookmarks", icon: Heart, label: "Favorites" },
  { href: "/rewards", icon: Gift, label: "Rewards" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function MobileNav() {
  const [location] = useLocation();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
      <div className="fixed left-0 top-0 h-full w-72 bg-white shadow-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-primary">Boomquotes</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // This will be handled by parent component
              const event = new CustomEvent('closeMobileNav');
              window.dispatchEvent(event);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  const event = new CustomEvent('closeMobileNav');
                  window.dispatchEvent(event);
                }}
              >
                <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  isActive 
                    ? "bg-primary text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}>
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
          
          {user && (
            <div 
              onClick={async () => {
                await handleSignOut();
                const event = new CustomEvent('closeMobileNav');
                window.dispatchEvent(event);
              }}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sign Out</span>
            </div>
          )}
        </nav>
        
        {user && (
          <div className="absolute bottom-4 left-4 right-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">{user.email}</p>
            <p className="text-xs text-gray-500">Signed in</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function BottomNav() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex flex-col items-center py-2 px-1 ${
                isActive ? "text-blue-600" : "text-gray-600"
              }`}>
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}