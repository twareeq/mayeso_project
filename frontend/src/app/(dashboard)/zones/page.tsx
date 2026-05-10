"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Trash2, Edit2, Loader2 } from "lucide-react";

export default function ZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [newZone, setNewZone] = useState({ name: "", region: "" });
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/zones');
      setZones(response.data);
    } catch (error) {
      console.error("Failed to fetch zones", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateZone = async () => {
    if (!newZone.name || !newZone.region) return;
    try {
      setIsSaving(true);
      await api.post('/zones', newZone);
      setNewZone({ name: "", region: "" });
      setIsSheetOpen(false);
      fetchZones();
    } catch (error) {
      console.error("Failed to create zone", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteZone = async (id: string) => {
    if (!confirm("Are you sure you want to delete this zone?")) return;
    try {
      await api.delete(`/zones/${id}`);
      fetchZones();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete zone");
    }
  };

  const filteredZones = zones.filter(z => 
    z.name.toLowerCase().includes(search.toLowerCase()) ||
    z.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Zones</h1>
          <p className="text-slate-500 mt-2">Manage education zones across the country.</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="rounded-xl px-6 h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105">
              <Plus className="mr-2 h-5 w-5" /> Create Zone
            </Button>
          </SheetTrigger>
          <SheetContent className="rounded-l-3xl">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold">Create New Zone</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 py-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-semibold">Zone Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Northern Zone" 
                  className="rounded-xl h-12" 
                  value={newZone.name}
                  onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="region" className="text-sm font-semibold">Region</Label>
                <Input 
                  id="region" 
                  placeholder="e.g., Northern Region" 
                  className="rounded-xl h-12" 
                  value={newZone.region}
                  onChange={(e) => setNewZone({ ...newZone, region: e.target.value })}
                />
              </div>
              <Button 
                className="w-full h-12 rounded-xl mt-4 shadow-lg" 
                onClick={handleCreateZone}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Zone
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
              placeholder="Quick search zones..."
              className="pl-10 h-11 bg-white border-slate-200 rounded-xl focus:ring-primary focus:border-primary transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-lg h-9 text-slate-500">Export PDF</Button>
            <Button variant="outline" size="sm" className="rounded-lg h-9 text-slate-500">Filter</Button>
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="py-5 px-6 font-semibold text-slate-700">Zone Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Region</TableHead>
              <TableHead className="font-semibold text-slate-700">Schools</TableHead>
              <TableHead className="font-semibold text-slate-700">Created At</TableHead>
              <TableHead className="text-right px-6 font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm font-medium">Loading zones...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredZones.map((zone) => (
              <TableRow key={zone.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                <TableCell className="py-4 px-6">
                  <span className="font-bold text-slate-900">{zone.name}</span>
                </TableCell>
                <TableCell>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                    {zone.region}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    <span className="font-medium text-slate-700">{zone._count?.schools || 0} schools</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-500">{new Date(zone.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right px-6">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white hover:shadow-md text-slate-400 hover:text-primary transition-all">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-lg hover:bg-white hover:shadow-md text-slate-400 hover:text-red-500 transition-all"
                      onClick={() => handleDeleteZone(zone.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && filteredZones.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center text-slate-400 font-medium italic">
                  No zones matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
