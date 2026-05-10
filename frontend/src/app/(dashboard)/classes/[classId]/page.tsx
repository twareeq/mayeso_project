"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, ArrowLeft, Users, School, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditClassPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;

  const [cls, setCls] = useState<any>(null);
  const [levels, setLevels] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    standard: "",
    stream: "",
    levelId: "",
    responsibleTeacherId: ""
  });

  useEffect(() => {
    if (classId) {
      fetchData();
    }
  }, [classId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [classRes, levelsRes, usersRes] = await Promise.all([
        api.get(`/classes/${classId}`),
        api.get('/levels'),
        api.get('/users')
      ]);
      
      const classData = classRes.data;
      setCls(classData);
      setLevels(levelsRes.data);
      setTeachers(usersRes.data.filter((u: any) => u.role === 'TEACHER'));
      
      setFormData({
        name: classData.name,
        standard: classData.standard.toString(),
        stream: classData.stream || "",
        levelId: classData.levelId,
        responsibleTeacherId: classData.responsibleTeacherId || "unassigned"
      });
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.patch(`/classes/${classId}`, {
        ...formData,
        responsibleTeacherId: formData.responsibleTeacherId === "unassigned" ? null : formData.responsibleTeacherId
      });
      alert("Class updated successfully!");
      router.push('/classes');
    } catch (error) {
      console.error("Failed to update class", error);
      alert("Error updating class.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Class: {cls?.name}</h1>
          <p className="text-slate-500">Update academic division and teacher assignment.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <School className="h-5 w-5 text-primary" />
                Class Details
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Display Name</Label>
                <Input 
                  required 
                  className="h-12 rounded-xl border-slate-200" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Standard</Label>
                  <Input 
                    type="number"
                    required 
                    className="h-12 rounded-xl border-slate-200" 
                    value={formData.standard}
                    onChange={(e) => setFormData({...formData, standard: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Stream</Label>
                  <Input 
                    className="h-12 rounded-xl border-slate-200" 
                    value={formData.stream}
                    onChange={(e) => setFormData({...formData, stream: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Academic Level</Label>
                <Select value={formData.levelId} onValueChange={(v) => setFormData({...formData, levelId: v})}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200">
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {levels.map(l => (
                      <SelectItem key={l.id} value={l.id}>{l.name} ({l.school?.name})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <Users className="h-5 w-5 text-emerald-500" />
                Class Teacher Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Responsible Teacher</Label>
                <Select value={formData.responsibleTeacherId} onValueChange={(v) => setFormData({...formData, responsibleTeacherId: v})}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200">
                    <SelectValue placeholder="Assign a Teacher" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {teachers.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-sm text-emerald-700">
                <p>The class teacher will be responsible for finalizing marks and student reports for this class.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-slate-900 text-white overflow-hidden">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Class Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-xs font-bold text-slate-400 uppercase">Students</p>
                  <p className="text-2xl font-black">{cls?._count?.students || 0}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-xs font-bold text-slate-400 uppercase">Subjects</p>
                  <p className="text-2xl font-black">{cls?._count?.subjects || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button 
              type="submit" 
              disabled={isSaving}
              className="h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/30 w-full"
            >
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              Save Changes
            </Button>
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => router.back()}
              className="h-14 rounded-2xl border-slate-200 font-bold w-full text-slate-600"
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
