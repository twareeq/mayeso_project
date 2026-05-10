"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { GraduationCap, Users, Building2, Map, TrendingUp, ArrowUpRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/analytics/overview');
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setIsLoading(false);
    }
  };

  const dashboardStats = [
    { name: 'Total Students', value: stats?.students || 0, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+12%' },
    { name: 'Teachers', value: stats?.teachers || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: '+3%' },
    { name: 'Schools', value: stats?.schools || 0, icon: Building2, color: 'text-orange-600', bg: 'bg-orange-100', trend: '+2' },
    { name: 'Zones', value: stats?.zones || 0, icon: Map, color: 'text-purple-600', bg: 'bg-purple-100', trend: 'Active' },
  ];

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 font-medium text-lg">Live platform insights and quick actions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.name} className="border-none shadow-xl shadow-slate-200/60 rounded-[2rem] hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.name}</CardTitle>
              <div className={`${stat.bg} p-2 rounded-xl`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
              <div className="flex items-center mt-2 gap-1">
                <span className="text-emerald-500 text-xs font-bold flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.trend}
                </span>
                <span className="text-slate-400 text-[10px] font-medium uppercase">this term</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-xl shadow-slate-200/60 rounded-[2.5rem] bg-white p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Platform Activity</h2>
            <Button variant="ghost" size="sm" className="rounded-full h-10 px-4 text-primary font-bold">
              Details <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="h-64 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 flex items-center justify-center">
            <p className="text-slate-400 italic">Activity Chart Connected to API</p>
          </div>
        </Card>

        <Card className="border-none shadow-xl shadow-slate-200/60 rounded-[2.5rem] bg-gradient-to-br from-primary to-indigo-600 p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-4">Quick Actions</h2>
            <p className="text-white/80 mb-8 font-medium">Streamline your school workflow and generate student results.</p>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/reports">
                <Button className="w-full bg-white/20 hover:bg-white/30 border-none text-white rounded-2xl h-14 font-bold backdrop-blur-md">
                  View Reports
                </Button>
              </Link>
              <Link href="/marks">
                <Button className="w-full bg-white text-primary hover:bg-white/90 border-none rounded-2xl h-14 font-bold shadow-xl">
                  Enter Marks
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 h-64 w-64 bg-white/10 rounded-full blur-3xl"></div>
        </Card>
      </div>
    </div>
  );
}
