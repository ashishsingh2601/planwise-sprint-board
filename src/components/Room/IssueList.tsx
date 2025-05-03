
import React from "react";
import { Issue } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/shared/Button";

interface IssueListProps {
  issues: Issue[];
  currentIssueId?: string;
  onSelectIssue: (issueId: string) => void;
  isHost: boolean;
}

const IssueList: React.FC<IssueListProps> = ({
  issues,
  currentIssueId,
  onSelectIssue,
  isHost,
}) => {
  const estimatedIssues = issues.filter(i => i.estimation !== undefined);
  const unestimatedIssues = issues.filter(i => i.estimation === undefined);
  
  return (
    <Card className="h-full">
      <CardContent className="p-4 h-full flex flex-col">
        <h2 className="text-xl font-bold mb-4">Issues</h2>
        
        <div className="flex mb-4 gap-2">
          <Badge variant="outline" className="bg-planwise-light-purple text-planwise-purple">
            {issues.length} Total
          </Badge>
          <Badge variant="outline" className="bg-green-100 text-green-700">
            {estimatedIssues.length} Estimated
          </Badge>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            {unestimatedIssues.length} Remaining
          </Badge>
        </div>
        
        <ScrollArea className="flex-1 pr-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">Unestimated</h3>
          {unestimatedIssues.length > 0 ? (
            <div className="space-y-2 mb-6">
              {unestimatedIssues.map((issue) => (
                <Card 
                  key={issue.id}
                  className={`border ${issue.id === currentIssueId ? 'border-planwise-purple bg-planwise-light-purple/20' : ''}`}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <span className="text-xs font-mono text-gray-500 mr-2">{issue.key}</span>
                          <h4 className="font-medium">{issue.title}</h4>
                        </div>
                        {issue.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {issue.description}
                          </p>
                        )}
                      </div>
                      
                      {isHost && (
                        <Button
                          size="sm"
                          variant={issue.id === currentIssueId ? "secondary" : "outline"}
                          onClick={() => onSelectIssue(issue.id)}
                          className="ml-2 text-xs h-8"
                          disabled={issue.id === currentIssueId}
                        >
                          {issue.id === currentIssueId ? 'Current' : 'Select'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-6">No unestimated issues</p>
          )}
          
          <h3 className="text-sm font-semibold text-gray-500 mb-2">Estimated</h3>
          {estimatedIssues.length > 0 ? (
            <div className="space-y-2">
              {estimatedIssues.map((issue) => (
                <Card key={issue.id} className="border">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <span className="text-xs font-mono text-gray-500 mr-2">{issue.key}</span>
                          <h4 className="font-medium">{issue.title}</h4>
                        </div>
                        {issue.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {issue.description}
                          </p>
                        )}
                      </div>
                      
                      <Badge className="bg-blue-100 text-blue-700">
                        {issue.estimation} pts
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No estimated issues yet</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default IssueList;
