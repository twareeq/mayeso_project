"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Trash2, Edit2, Loader2, School as SchoolIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SchoolsPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: "",
    zoneId: "",
    phone: "",
    email: "",
    address: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [schoolsRes, zonesRes] = await Promise.all([
        api.get('/schools'),
        api.get('/zones')
      ]);
      setSchools(schoolsRes.data);
      setZones(zonesRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSchool = async () => {
    if (!newSchool.name || !newSchool.zoneId) return;
    try {
      setIsSaving(true);
      await api.post('/schools', newSchool);
      setNewSchool({ name: "", zoneId: "", phone: "", email: "", address: "" });
      setIsSheetOpen(false);
      fetchData();
    } catch (error) {
      console.error("Failed to create school", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSchool = async (id: string) => {
    if (!confirm("Are you sure you want to delete this school?")) return;
    try {
      await api.delete(`/schools/${id}`);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete school");
    }
  };

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.zone?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Schools</h1>
          <p className="text-slate-500 mt-2">Manage all educational institutions within the system.</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="rounded-xl px-6 h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105">
              <Plus className="mr-2 h-5 w-5" /> Add School
            </Button>
          </SheetTrigger>
          <SheetContent className="rounded-l-3xl sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold">Add New School</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 py-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-semibold">School Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Mayeso Primary School" 
                  className="rounded-xl h-12"
                  value={newSchool.name}
                  onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Zone</Label>
                <Select 
                  value={newSchool.zoneId} 
                  onValueChange={(val) => setNewSchool({ ...newSchool, zoneId: val })}
                >
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Select a Zone" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-semibold">Phone</Label>
                  <Input 
                    id="phone" 
                    placeholder="+265..." 
                    className="rounded-xl h-12"
                    value={newSchool.phone}
                    onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="school@mayeso.mw" 
                    className="rounded-xl h-12"
                    value={newSchool.email}
                    onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="address" className="text-sm font-semibold">Address</Label>
                <Input 
                  id="address" 
                  placeholder="Physical Address" 
                  className="rounded-xl h-12"
                  value={newSchool.address}
                  onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
                />
              </div>
              <Button 
                className="w-full h-12 rounded-xl mt-4 shadow-lg"
                onClick={handleCreateSchool}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save School
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
              placeholder="Search by name or zone..."
              className="pl-10 h-11 bg-white border-slate-200 rounded-xl focus:ring-primary focus:border-primary transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="py-5 px-6 font-semibold text-slate-700">School Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Zone</TableHead>
              <TableHead className="font-semibold text-slate-700">Contact</TableHead>
              <TableHead className="font-semibold text-slate-700">Staff Count</TableHead>
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
                    <p className="text-sm font-medium">Loading schools...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredSchools.map((school) => (
              <TableRow key={school.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                      <SchoolIcon className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-slate-900">{school.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                    {school.zone?.name}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs">
                    <span className="font-medium text-slate-700">{school.phone}</span>
                    <span className="text-slate-400">{school.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span className="font-medium text-slate-700">{school._count?.users || 0} users</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-500 text-sm">{new Date(school.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right px-6">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white hover:shadow-md text-slate-400 hover:text-primary transition-all">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-lg hover:bg-white hover:shadow-md text-slate-400 hover:text-red-500 transition-all"
                      onClick={() => handleDeleteSchool(school.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && filteredSchools.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-slate-400 font-medium italic">
                  No schools found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
