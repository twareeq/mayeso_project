"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Plus, User, Eye, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (error) {
      console.error("Failed to fetch students", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) || 
    s.admissionNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Students</h1>
          <p className="text-slate-500 mt-2">Manage student records and academic profiles.</p>
        </div>
        <Link href="/students/new">
          <Button className="rounded-xl px-6 h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105">
            <Plus className="mr-2 h-5 w-5" /> Register Student
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search by name or admission no..."
              className="pl-10 h-11 bg-white border-slate-200 rounded-xl focus:ring-primary focus:border-primary transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="py-5 px-6 font-semibold text-slate-700">Student Info</TableHead>
              <TableHead className="font-semibold text-slate-700">Admission No.</TableHead>
              <TableHead className="font-semibold text-slate-700">Gender</TableHead>
              <TableHead className="font-semibold text-slate-700">Class</TableHead>
              <TableHead className="font-semibold text-slate-700">Parent/Guardian</TableHead>
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
                    <p className="text-sm font-medium">Loading student list...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredStudents.map((student) => (
              <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden">
                      {student.profilePhoto ? (
                        <img src={student.profilePhoto} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <span className="font-bold text-slate-900">{student.firstName} {student.lastName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded border">
                    {student.admissionNumber}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`text-xs font-bold ${student.gender === 'MALE' ? 'text-blue-500' : 'text-pink-500'}`}>
                    {student.gender}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-slate-700">Standard {student.class?.name}</span>
                </TableCell>
                <TableCell className="text-slate-600 text-sm">
                  {student.guardianName || student.parentName || "Not set"}
                </TableCell>
                <TableCell>
                  <Badge className="bg-emerald-500 text-white border-none shadow-md shadow-emerald-100">
                    {student.status || 'Active'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right px-6">
                  <Link href={`/students/${student.id}`}>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white hover:shadow-md text-slate-400 hover:text-primary transition-all">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && filteredStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center text-slate-400 font-medium italic">
                  No students matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
