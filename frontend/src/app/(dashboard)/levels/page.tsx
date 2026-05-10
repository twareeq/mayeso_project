"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Layers, Edit2, Loader2, School } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LevelsPage() {
  const [levels, setLevels] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [newLevel, setNewLevel] = useState({
    name: "",
    type: "LOW",
    schoolId: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [levelsRes, schoolsRes] = await Promise.all([
        api.get('/levels'),
        api.get('/schools')
      ]);
      setLevels(levelsRes.data);
      setSchools(schoolsRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLevel = async () => {
    if (!newLevel.name || !newLevel.schoolId) return;
    try {
      setIsSaving(true);
      await api.post('/levels', newLevel);
      setNewLevel({ name: "", type: "LOW", schoolId: "" });
      setIsSheetOpen(false);
      fetchData();
    } catch (error) {
      console.error("Failed to create level", error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredLevels = levels.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.school?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Academic Levels</h1>
          <p className="text-slate-500 mt-2">Define primary, senior, and junior level classifications.</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="rounded-xl px-6 h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105">
              <Plus className="mr-2 h-5 w-5" /> Create Level
            </Button>
          </SheetTrigger>
          <SheetContent className="rounded-l-3xl sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold">New Academic Level</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 py-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-semibold">Level Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Senior Level" 
                  className="rounded-xl h-12"
                  value={newLevel.name}
                  onChange={(e) => setNewLevel({ ...newLevel, name: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Classification Type</Label>
                <Select value={newLevel.type} onValueChange={(val) => setNewLevel({ ...newLevel, type: val })}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="LOW">Low Level (Standard 1-4)</SelectItem>
                    <SelectItem value="SENIOR">Senior Level (Standard 5-8)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Assigned School</Label>
                <Select value={newLevel.schoolId} onValueChange={(val) => setNewLevel({ ...newLevel, schoolId: val })}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Select School" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {schools.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full h-14 rounded-xl mt-4 shadow-lg font-bold"
                onClick={handleCreateLevel}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Level
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
              placeholder="Search levels or schools..."
              className="pl-10 h-11 bg-white border-slate-200 rounded-xl focus:ring-primary focus:border-primary transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="py-5 px-6 font-semibold text-slate-700">Level Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Type</TableHead>
              <TableHead className="font-semibold text-slate-700">School</TableHead>
              <TableHead className="font-semibold text-slate-700">Classes Count</TableHead>
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
                    <p className="text-sm font-medium">Loading levels...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredLevels.map((level) => (
              <TableRow key={level.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                      <Layers className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-slate-900">{level.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${level.type === 'SENIOR' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                    {level.type}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-700">{level.school?.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-bold text-slate-500">{level._count?.classes || 0} classes</TableCell>
                <TableCell className="text-slate-500 text-sm">{new Date(level.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right px-6">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white hover:shadow-md text-slate-400 hover:text-primary transition-all">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
