import { Badge } from "@/components/ui/badge";
import { ExternalLink, Database } from "lucide-react";

interface QuoteSourceIndicatorProps {
  source: string;
}

export function QuoteSourceIndicator({ source }: QuoteSourceIndicatorProps) {
  const getSourceConfig = (source: string) => {
    const configs = {
      quotable: { 
        label: "Quotable", 
        color: "bg-blue-100 text-blue-800", 
        icon: ExternalLink 
      },
      zenquotes: { 
        label: "ZenQuotes", 
        color: "bg-purple-100 text-purple-800", 
        icon: ExternalLink 
      },
      quotegarden: { 
        label: "Quote Garden", 
        color: "bg-green-100 text-green-800", 
        icon: ExternalLink 
      },
      goquotes: { 
        label: "GoQuotes", 
        color: "bg-orange-100 text-orange-800", 
        icon: ExternalLink 
      },
      stoicquotes: { 
        label: "Stoic Quotes", 
        color: "bg-gray-100 text-gray-800", 
        icon: ExternalLink 
      },
      builtin: { 
        label: "Built-in", 
        color: "bg-slate-100 text-slate-800", 
        icon: Database 
      },
      api: { 
        label: "External API", 
        color: "bg-indigo-100 text-indigo-800", 
        icon: ExternalLink 
      }
    };
    
    return configs[source as keyof typeof configs] || configs.builtin;
  };

  const config = getSourceConfig(source);
  const Icon = config.icon;

  return (
    <Badge className={`text-xs ${config.color} border-0`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}