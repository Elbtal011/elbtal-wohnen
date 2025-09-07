import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface CSVRow {
  [key: string]: string;
}

interface AnalysisResult {
  fileName: string;
  totalRows: number;
  columns: string[];
  sampleData: CSVRow[];
  emailPhoneMapping: Array<{
    email: string;
    phone: string;
    name: string;
    hasDocuments: boolean;
    documentCount: number;
  }>;
}

export default function CSVAnalyzer() {
  const [fileName, setFileName] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const parseCSV = (content: string): CSVRow[] => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: CSVRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }

    return rows;
  };

  const analyzeCSV = () => {
    if (!fileName || !csvContent) {
      toast({
        title: "Missing Data",
        description: "Please provide both file name and CSV content",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const rows = parseCSV(csvContent);
      if (rows.length === 0) {
        throw new Error('No valid CSV data found');
      }

      const columns = Object.keys(rows[0]);
      const sampleData = rows.slice(0, 5);

      // Extract email/phone mappings based on file type
      let emailPhoneMapping: any[] = [];

      if (fileName.includes('contact_requests')) {
        emailPhoneMapping = rows.map(row => ({
          email: row.email || '',
          phone: row.telefon || '',
          name: `${row.vorname || ''} ${row.nachname || ''}`.trim(),
          hasDocuments: false,
          documentCount: 0,
          id: row.id,
          created_at: row.created_at,
          lead_label: row.lead_label,
          status: row.status
        }));
      } else if (fileName.includes('property_applications')) {
        emailPhoneMapping = rows.map(row => ({
          email: row.email || '',
          phone: row.telefon || '',
          name: `${row.vorname || ''} ${row.nachname || ''}`.trim(),
          hasDocuments: false,
          documentCount: 0,
          user_id: row.user_id,
          created_at: row.created_at,
          status: row.status
        }));
      } else if (fileName.includes('user_documents')) {
        emailPhoneMapping = rows.map(row => ({
          user_id: row.user_id,
          file_name: row.file_name,
          file_path: row.file_path,
          document_type: row.document_type,
          uploaded_at: row.uploaded_at,
          file_size: row.file_size
        }));
      }

      const result: AnalysisResult = {
        fileName,
        totalRows: rows.length,
        columns,
        sampleData,
        emailPhoneMapping
      };

      setAnalysis(result);
      toast({
        title: "Analysis Complete",
        description: `Analyzed ${rows.length} rows from ${fileName}`
      });

    } catch (error) {
      console.error('CSV Analysis Error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze CSV",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysis(null);
    setFileName('');
    setCsvContent('');
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CSV Data Analyzer</h1>
        <p className="text-muted-foreground">
          Paste CSV content to analyze document mappings and storage references
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload CSV Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">File Name</label>
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g., contact_requests.csv"
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">CSV Content</label>
            <Textarea
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="Paste your CSV content here..."
              className="mt-1 h-48 font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={analyzeCSV} disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Analyze CSV'}
            </Button>
            <Button variant="outline" onClick={clearAnalysis}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results: {analysis.fileName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Total Rows</div>
                  <div className="text-2xl font-bold">{analysis.totalRows}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Columns</div>
                  <div className="text-2xl font-bold">{analysis.columns.length}</div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-2">Columns Found:</h3>
                <div className="flex flex-wrap gap-1">
                  {analysis.columns.map((col, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {col}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Sample Data (First 5 rows):</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border rounded">
                    <thead>
                      <tr className="border-b bg-muted">
                        {analysis.columns.map((col, index) => (
                          <th key={index} className="p-2 text-left font-medium">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.sampleData.map((row, index) => (
                        <tr key={index} className="border-b">
                          {analysis.columns.map((col, colIndex) => (
                            <td key={colIndex} className="p-2 max-w-[200px] truncate">
                              {row[col]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {analysis.fileName.includes('contact_requests') && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Requests Email/Phone Mapping</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {analysis.emailPhoneMapping.map((contact: any, index) => (
                    <div key={index} className="p-3 border rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-sm text-muted-foreground">{contact.email}</div>
                          <div className="text-sm text-muted-foreground">{contact.phone}</div>
                        </div>
                        <div className="text-right">
                          <Badge variant={contact.lead_label ? "default" : "secondary"}>
                            {contact.lead_label || "No Label"}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {contact.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {analysis.fileName.includes('user_documents') && (
            <Card>
              <CardHeader>
                <CardTitle>User Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {analysis.emailPhoneMapping.map((doc: any, index) => (
                    <div key={index} className="p-3 border rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{doc.file_name}</div>
                          <div className="text-sm text-muted-foreground">{doc.file_path}</div>
                          <div className="text-sm text-muted-foreground">Type: {doc.document_type}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">{doc.file_size} bytes</div>
                          <div className="text-xs text-muted-foreground">{doc.uploaded_at}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}