"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  ArrowLeft, 
  Edit, 
  ClipboardList, 
  Loader2,
  Clock,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;
  
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchStudent();
    }
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/students/${studentId}`);
      setStudent(response.data);
    } catch (error) {
      console.error("Failed to fetch student profile", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );

  if (!student) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
      <h2 className="text-2xl font-bold">Student not found</h2>
      <Button onClick={() => router.back()}>Go Back</Button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="rounded-xl text-slate-500 hover:text-primary transition-all"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Students
        </Button>
        <div className="flex gap-3">
          <Link href={`/results?studentId=${studentId}`}>
            <Button variant="outline" className="rounded-xl border-slate-200">
              <ClipboardList className="mr-2 h-4 w-4" /> View Results
            </Button>
          </Link>
          <Button className="rounded-xl bg-primary shadow-lg shadow-primary/20 transition-all hover:scale-105">
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="lg:col-span-1 rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="h-32 bg-primary relative">
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
              <div className="h-32 w-32 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-slate-400 shadow-xl overflow-hidden">
                {student.profilePhoto ? (
                  <img src={student.profilePhoto} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-16 w-16" />
                )}
              </div>
            </div>
          </div>
          <CardContent className="pt-20 pb-10 text-center space-y-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">{student.firstName} {student.lastName}</h2>
              <p className="text-slate-500 font-mono text-sm mt-1">{student.admissionNumber}</p>
            </div>
            <div className="flex justify-center gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold">
                {student.status || 'ACTIVE'}
              </Badge>
              <Badge variant="outline" className="border-slate-200 font-bold">
                {student.gender}
              </Badge>
            </div>
            <div className="pt-6 border-t border-slate-50 space-y-3 text-left px-4">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-2 bg-slate-50 rounded-lg"><GraduationCap className="h-4 w-4" /></div>
                <span className="text-sm font-medium">Standard {student.class?.name}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-2 bg-slate-50 rounded-lg"><Calendar className="h-4 w-4" /></div>
                <span className="text-sm font-medium">Joined {student.enrolledAt ? format(new Date(student.enrolledAt), 'MMMM yyyy') : 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                <p className="font-bold text-slate-700">{student.firstName} {student.lastName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Gender</p>
                <p className="font-bold text-slate-700">{student.gender}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Date of Birth</p>
                <p className="font-bold text-slate-700">{student.dateOfBirth ? format(new Date(student.dateOfBirth), 'PPP') : 'Not specified'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Admission No.</p>
                <p className="font-bold text-slate-700">{student.admissionNumber}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                Guardian & Contact Info
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Parent/Guardian Name</p>
                <p className="font-bold text-slate-700">{student.parentName || student.guardianName || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Contact Phone</p>
                <p className="font-bold text-slate-700">{student.parentPhone || 'N/A'}</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Residential Address</p>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                  <p className="font-bold text-slate-700">{student.address || 'Address not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-slate-900 text-white">
            <CardContent className="p-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white/60">Registered By</p>
                  <p className="text-lg font-bold">{student.createdBy?.fullName || 'System'}</p>
                </div>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white/60">Enrollment Date</p>
                <p className="text-lg font-bold">{student.enrolledAt ? format(new Date(student.enrolledAt), 'PP') : 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
