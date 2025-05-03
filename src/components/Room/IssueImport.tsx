
import React, { ChangeEvent, useState } from "react";
import { Button } from "@/components/shared/Button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Issue } from "@/types";
import { toast } from "@/components/ui/sonner";

interface IssueImportProps {
  onImport: (issues: Partial<Issue>[]) => void;
}

const IssueImport: React.FC<IssueImportProps> = ({ onImport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("csv");
  const [csvText, setCsvText] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manualIssues, setManualIssues] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const parseCSV = (text: string): Partial<Issue>[] => {
    try {
      const lines = text.split("\n").filter(line => line.trim());
      const headers = lines[0].split(",").map(h => h.trim());

      const keyIndex = headers.findIndex(h => 
        h.toLowerCase() === "key" || h.toLowerCase() === "id" || h.toLowerCase() === "issue"
      );
      const titleIndex = headers.findIndex(h => 
        h.toLowerCase() === "title" || h.toLowerCase() === "summary" || h.toLowerCase() === "name"
      );
      const descIndex = headers.findIndex(h => 
        h.toLowerCase() === "description" || h.toLowerCase() === "desc"
      );

      if (titleIndex === -1) {
        throw new Error("Could not find title/summary column");
      }

      return lines.slice(1).map((line, index) => {
        const values = line.split(",").map(v => v.trim());
        return {
          key: keyIndex !== -1 && values[keyIndex] ? values[keyIndex] : `ISSUE-${index + 1}`,
          title: values[titleIndex],
          description: descIndex !== -1 && values[descIndex] ? values[descIndex] : undefined,
        };
      });
    } catch (error) {
      console.error("CSV parse error:", error);
      throw new Error("Failed to parse CSV data. Please check the format.");
    }
  };

  const parseManual = (text: string): Partial<Issue>[] => {
    try {
      return text
        .split("\n")
        .filter(line => line.trim())
        .map((line, index) => {
          // Try to separate key and title if they're formatted like "KEY-123: Title"
          const match = line.match(/^([A-Z0-9]+-\d+):\s*(.+)$/);
          
          if (match) {
            return {
              key: match[1],
              title: match[2],
            };
          } else {
            return {
              key: `ISSUE-${index + 1}`,
              title: line,
            };
          }
        });
    } catch (error) {
      console.error("Manual parse error:", error);
      throw new Error("Failed to parse manual issues. Please check the format.");
    }
  };

  const handleImport = async () => {
    setIsLoading(true);
    try {
      let parsedIssues: Partial<Issue>[] = [];
      
      if (activeTab === "csv") {
        if (!csvText.trim()) {
          throw new Error("Please enter CSV data");
        }
        parsedIssues = parseCSV(csvText);
      } else if (activeTab === "file") {
        if (!selectedFile) {
          throw new Error("Please select a file");
        }
        
        // For this example, we'll just read the file as text and assume CSV format
        // In a real app, you'd want to handle Excel and PDF differently
        const text = await selectedFile.text();
        parsedIssues = parseCSV(text);
      } else if (activeTab === "manual") {
        if (!manualIssues.trim()) {
          throw new Error("Please enter issue titles");
        }
        parsedIssues = parseManual(manualIssues);
      }
      
      if (parsedIssues.length === 0) {
        throw new Error("No valid issues found");
      }

      onImport(parsedIssues);
      setIsOpen(false);
      toast.success(`Imported ${parsedIssues.length} issues successfully`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to import issues");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline"
        onClick={() => setIsOpen(true)}
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4"><path d="M7.81825 1.18188C7.64251 1.00615 7.35759 1.00615 7.18185 1.18188L4.18185 4.18188C4.00611 4.35762 4.00611 4.64254 4.18185 4.81828C4.35759 4.99401 4.64251 4.99401 4.81825 4.81828L7.05005 2.58648V9.49996C7.05005 9.74849 7.25152 9.94996 7.50005 9.94996C7.74858 9.94996 7.95005 9.74849 7.95005 9.49996V2.58648L10.1819 4.81828C10.3576 4.99401 10.6425 4.99401 10.8182 4.81828C10.994 4.64254 10.994 4.35762 10.8182 4.18188L7.81825 1.18188ZM2.5 9.99997C2.77614 9.99997 3 10.2238 3 10.5V12C3 12.5523 3.44772 13 4 13H11C11.5523 13 12 12.5523 12 12V10.5C12 10.2238 12.2239 9.99997 12.5 9.99997C12.7761 9.99997 13 10.2238 13 10.5V12C13 13.1046 12.1046 14 11 14H4C2.89543 14 2 13.1046 2 12V10.5C2 10.2238 2.22386 9.99997 2.5 9.99997Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
        Import Issues
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Issues</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="csv" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="csv">CSV</TabsTrigger>
              <TabsTrigger value="file">File Upload</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            </TabsList>
            
            <TabsContent value="csv" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csvInput">CSV Data</Label>
                <Textarea 
                  id="csvInput"
                  placeholder="key,title,description
PROJ-1,Add login feature,User authentication flow
PROJ-2,Fix homepage bug,Navigation issues"
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                  className="min-h-[200px]"
                />
                <p className="text-xs text-gray-500">
                  Enter CSV data with headers. Required columns: title/summary.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fileInput">Upload File</Label>
                <Input 
                  id="fileInput" 
                  type="file" 
                  accept=".csv,.xlsx,.pdf"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-gray-500">
                  Supported formats: CSV, Excel (.xlsx), PDF
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manualInput">Enter Issues</Label>
                <Textarea 
                  id="manualInput"
                  placeholder="PROJ-1: Add login feature
PROJ-2: Fix homepage bug
Add payment integration"
                  value={manualIssues}
                  onChange={e => setManualIssues(e.target.value)}
                  className="min-h-[200px]"
                />
                <p className="text-xs text-gray-500">
                  Enter one issue per line. Optional format: KEY-123: Title
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleImport}
              isLoading={isLoading}
            >
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IssueImport;
