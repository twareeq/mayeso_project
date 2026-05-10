"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Users, School, Edit2, Trash2, Loader2, BookOpen, UserPlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    name: "",
    standard: "",
    stream: "",
    levelId: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [classesRes, levelsRes] = await Promise.all([
        api.get('/classes'),
        api.get('/levels')
      ]);
      setClasses(classesRes.data);
      setLevels(levelsRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!newClass.name || !newClass.levelId) return;
    try {
      setIsSaving(true);
      await api.post('/classes', {
        ...newClass,
        standard: parseInt(newClass.standard)
      });
      setNewClass({ name: "", standard: "", stream: "", levelId: "" });
      setIsSheetOpen(false);
      fetchData();
    } catch (error) {
      console.error("Failed to create class", error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.level?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Classes</h1>
          <p className="text-slate-500 mt-2">Manage academic divisions and class teacher assignments.</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="rounded-xl px-6 h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105">
              <Plus className="mr-2 h-5 w-5" /> Create Class
            </Button>
          </SheetTrigger>
          <SheetContent className="rounded-l-3xl sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold">New Academic Class</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 py-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-semibold">Display Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Standard 8B" 
                  className="rounded-xl h-12"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="standard" className="text-sm font-semibold">Standard</Label>
                  <Input 
                    id="standard" 
                    type="number" 
                    placeholder="1-8" 
                    className="rounded-xl h-12"
                    value={newClass.standard}
                    onChange={(e) => setNewClass({ ...newClass, standard: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="stream" className="text-sm font-semibold">Stream</Label>
                  <Input 
                    id="stream" 
                    placeholder="A, B, Blue..." 
                    className="rounded-xl h-12"
                    value={newClass.stream}
                    onChange={(e) => setNewClass({ ...newClass, stream: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Level</Label>
                <Select value={newClass.levelId} onValueChange={(val) => setNewClass({ ...newClass, levelId: val })}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Select Academic Level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {levels.map(l => <SelectItem key={l.id} value={l.id}>{l.name} ({l.school?.name})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full h-14 rounded-xl mt-4 shadow-lg font-bold"
                onClick={handleCreateClass}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Class Assignment
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
              placeholder="Search classes or levels..."
              className="pl-10 h-11 bg-white border-slate-200 rounded-xl focus:ring-primary focus:border-primary transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="py-5 px-6 font-semibold text-slate-700">Class Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Level</TableHead>
              <TableHead className="font-semibold text-slate-700">Standard</TableHead>
              <TableHead className="font-semibold text-slate-700">Students</TableHead>
              <TableHead className="font-semibold text-slate-700">Teacher</TableHead>
              <TableHead className="text-right px-6 font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm font-medium">Loading classes...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredClasses.map((cls) => (
              <TableRow key={cls.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-slate-900">{cls.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium border border-slate-200">
                    {cls.level?.name}
                  </span>
                </TableCell>
                <TableCell className="font-bold text-slate-500">{cls.standard}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-700">{cls._count?.students || 0} enrolled</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600 text-sm italic">
                  {cls.responsibleTeacher?.fullName || "Unassigned"}
                </TableCell>
                <TableCell className="text-right px-6">
                  <div className="flex justify-end gap-2">
                    <Link href={`/students/new?classId=${cls.id}`}>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-emerald-50 text-emerald-500 transition-all" title="Enroll Student">
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/classes/${cls.id}`}>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white hover:shadow-md text-slate-400 hover:text-primary transition-all" title="Edit Class">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </Link>
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

const Save = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
