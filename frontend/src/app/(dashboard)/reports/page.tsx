"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2, AlertCircle, Calendar, GraduationCap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function ReportsPage() {
  const [terms, setTerms] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [termsRes, classesRes] = await Promise.all([
        api.get('/terms'),
        api.get('/classes')
      ]);
      setTerms(termsRes.data);
      setClasses(classesRes.data);
      if (termsRes.data.length > 0) setSelectedTerm(termsRes.data[0].id);
    } catch (error) {
      console.error("Failed to fetch reports data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadClassReports = async () => {
    if (!selectedTerm || !selectedClass) return;
    try {
      setIsGenerating(true);
      
      const response = await api.get(`/reports/class/${selectedClass}/term/${selectedTerm}`, {
        responseType: 'blob', // Expect binary data for PDF
      });
      
      // Create a Blob from the PDF Stream
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      
      // Create a temporary link element to trigger the download
      const downloadLink = document.createElement('a');
      downloadLink.href = fileURL;
      downloadLink.download = `class_reports_${selectedClass}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Clean up
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error("Failed to generate reports", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Academic Reports</h1>
        <p className="text-slate-500 font-medium text-lg">Generate and download official student progress reports.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary p-8 text-white">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-white/20 p-2 rounded-xl">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Class Report Batch</CardTitle>
                <CardDescription className="text-white/70">Generate PDF report cards for an entire class at once.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> Select Term
                </Label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger className="rounded-xl h-12 border-slate-200">
                    <SelectValue placeholder="Academic Term" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name} ({t.academicYear?.year})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <GraduationCap className="h-3 w-3" /> Select Class
                </Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="rounded-xl h-12 border-slate-200">
                    <SelectValue placeholder="Standard / Stream" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-bold text-slate-900">Wait for computation</p>
                <p className="text-slate-500">Ensure all marks have been finalized for the selected term before generating.</p>
              </div>
            </div>

            <Button 
              className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
              onClick={handleDownloadClassReports}
              disabled={!selectedTerm || !selectedClass || isGenerating}
            >
              {isGenerating ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Download className="mr-2 h-6 w-6" />}
              Download All Reports
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] flex flex-col justify-center p-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl font-black">Performance Statistics</h2>
            <p className="text-slate-300 font-medium">Generate high-level summaries of school performance across different zones and subjects.</p>
            <div className="space-y-4 pt-4">
              <Button variant="outline" className="w-full h-14 rounded-2xl border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold">
                Generate School Performance PDF
              </Button>
              <Button variant="ghost" className="w-full h-14 rounded-2xl text-slate-400 hover:text-white font-bold">
                View Past Statistics
              </Button>
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 h-80 w-80 bg-primary/20 rounded-full blur-[100px]"></div>
        </Card>
      </div>
    </div>
  );
}
