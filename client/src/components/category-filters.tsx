import { Shuffle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CategoryFiltersProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onRandomQuote: () => void;
}

const categories = [
  { id: "all", label: "All", color: "category-all" },
  { id: "motivational", label: "Motivation", color: "category-motivational" },
  { id: "love", label: "Love", color: "category-love" },
  { id: "hustle", label: "Hustle", color: "category-hustle" },
  { id: "wisdom", label: "Wisdom", color: "category-wisdom" },
  { id: "life", label: "Life", color: "category-life" },
  { id: "romantic", label: "Romantic", color: "category-romantic" },
  { id: "politics", label: "Politics", color: "category-politics" },
  { id: "social", label: "Social", color: "category-social" },
  { id: "funny", label: "Funny", color: "category-funny" },
  { id: "success", label: "Success", color: "category-success" },
  { id: "inspiration", label: "Inspiration", color: "category-inspiration" },
  { id: "mindfulness", label: "Mindfulness", color: "category-mindfulness" },
];

export function CategoryFilters({ activeCategory, onCategoryChange, onRandomQuote }: CategoryFiltersProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Explore Quotes</h2>
        <Button
          onClick={onRandomQuote}
          className="bg-primary text-white hover:bg-blue-600 transition-colors flex items-center"
        >
          <Shuffle className="h-4 w-4 mr-2" />
          Random Quote
        </Button>
      </div>
      
      {/* Category Dropdown Filter */}
      <div className="mb-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full max-w-xs justify-between">
              {categories.find(cat => cat.id === activeCategory)?.label || "Select Category"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
            {categories.map((category) => (
              <DropdownMenuItem
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={activeCategory === category.id ? "bg-blue-50" : ""}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{category.label}</span>
                  {activeCategory === category.id && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  );
}
