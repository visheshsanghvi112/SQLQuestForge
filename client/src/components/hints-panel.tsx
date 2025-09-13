import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, X } from "lucide-react";
import { useState } from "react";

interface HintsPanelProps {
  hints: string[];
}

export default function HintsPanel({ hints }: HintsPanelProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!hints.length || !isVisible) return null;

  return (
    <Card className="border-accent/30 shadow-sm" data-testid="card-hints">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-accent" />
            <span className="font-medium text-foreground" data-testid="text-hints-title">
              Hint {hints.length} of 3
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            data-testid="button-dismiss-hints"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {hints.map((hint, index) => (
            <div 
              key={index} 
              className="p-3 bg-accent/10 border border-accent/20 rounded-md"
              data-testid={`hint-${index + 1}`}
            >
              <div className="text-sm font-medium text-accent mb-1">
                Hint {index + 1}:
              </div>
              <p className="text-foreground leading-relaxed">
                {hint}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
