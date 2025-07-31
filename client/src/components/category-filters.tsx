import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((category) => (
          <Button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              activeCategory === category.id
                ? category.color
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            variant="ghost"
          >
            {category.label}
          </Button>
        ))}
      </div>
    </section>
  );
}
