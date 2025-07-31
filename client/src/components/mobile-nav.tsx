import { Link } from "wouter";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: { label: string; href: string }[];
  currentLocation: string;
}

export function MobileNav({ isOpen, onClose, navItems, currentLocation }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl transform transition-transform">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-primary">Menu</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="space-y-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={`block transition-colors ${
                    currentLocation === item.href
                      ? "text-primary font-medium"
                      : "text-neutral-500"
                  }`}
                  onClick={onClose}
                >
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
