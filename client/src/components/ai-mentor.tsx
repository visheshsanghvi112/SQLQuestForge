import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

interface AIMentorProps {
  levelId?: number;
  currentQuery?: string;
}

export default function AIMentor({ levelId, currentQuery }: AIMentorProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    try {
      const res = await apiRequest("POST", "/api/ask", { question, levelId, currentQuery });
      const json = await res.json();
      setAnswer(json.answer || "No answer");
    } catch (e: any) {
      setAnswer("Failed to get answer. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="font-medium">AI Mentor</div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about this level or your query..."
          rows={3}
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={ask} disabled={loading}>
            {loading ? "Asking..." : "Ask"}
          </Button>
        </div>
        {answer && (
          <div className="text-sm whitespace-pre-wrap leading-relaxed">{answer}</div>
        )}
      </CardContent>
    </Card>
  );
}


