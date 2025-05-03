
import React from "react";
import { EstimationSummary } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface RevealSummaryProps {
  summaries: EstimationSummary[];
  totalVotes: number;
  onFinalize: (value: number) => void;
  onReEstimate: () => void;
  isHost: boolean;
}

const RevealSummary: React.FC<RevealSummaryProps> = ({
  summaries,
  totalVotes,
  onFinalize,
  onReEstimate,
  isHost,
}) => {
  // Find the most popular vote
  const mostPopular = 
    summaries.length > 0 
      ? summaries.reduce((prev, current) => 
          prev.count > current.count ? prev : current
        ) 
      : undefined;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 rounded-t-xl"
    >
      <Card className="border-0 shadow-none">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Vote Summary</h3>
            <Badge variant="outline" className="bg-planwise-light-purple text-planwise-purple">
              {totalVotes} votes
            </Badge>
          </div>

          <div className="space-y-3">
            {summaries.map((summary) => (
              <div key={summary.value} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center">
                    <span className="font-medium text-lg mr-2">{summary.value}</span>
                    <Badge variant="outline" className="bg-gray-100">
                      {summary.count} {summary.count === 1 ? 'vote' : 'votes'}
                    </Badge>
                  </div>
                  <span className="text-gray-500">
                    {Math.round((summary.count / totalVotes) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(summary.count / totalVotes) * 100} 
                  className={`h-2 ${summary.value === mostPopular?.value ? 'bg-planwise-blue' : ''}`}
                />
              </div>
            ))}
          </div>
        </CardContent>

        {isHost && (
          <CardFooter className="flex justify-between px-4 py-3 pt-0">
            <Button
              variant="outline"
              onClick={onReEstimate}
            >
              Re-estimate
            </Button>
            <Button
              variant="primary"
              onClick={() => mostPopular && onFinalize(mostPopular.value)}
              disabled={!mostPopular}
            >
              Accept {mostPopular?.value} points
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export default RevealSummary;
