import { Link } from "wouter";
import { X, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: { label: string; href: string }[];
  currentLocation: string;
}

export function MobileNav({ isOpen, onClose, navItems, currentLocation }: MobileNavProps) {
  const { user, userProfile, signOut } = useAuth();

  if (!isOpen) return null;

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-xl transform transition-transform">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-primary">Menu</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {user && (
            <div className="mb-6 pb-6 border-b border-neutral-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm">{user.email}</p>
                  {userProfile?.phone && (
                    <p className="text-xs text-neutral-500">{userProfile.phone}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <nav className="space-y-2 mb-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={`block p-3 rounded-lg transition-colors cursor-pointer ${
                    currentLocation === item.href
                      ? "bg-primary text-white font-medium"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                  onClick={onClose}
                >
                  {item.label}
                </div>
              </Link>
            ))}
          </nav>

          {user && (
            <div className="border-t border-neutral-200 pt-6 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleSignOut}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
