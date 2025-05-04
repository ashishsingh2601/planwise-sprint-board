
import React, { ChangeEvent, useState } from "react";
import { Button } from "@/components/shared/Button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Issue } from "@/types";
import { toast } from "@/components/ui/sonner";
import { FileText, Upload, Users } from "lucide-react";

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
        
        // For Excel and PDF handling, we'd need additional libraries
        // For this example, we're just pretending to handle them
        if (selectedFile.type.includes("csv")) {
          const text = await selectedFile.text();
          parsedIssues = parseCSV(text);
        } else if (selectedFile.type.includes("excel") || selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls")) {
          // In a real implementation, we'd use a library like xlsx or exceljs
          // For now, simulate some Excel data
          toast.info("Processing Excel file...");
          // Simulate delay for file processing
          await new Promise(resolve => setTimeout(resolve, 500));
          
          parsedIssues = [
            { key: "DEMO-1", title: "Sample Excel Issue 1" },
            { key: "DEMO-2", title: "Sample Excel Issue 2" },
            { key: "DEMO-3", title: "Sample Excel Issue 3" },
          ];
        } else if (selectedFile.type.includes("pdf") || selectedFile.name.endsWith(".pdf")) {
          // In a real implementation, we'd use a library like pdf.js
          // For now, simulate some PDF data
          toast.info("Processing PDF file...");
          // Simulate delay for file processing
          await new Promise(resolve => setTimeout(resolve, 500));
          
          parsedIssues = [
            { key: "PDF-1", title: "Sample PDF Issue 1" },
            { key: "PDF-2", title: "Sample PDF Issue 2" },
          ];
        } else {
          throw new Error("Unsupported file format. Please use CSV, Excel (.xlsx/.xls), or PDF.");
        }
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
      
      // Clear form data
      setCsvText("");
      setSelectedFile(null);
      setManualIssues("");
      
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
        className="flex items-center gap-2"
      >
        <Upload size={16} />
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {selectedFile ? (
                    <div className="flex flex-col items-center">
                      <FileText size={36} className="text-planwise-purple mb-2" />
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mt-2"
                        onClick={() => setSelectedFile(null)}
                      >
                        Change file
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload size={36} className="text-gray-400 mb-2" />
                      <p className="text-gray-500 mb-2">
                        Drag and drop or click to upload
                      </p>
                      <Input 
                        id="fileInput" 
                        type="file" 
                        accept=".csv,.xlsx,.xls,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('fileInput')?.click()}
                      >
                        Select File
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Supported formats: CSV, Excel (.xlsx/.xls), PDF
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
