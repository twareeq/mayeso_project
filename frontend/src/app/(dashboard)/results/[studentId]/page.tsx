"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, Loader2, Save, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = params.studentId as string;
  const termId = searchParams.get('termId') ?? '';
  
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [remarks, setRemarks] = useState("");
  const [isSavingRemarks, setIsSavingRemarks] = useState(false);

  useEffect(() => {
    if (studentId && termId) {
      fetchResult();
    }
  }, [studentId, termId]);

  const fetchResult = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/results/student/${studentId}?termId=${termId}`);
      setResult(response.data);
      setRemarks(response.data?.teacherRemarks || "");
    } catch (error) {
      console.error("Failed to fetch result", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await api.post('/reports/student',
        { studentId, termId },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${studentId}_term${termId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download failed', err);
    }
  };

  const handleSaveRemarks = async () => {
    if (!result?.id) return;
    try {
      setIsSavingRemarks(true);
      await api.patch(`/results/${result.id}/remarks`, { teacherRemarks: remarks });
      alert("Remarks saved successfully!");
    } catch (error) {
      console.error("Failed to save remarks", error);
    } finally {
      setIsSavingRemarks(false);
    }
  };

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );

  if (!result) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
      <AlertCircle className="h-12 w-12" />
      <p className="text-xl font-bold">No result found for this term.</p>
    </div>
  );

  const student = result.student;
  const term = result.term;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Student Result Sheet</h1>
          <p className="text-slate-500">Official academic performance record.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button onClick={handleDownloadPDF} className="rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900">{student?.firstName} {student?.lastName}</h2>
              <div className="inline-block mt-2 font-mono text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded border">
                {student?.admissionNumber}
              </div>
            </div>
            <div className="text-slate-600 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold">Class:</span> Standard {student?.class?.name}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Level:</span> {student?.class?.level?.name}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">School:</span> {student?.class?.level?.school?.name}
              </div>
            </div>
            <Badge className="bg-primary/10 text-primary border-none font-bold py-1 px-4 rounded-full">
              Term {term?.termNumber}, {term?.academicYear?.year}
            </Badge>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="text-6xl font-black text-primary tracking-tighter">
              {Math.round(result.totalScore)}%
            </div>
            <Badge className={`text-sm px-6 py-1.5 rounded-full border-none shadow-lg ${result.isPassing ? 'bg-emerald-500 shadow-emerald-100' : 'bg-red-500 shadow-red-100'}`}>
              {result.overallGrade}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
            <span>Academic Performance</span>
            <span className={`${result.isPassing ? 'text-emerald-600' : 'text-red-600'}`}>
              {result.isPassing ? '✅ ELIGIBLE TO PROCEED' : '❌ NEEDS IMPROVEMENT'}
            </span>
          </div>
          <Progress value={result.totalScore} className={`h-3 rounded-full ${result.isPassing ? 'bg-emerald-100' : 'bg-red-100'}`} />
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="py-6 px-8 font-bold text-slate-900">Subject</TableHead>
              <TableHead className="text-center font-bold text-slate-500">A1</TableHead>
              <TableHead className="text-center font-bold text-slate-500">A2</TableHead>
              <TableHead className="text-center font-bold text-slate-500">A3</TableHead>
              <TableHead className="text-center font-bold text-slate-500">A4</TableHead>
              <TableHead className="text-center font-bold text-slate-500">A5</TableHead>
              <TableHead className="text-center font-bold text-slate-500">A6</TableHead>
              <TableHead className="text-center font-bold text-slate-900">/30</TableHead>
              <TableHead className="text-center font-bold text-slate-900">Exam</TableHead>
              <TableHead className="text-center font-bold text-slate-900">Total</TableHead>
              <TableHead className="text-right px-8 font-bold text-slate-900">Grade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.subjectResults.map((sub: any) => (
              <TableRow key={sub.id} className="hover:bg-slate-50/30 transition-colors border-slate-50">
                <TableCell className="py-5 px-8 font-bold text-slate-800">{sub.subjectName}</TableCell>
                <TableCell className="text-center text-slate-600 font-medium">{sub.assessment1 ?? '-'}</TableCell>
                <TableCell className="text-center text-slate-600 font-medium">{sub.assessment2 ?? '-'}</TableCell>
                <TableCell className="text-center text-slate-600 font-medium">{sub.assessment3 ?? '-'}</TableCell>
                <TableCell className="text-center text-slate-600 font-medium">{sub.assessment4 ?? '-'}</TableCell>
                <TableCell className="text-center text-slate-600 font-medium">{sub.assessment5 ?? '-'}</TableCell>
                <TableCell className="text-center text-slate-600 font-medium">{sub.assessment6 ?? '-'}</TableCell>
                <TableCell className="text-center font-black text-slate-900">{sub.assessmentTotal}</TableCell>
                <TableCell className="text-center font-black text-slate-900">{sub.endOfTermScore ?? '-'}</TableCell>
                <TableCell className="text-center">
                  <span className={`inline-block px-3 py-1 rounded-lg font-black ${sub.subjectTotal >= 50 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {sub.subjectTotal}
                  </span>
                </TableCell>
                <TableCell className="text-right px-8 font-bold text-slate-700">{sub.subjectGrade}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h3 className="text-xl font-bold text-slate-900">Teacher's Remarks</h3>
        </div>
        <textarea 
          className="w-full min-h-[120px] p-6 rounded-3xl border border-slate-200 bg-slate-50/50 focus:ring-primary focus:border-primary transition-all text-slate-700 font-medium"
          placeholder="Provide feedback on student performance..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveRemarks} 
            disabled={isSavingRemarks}
            className="rounded-xl px-8 h-12 bg-slate-900 hover:bg-slate-800 transition-all"
          >
            {isSavingRemarks ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            Save Remarks
          </Button>
        </div>
      </div>
    </div>
  );
}

