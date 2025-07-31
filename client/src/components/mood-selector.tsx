import { useState } from "react";
import { Smile, Frown, Heart, Zap, Brain, Sparkles, CloudRain, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export interface Mood {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  keywords: string[];
}

const moods: Mood[] = [
  {
    id: "happy",
    label: "Happy",
    icon: <Smile className="h-6 w-6" />,
    color: "bg-yellow-500 hover:bg-yellow-600",
    description: "Feeling joyful and optimistic",
    keywords: ["joy", "celebration", "success", "gratitude", "positive"]
  },
  {
    id: "motivated",
    label: "Motivated",
    icon: <Zap className="h-6 w-6" />,
    color: "bg-orange-500 hover:bg-orange-600",
    description: "Ready to take on challenges",
    keywords: ["motivation", "goals", "hustle", "achievement", "determination"]
  },
  {
    id: "inspired",
    label: "Inspired",
    icon: <Sparkles className="h-6 w-6" />,
    color: "bg-purple-500 hover:bg-purple-600",
    description: "Seeking creativity and innovation",
    keywords: ["inspiration", "creativity", "dreams", "vision", "breakthrough"]
  },
  {
    id: "peaceful",
    label: "Peaceful",
    icon: <Sun className="h-6 w-6" />,
    color: "bg-green-500 hover:bg-green-600",
    description: "Looking for calm and balance",
    keywords: ["mindfulness", "peace", "calm", "meditation", "balance"]
  },
  {
    id: "thoughtful",
    label: "Thoughtful",
    icon: <Brain className="h-6 w-6" />,
    color: "bg-blue-500 hover:bg-blue-600",
    description: "In a reflective state",
    keywords: ["wisdom", "life", "philosophy", "reflection", "growth"]
  },
  {
    id: "romantic",
    label: "Romantic",
    icon: <Heart className="h-6 w-6" />,
    color: "bg-pink-500 hover:bg-pink-600",
    description: "Feeling loving and connected",
    keywords: ["love", "romance", "relationships", "heart", "connection"]
  },
  {
    id: "sad",
    label: "Down",
    icon: <CloudRain className="h-6 w-6" />,
    color: "bg-gray-500 hover:bg-gray-600",
    description: "Need some encouragement",
    keywords: ["encouragement", "hope", "healing", "support", "comfort"]
  },
  {
    id: "stressed",
    label: "Stressed",
    icon: <Frown className="h-6 w-6" />,
    color: "bg-red-500 hover:bg-red-600",
    description: "Looking for relief and perspective",
    keywords: ["stress", "relief", "calm", "perspective", "strength"]
  }
];

interface MoodSelectorProps {
  onMoodSelect: (mood: Mood) => void;
  selectedMood?: Mood | null;
}

export function MoodSelector({ onMoodSelect, selectedMood }: MoodSelectorProps) {
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          How are you feeling today?
        </CardTitle>
        <p className="text-gray-600">
          Get personalized quote recommendations based on your current mood
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {moods.map((mood) => (
            <motion.div
              key={mood.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setHoveredMood(mood.id)}
              onHoverEnd={() => setHoveredMood(null)}
            >
              <Button
                variant={selectedMood?.id === mood.id ? "default" : "outline"}
                className={`
                  h-auto p-4 flex flex-col items-center space-y-2 w-full transition-all duration-200
                  ${selectedMood?.id === mood.id ? mood.color + " text-white" : "hover:bg-gray-50"}
                `}
                onClick={() => onMoodSelect(mood)}
              >
                <div className={`
                  ${selectedMood?.id === mood.id ? "text-white" : "text-gray-600"}
                `}>
                  {mood.icon}
                </div>
                <span className={`
                  text-sm font-medium
                  ${selectedMood?.id === mood.id ? "text-white" : "text-gray-700"}
                `}>
                  {mood.label}
                </span>
              </Button>
            </motion.div>
          ))}
        </div>
        
        {(selectedMood || hoveredMood) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-blue-50 rounded-lg"
          >
            <p className="text-sm text-blue-800">
              {(selectedMood || moods.find(m => m.id === hoveredMood))?.description}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {(selectedMood || moods.find(m => m.id === hoveredMood))?.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

export { moods };