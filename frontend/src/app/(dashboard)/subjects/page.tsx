"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Book, Trash2, Edit2, Loader2, Code } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: "",
    code: "",
    classId: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [subjectsRes, classesRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/classes')
      ]);
      setSubjects(subjectsRes.data);
      setClasses(classesRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubject = async () => {
    if (!newSubject.name || !newSubject.classId) return;
    try {
      setIsSaving(true);
      await api.post('/subjects', newSubject);
      setNewSubject({ name: "", code: "", classId: "" });
      setIsSheetOpen(false);
      fetchData();
    } catch (error) {
      console.error("Failed to create subject", error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Subjects</h1>
          <p className="text-slate-500 mt-2">Curriculum management and subject-class mappings.</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="rounded-xl px-6 h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105">
              <Plus className="mr-2 h-5 w-5" /> Add Subject
            </Button>
          </SheetTrigger>
          <SheetContent className="rounded-l-3xl sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold">New Curriculum Subject</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 py-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-semibold">Subject Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Mathematics" 
                  className="rounded-xl h-12"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="code" className="text-sm font-semibold">Subject Code</Label>
                <Input 
                  id="code" 
                  placeholder="e.g., MTH" 
                  className="rounded-xl h-12"
                  value={newSubject.code}
                  onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Assigned Class</Label>
                <Select value={newSubject.classId} onValueChange={(val) => setNewSubject({ ...newSubject, classId: val })}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full h-14 rounded-xl mt-4 shadow-lg font-bold"
                onClick={handleCreateSubject}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Subject
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search by name or code..."
              className="pl-10 h-11 bg-white border-slate-200 rounded-xl focus:ring-primary focus:border-primary transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="py-5 px-6 font-semibold text-slate-700">Subject Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Code</TableHead>
              <TableHead className="font-semibold text-slate-700">Class</TableHead>
              <TableHead className="font-semibold text-slate-700">School</TableHead>
              <TableHead className="font-semibold text-slate-700">Created At</TableHead>
              <TableHead className="text-right px-6 font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm font-medium">Loading subjects...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredSubjects.map((subject) => (
              <TableRow key={subject.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                      <Book className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-slate-900">{subject.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded border">
                    {subject.code || "N/A"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-slate-700">Standard {subject.class?.name}</span>
                </TableCell>
                <TableCell className="text-slate-500 text-sm">{subject.class?.level?.school?.name || "Global"}</TableCell>
                <TableCell className="text-slate-500 text-sm">{new Date(subject.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right px-6">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white hover:shadow-md text-slate-400 hover:text-primary transition-all">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white hover:shadow-md text-slate-400 hover:text-red-500 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
