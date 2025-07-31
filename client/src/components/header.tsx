import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";

const navItems = [
  { label: "Discover", href: "/" },
  { label: "Favorites", href: "/favorites" },
  { label: "Categories", href: "/categories" },
  { label: "Daily", href: "/daily" },
];

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Quote className="text-primary text-2xl mr-3" />
                <h1 className="text-2xl font-bold text-primary">BoomWheel</h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`transition-colors pb-2 ${
                      location === item.href
                        ? "text-primary font-medium border-b-2 border-primary"
                        : "text-neutral-500 hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
            </nav>

            {/* Mobile menu button */}
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
      </header>

      <MobileNav 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
        navItems={navItems}
        currentLocation={location}
      />
    </>
  );
}
