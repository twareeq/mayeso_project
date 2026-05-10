"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, CheckCircle2, AlertCircle } from "lucide-react";

export default function MarksEntryPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [marks, setMarks] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [completionData, setCompletionData] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
      fetchSubjects(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedStudent && selectedTerm && selectedSubject) {
      fetchExistingMarks();
    }
  }, [selectedStudent, selectedTerm, selectedSubject]);

  useEffect(() => {
    if (selectedClass && selectedSubject && selectedTerm) {
      fetchCompletionStatus();
    }
  }, [selectedClass, selectedSubject, selectedTerm]);

  const fetchCompletionStatus = async () => {
    try {
      const res = await api.get(`/marks/completion?classId=${selectedClass}&subjectId=${selectedSubject}&termId=${selectedTerm}`);
      setCompletionData(res.data);
    } catch (error) {
      console.error("Failed to fetch completion status", error);
    }
  };

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [classesRes, termsRes] = await Promise.all([
        api.get('/classes?myClasses=true'),
        api.get('/terms')
      ]);
      setClasses(classesRes.data);
      setTerms(termsRes.data);
      
      if (termsRes.data.length > 0) setSelectedTerm(termsRes.data[0].id);
    } catch (error) {
      console.error("Failed to fetch initial data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubjects = async (classId: string) => {
    try {
      const response = await api.get(`/subjects?classId=${classId}&mySubjects=true`);
      setSubjects(response.data);
    } catch (error) {
      console.error("Failed to fetch subjects", error);
    }
  };

  const fetchStudents = async (classId: string) => {
    try {
      const response = await api.get(`/students?classId=${classId}`);
      setStudents(response.data);
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

  const fetchExistingMarks = async () => {
    try {
      const response = await api.get(`/marks?studentId=${selectedStudent.id}&subjectId=${selectedSubject}&termId=${selectedTerm}`);
      setMarks(response.data);
    } catch (error) {
      console.error("Failed to fetch marks", error);
    }
  };

  const getMarkValue = (type: string, num: number = 0) => {
    const mark = marks.find(m => m.markType === type && m.assessmentNumber === num);
    return mark?.score ?? "";
  };

  const handleSaveMark = async (type: string, num: number, value: string) => {
    const score = parseFloat(value);
    if (isNaN(score)) return;

    const endpoint = type === 'ASSESSMENT' ? '/marks/assessment' : '/marks/end-of-term';
    const payload = {
      studentId: selectedStudent.id,
      subjectId: selectedSubject,
      termId: selectedTerm,
      score,
      assessmentNumber: num,
      isDraft: true
    };

    try {
      setIsSaving(true);
      await api.post(endpoint, payload);
      fetchExistingMarks();
      fetchCompletionStatus();
    } catch (error) {
      console.error("Failed to save mark", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!selectedStudent || !selectedTerm) return;
    try {
      setIsSaving(true);
      await api.post('/marks/finalize', {
        studentId: selectedStudent.id,
        termId: selectedTerm
      });
      alert('Marks finalized successfully!');
    } catch (err) {
      console.error('Finalize failed', err);
    } finally {
      setIsSaving(false);
    }
  };

  const assessmentTotal = [1,2,3,4,5,6].reduce((sum, n) => sum + (parseFloat(getMarkValue('ASSESSMENT', n)) || 0), 0);
  const examScore = parseFloat(getMarkValue('END_OF_TERM')) || 0;
  const total = assessmentTotal + examScore;

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 flex flex-wrap gap-6 items-end sticky top-0 z-20 backdrop-blur-md bg-white/80">
        <div className="flex-1 min-w-[200px]">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Academic Term</Label>
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="rounded-xl h-12 border-slate-200">
              <SelectValue placeholder="Select Term" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {terms.map(t => (
                <SelectItem key={t.id} value={t.id}>
                  Term {t.termNumber} — {t.academicYear?.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Class</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="rounded-xl h-12 border-slate-200">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Subject</Label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="rounded-xl h-12 border-slate-200">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden min-h-[600px]">
        {/* Left Panel: Student List */}
        <div className="w-80 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-50 font-bold text-slate-900 flex justify-between items-center bg-slate-50/30">
            <span>Students ({students.length})</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {students.map(s => {
              const completion = completionData.find(c => c.studentId === s.id);
              const colorClass = completion?.isComplete 
                ? 'bg-emerald-500' 
                : (completion?.assessmentsEntered > 0 || completion?.endOfTermEntered) 
                  ? 'bg-amber-500' 
                  : 'bg-slate-200';

              return (
                <div 
                  key={s.id} 
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 flex justify-between items-center group ${selectedStudent?.id === s.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-slate-50 text-slate-600'}`}
                  onClick={() => setSelectedStudent(s)}
                >
                  <div>
                    <div className="font-bold">{s.firstName} {s.lastName}</div>
                    <div className={`text-[10px] uppercase font-bold tracking-widest ${selectedStudent?.id === s.id ? 'text-white/60' : 'text-slate-400'}`}>{s.admissionNumber}</div>
                  </div>
                  <div className={`h-2 w-2 rounded-full ${selectedStudent?.id === s.id ? 'bg-white' : colorClass}`} />
                </div>
              );
            })}
            {students.length === 0 && <div className="text-center py-10 text-slate-400 italic">Select a class first</div>}
          </div>
        </div>

        {/* Right Panel: Marks Entry */}
        <div className="flex-1 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 overflow-y-auto">
          {selectedStudent && selectedSubject ? (
            <div className="space-y-10 animate-in slide-in-from-right duration-500">
              <div className="flex justify-between items-start border-b border-slate-50 pb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                  <p className="text-slate-500 font-medium mt-1">Student ID: {selectedStudent.admissionNumber} | Standard {selectedStudent.class?.name}</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-none text-sm px-4 py-1.5 rounded-full font-bold">
                  {subjects.find(s => s.id === selectedSubject)?.name}
                </Badge>
              </div>

              <div className="space-y-12">
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <div className="h-8 w-1 bg-primary rounded-full" />
                      Continuous Assessments (30%)
                    </h3>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Max 5 pts each</span>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3,4,5,6].map(num => (
                      <div key={num} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Assessment {num}</Label>
                        <div className="flex items-center gap-3">
                          <Input 
                            type="number" 
                            max="5" 
                            min="0" 
                            className="h-12 rounded-xl text-center font-bold text-lg border-slate-200 focus:ring-primary" 
                            value={getMarkValue('ASSESSMENT', num)}
                            onChange={(e) => handleSaveMark('ASSESSMENT', num, e.target.value)}
                          />
                          <span className="text-slate-400 font-bold">/ 5</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 p-6 bg-slate-900 rounded-3xl flex justify-between items-center text-white">
                    <span className="font-bold text-slate-400">Total Assessment Score</span>
                    <span className="text-2xl font-black text-primary">{assessmentTotal} / 30</span>
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <div className="h-8 w-1 bg-emerald-500 rounded-full" />
                      End of Term Exam (70%)
                    </h3>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Max 70 pts</span>
                  </div>
                  
                  <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-emerald-600 uppercase">Final Exam Score</Label>
                      <div className="flex items-center gap-4">
                        <Input 
                          type="number" 
                          max="70" 
                          min="0" 
                          className="h-14 w-28 rounded-xl text-center font-black text-2xl border-emerald-200 focus:ring-emerald-500 text-emerald-700" 
                          value={getMarkValue('END_OF_TERM')}
                          onChange={(e) => handleSaveMark('END_OF_TERM', 0, e.target.value)}
                        />
                        <span className="text-emerald-400 font-black text-xl">/ 70</span>
                      </div>
                    </div>
                    {isSaving && <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />}
                  </div>
                </section>

                <div className="pt-10 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-white p-10 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-8 border">
                  <div className="flex items-center gap-6">
                    <div className={`h-20 w-20 rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-2xl ${total >= 50 ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-red-500 text-white shadow-red-200'}`}>
                      {total}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Final Result (100%)</div>
                      <div className={`text-2xl font-black ${total >= 50 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {total >= 81 ? 'Excellent' : total >= 71 ? 'Very Good' : total >= 50 ? 'Good' : 'Need Support'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {selectedStudent && selectedTerm && (
                      <Link href={`/results/${selectedStudent.id}?termId=${selectedTerm}`}>
                        <Button variant="outline" className="h-14 px-8 rounded-2xl font-bold border-slate-200 hover:bg-slate-50">
                          View Result Sheet →
                        </Button>
                      </Link>
                    )}
                    <Button variant="outline" className="h-14 px-8 rounded-2xl font-bold border-slate-200 hover:bg-slate-50">
                      <Save className="mr-2 h-5 w-5" /> Save Draft
                    </Button>
                    <Button onClick={handleFinalize} disabled={isSaving} className="h-14 px-8 rounded-2xl font-bold bg-primary shadow-xl shadow-primary/20">
                      {isSaving
                        ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Finalizing...</>
                        : <><CheckCircle2 className="mr-2 h-5 w-5" /> Finalize Marks</>
                      }
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <div className="bg-slate-100 p-8 rounded-full">
                <AlertCircle className="h-12 w-12 text-slate-300" />
              </div>
              <p className="text-xl font-bold">Please select a student and subject to begin</p>
              <p className="text-sm">Marks are automatically saved as you type.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
