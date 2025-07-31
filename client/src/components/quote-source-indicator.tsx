import { Badge } from "@/components/ui/badge";
import { Globe, Database } from "lucide-react";

interface QuoteSourceIndicatorProps {
  source?: string;
  className?: string;
}

export function QuoteSourceIndicator({ source, className = "" }: QuoteSourceIndicatorProps) {
  if (!source) return null;

  const getSourceInfo = (source: string) => {
    switch (source) {
      case "quotable.io":
        return { label: "Quotable", color: "bg-blue-100 text-blue-800" };
      case "zenquotes.io":
        return { label: "ZenQuotes", color: "bg-purple-100 text-purple-800" };
      case "quotegarden.herokuapp.com":
        return { label: "Quote Garden", color: "bg-green-100 text-green-800" };
      case "api.api-ninjas.com":
        return { label: "API Ninjas", color: "bg-orange-100 text-orange-800" };
      case "goquotes-api.herokuapp.com":
        return { label: "GoQuotes", color: "bg-pink-100 text-pink-800" };
      case "stoicquotesapi.com":
        return { label: "Stoic Quotes", color: "bg-gray-100 text-gray-800" };
      case "builtin":
        return { label: "Built-in", color: "bg-indigo-100 text-indigo-800" };
      case "api":
        return { label: "External API", color: "bg-teal-100 text-teal-800" };
      default:
        return { label: "External", color: "bg-gray-100 text-gray-800" };
    }
  };

  const { label, color } = getSourceInfo(source);
  const isExternal = source !== "builtin";

  return (
    <Badge className={`${color} ${className} text-xs`} variant="secondary">
      {isExternal ? <Globe className="h-3 w-3 mr-1" /> : <Database className="h-3 w-3 mr-1" />}
      {label}
    </Badge>
  );
}