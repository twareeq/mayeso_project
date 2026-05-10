"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Eye, Loader2, ClipboardList, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ResultsIndexPage() {
  const [results, setResults] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("all");

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [selectedTerm, selectedClass]);

  const fetchInitialData = async () => {
    try {
      const [termsRes, classesRes] = await Promise.all([
        api.get('/terms'),
        api.get('/classes')
      ]);
      setTerms(termsRes.data);
      setClasses(classesRes.data);
      
      const currentTerm = termsRes.data.find((t: any) => t.isCurrent);
      if (currentTerm) {
        setSelectedTerm(currentTerm.id);
      } else if (termsRes.data.length > 0) {
        setSelectedTerm(termsRes.data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch filters", error);
    }
  };

  const fetchResults = async () => {
    if (!selectedTerm) return;
    try {
      setIsLoading(true);
      let url = `/results?termId=${selectedTerm}`;
      if (selectedClass !== "all") {
        url += `&classId=${selectedClass}`;
      }
      const response = await api.get(url);
      setResults(response.data);
    } catch (error) {
      console.error("Failed to fetch results", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResults = results.filter(r => 
    `${r.student.firstName} ${r.student.lastName} ${r.student.admissionNumber}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Academic Results</h1>
          <p className="text-slate-500 mt-2">View and manage student performance across terms.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search students..."
              className="pl-10 h-11 bg-white border-slate-200 rounded-xl focus:ring-primary focus:border-primary transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Filters</span>
            </div>
            
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger className="w-[180px] h-11 bg-white border-slate-200 rounded-xl">
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map((term) => (
                  <SelectItem key={term.id} value={term.id}>
                    Term {term.termNumber} ({term.academicYear?.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[180px] h-11 bg-white border-slate-200 rounded-xl">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    Standard {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="py-5 px-6 font-semibold text-slate-700">Student</TableHead>
              <TableHead className="font-semibold text-slate-700">Admission No.</TableHead>
              <TableHead className="font-semibold text-slate-700">Class</TableHead>
              <TableHead className="font-semibold text-slate-700 text-center">Score</TableHead>
              <TableHead className="font-semibold text-slate-700 text-center">Grade</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="text-right px-6 font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm font-medium">Loading results...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredResults.map((res) => (
              <TableRow key={res.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                <TableCell className="py-4 px-6">
                  <span className="font-bold text-slate-900">{res.student.firstName} {res.student.lastName}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded border">
                    {res.student.admissionNumber}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-slate-700">Standard {res.student.class?.name}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-black text-primary">{Math.round(res.totalScore)}%</span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="font-bold border-slate-200">
                    {res.overallGrade}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`${res.isPassing ? 'bg-emerald-500 shadow-emerald-100' : 'bg-red-500 shadow-red-100'} text-white border-none`}>
                    {res.isPassing ? 'PASS' : 'FAIL'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right px-6">
                  <Link href={`/results/${res.student.id}?termId=${selectedTerm}`}>
                    <Button variant="ghost" size="sm" className="rounded-lg hover:bg-primary/5 text-primary font-bold transition-all">
                      <Eye className="h-4 w-4 mr-2" /> View Sheet
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && filteredResults.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center text-slate-400 font-medium italic">
                  No results found for the selected criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
