"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus, ArrowLeft, Search, CheckCircle2, UserCheck, User, Sparkles, School } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterStudentPage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <RegisterStudentForm />
    </Suspense>
  );
}

function RegisterStudentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClassId = searchParams.get('classId');
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isExisting, setIsExisting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    parentName: "",
    parentPhone: "",
    classId: preselectedClassId || ""
  });

  useEffect(() => {
    api.get('/classes')
      .then(r => setClasses(r.data))
      .catch(console.error)
      .finally(() => setIsLoadingClasses(false));
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const delayDebounceFn = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    try {
      setIsSearching(true);
      const res = await api.get(`/students?search=${searchQuery}`);
      setSearchResults(res.data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectExistingStudent = (student: any) => {
    setSelectedStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : "",
      parentName: student.parentName || "",
      parentPhone: student.parentPhone || "",
      classId: preselectedClassId || student.classId
    });
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      
      let dateOfBirth = null;
      if (formData.dateOfBirth) {
        const d = new Date(formData.dateOfBirth);
        if (!isNaN(d.getTime())) {
          dateOfBirth = d.toISOString();
        }
      }

      const payload = {
        ...formData,
        dateOfBirth
      };

      if (isExisting && selectedStudent) {
        await api.patch(`/students/${selectedStudent.id}`, payload);
        alert(`Student enrollment updated successfully!`);
      } else {
        const res = await api.post('/students', payload);
        alert(`Student registered successfully! \nAdmission No: ${res.data.admissionNumber}`);
      }
      router.push('/students');
    } catch (error: any) {
      console.error("Failed to save student", error);
      const msg = error.response?.data?.message || error.response?.data?.error || "Unknown error";
      alert(`Error saving student: ${msg}\n\nPlease check the console for more details.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white shadow-sm border border-slate-100 hover:bg-slate-50 transition-all">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Enrollment</span>
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {isExisting ? "Enroll Existing Student" : "Register New Student"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-[1.5rem] border border-slate-200 shadow-xl shadow-slate-200/40">
          <Button 
            type="button"
            variant={!isExisting ? "default" : "ghost"} 
            size="sm"
            className={`rounded-2xl px-6 h-11 font-bold transition-all ${!isExisting ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-slate-500 hover:bg-slate-50'}`}
            onClick={() => {
              setIsExisting(false);
              setSelectedStudent(null);
            }}
          >
            <UserPlus className="h-4 w-4 mr-2" /> New Student
          </Button>
          <Button 
            type="button"
            variant={isExisting ? "default" : "ghost"} 
            size="sm"
            className={`rounded-2xl px-6 h-11 font-bold transition-all ${isExisting ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-slate-500 hover:bg-slate-50'}`}
            onClick={() => setIsExisting(true)}
          >
            <UserCheck className="h-4 w-4 mr-2" /> Existing Student
          </Button>
        </div>
      </div>

      {isExisting && !selectedStudent && (
        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/60 bg-white p-2 overflow-hidden animate-in slide-in-from-top-4 duration-500">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <Search className="h-5 w-5 text-primary" />
              Search Registry
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Search by Name or Admission Number</Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-slate-300 group-focus-within:text-primary transition-colors" />
                </div>
                <Input 
                  className="h-16 pl-14 rounded-[1.25rem] border-slate-100 bg-slate-50/50 text-xl font-medium focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none" 
                  placeholder="Type at least 3 characters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {isSearching && (
                  <div className="absolute inset-y-0 right-5 flex items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="grid gap-4 mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {searchResults.map(s => (
                  <div 
                    key={s.id} 
                    className="flex items-center justify-between p-6 bg-white rounded-[1.5rem] border border-slate-100 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 cursor-pointer transition-all group"
                    onClick={() => selectExistingStudent(s)}
                  >
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <User className="h-7 w-7" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-lg">{s.firstName} {s.lastName}</div>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mt-0.5">
                          <span className="text-primary/60">{s.admissionNumber}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-200" />
                          <span>Standard {s.class?.name}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-200" />
                          <span>{s.class?.level?.school?.name}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl font-black uppercase tracking-tighter text-xs px-6 h-10 border-slate-200 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">Select Profile</Button>
                  </div>
                ))}
              </div>
            )}
            
            {searchQuery.length > 2 && !isSearching && searchResults.length === 0 && (
              <div className="p-12 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                <User className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">No students found matching &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(!isExisting || selectedStudent) && (
        <form onSubmit={handleSave} className="space-y-8 animate-in zoom-in-95 duration-500">
          {selectedStudent && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-[1.5rem] flex items-center justify-between shadow-lg shadow-emerald-500/5">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-emerald-900 font-black">Syncing existing profile</div>
                  <div className="text-emerald-700/70 text-sm font-bold">{selectedStudent.firstName} {selectedStudent.lastName} • {selectedStudent.admissionNumber}</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-emerald-700 font-black hover:bg-emerald-500/10 rounded-xl" onClick={() => setSelectedStudent(null)}>Cancel Sync</Button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Info */}
              <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/60 overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-xl font-black flex items-center gap-3">
                    <div className="h-8 w-1 bg-primary rounded-full" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">First Name</Label>
                      <Input 
                        required 
                        className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all" 
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Name</Label>
                      <Input 
                        required 
                        className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all" 
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Gender</Label>
                      <Select value={formData.gender} onValueChange={(v) => setFormData({...formData, gender: v})}>
                        <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                          <SelectItem value="MALE" className="rounded-xl my-1 font-bold">Male</SelectItem>
                          <SelectItem value="FEMALE" className="rounded-xl my-1 font-bold">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Date of Birth</Label>
                      <Input 
                        type="date" 
                        required 
                        className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all" 
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parent Info */}
              <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/60 overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-xl font-black flex items-center gap-3">
                    <div className="h-8 w-1 bg-emerald-500 rounded-full" />
                    Parent/Guardian Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Parent/Guardian Name</Label>
                      <Input 
                        required 
                        className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all" 
                        value={formData.parentName}
                        onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</Label>
                      <Input 
                        required 
                        className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all" 
                        value={formData.parentPhone}
                        onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              {/* Academic Assignment */}
              <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-900/40 bg-slate-900 text-white overflow-hidden sticky top-8">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-xl font-black flex items-center gap-3">
                    <div className="h-8 w-1 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                    Academic Class
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-8">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assign to Class</Label>
                      <Select 
                        value={formData.classId} 
                        onValueChange={(v) => setFormData({...formData, classId: v})}
                      >
                        <SelectTrigger className="h-14 rounded-2xl border-white/10 bg-white/5 font-bold focus:ring-4 focus:ring-primary/20 transition-all text-white">
                          <SelectValue placeholder={isLoadingClasses ? "Fetching registry..." : "Select Target Class"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-white/10 bg-slate-800 text-white shadow-2xl">
                          {classes.map(c => (
                            <SelectItem key={c.id} value={c.id} className="rounded-xl my-1 font-bold hover:bg-white/10 focus:bg-white/10 focus:text-white">
                              {c.name.startsWith('Standard') ? '' : 'Standard '}{c.name} ({c.level?.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="p-6 bg-white/5 rounded-[1.5rem] border border-white/5 text-xs text-slate-400 leading-relaxed font-medium">
                      <p>
                        {isExisting 
                          ? "Enrolling an existing student will update their current class assignment. If they change schools, a new admission number will be generated automatically." 
                          : "Assigning a student to a class will automatically generate their unique admission number based on school sequence."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 space-y-4">
                    <Button 
                      type="submit" 
                      disabled={isSaving}
                      className="h-16 rounded-[1.25rem] bg-primary text-white font-black text-lg shadow-2xl shadow-primary/40 w-full hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                    >
                      {isSaving ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <UserPlus className="mr-2 h-6 w-6" />}
                      {isExisting ? "Complete Enrollment" : "Finish Registration"}
                    </Button>
                    <Button 
                      variant="ghost" 
                      type="button" 
                      onClick={() => router.back()}
                      className="h-14 rounded-[1.25rem] text-slate-400 font-bold w-full hover:bg-white/5 hover:text-white transition-all"
                    >
                      Cancel Action
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
