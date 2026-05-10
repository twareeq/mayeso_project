"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Printer, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ResultPage({ params }: { params: { studentId: string } }) {
  // Dummy data for visual
  const studentResult = {
    name: "John Banda",
    adminNo: "MPS-2025-0043",
    class: "Standard 8B",
    level: "Senior Level",
    school: "Mayeso Primary",
    term: "Term 1, 2025",
    totalScore: 84,
    grade: "Excellent",
    status: "Eligible to proceed",
    subjects: [
      { name: "Mathematics", scores: [4, 4, 4, 4, 4, 4], aTotal: 24, exam: 60, total: 84, grade: "Excellent" },
      { name: "English", scores: [3, 4, 3, 4, 3, 4], aTotal: 21, exam: 55, total: 76, grade: "Very Good" },
      { name: "Chichewa", scores: [5, 4, 5, 4, 5, 4], aTotal: 27, exam: 65, total: 92, grade: "Excellent" },
    ]
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold tracking-tight">Student Result</h1>
        <div className="space-x-4">
          <Button variant="outline"><Printer className="mr-2 h-4 w-4" /> Print</Button>
          <Button><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-8 shadow-sm space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{studentResult.name}</h2>
            <div className="text-muted-foreground font-mono mt-1">{studentResult.adminNo}</div>
            <div className="text-muted-foreground mt-2">
              {studentResult.class} | {studentResult.level} | {studentResult.school}
            </div>
            <div className="text-primary font-medium mt-1">{studentResult.term}</div>
          </div>
          <div className="text-right space-y-2">
            <div className="text-4xl font-bold text-primary">{studentResult.totalScore}%</div>
            <Badge variant="secondary" className="text-sm bg-secondary text-white">{studentResult.grade}</Badge>
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium text-secondary flex items-center gap-2">
              ✅ {studentResult.status}
            </span>
          </div>
          <Progress value={studentResult.totalScore} className="h-3" />
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>A1</TableHead>
              <TableHead>A2</TableHead>
              <TableHead>A3</TableHead>
              <TableHead>A4</TableHead>
              <TableHead>A5</TableHead>
              <TableHead>A6</TableHead>
              <TableHead>/30</TableHead>
              <TableHead>Exam</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Grade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentResult.subjects.map((sub, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{sub.name}</TableCell>
                {sub.scores.map((s, idx) => <TableCell key={idx}>{s}</TableCell>)}
                <TableCell className="font-medium">{sub.aTotal}</TableCell>
                <TableCell>{sub.exam}</TableCell>
                <TableCell className="font-bold text-primary">{sub.total}</TableCell>
                <TableCell>{sub.grade}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-card border rounded-lg p-6 space-y-4">
        <h3 className="font-medium">Teacher's Remarks</h3>
        <textarea 
          className="w-full min-h-[100px] p-3 rounded-md border bg-background text-sm"
          placeholder="Enter remarks here..."
          defaultValue="John is an exceptional student. Keep it up!"
        />
        <div className="flex justify-end">
          <Button>Save Remarks</Button>
        </div>
      </div>
    </div>
  );
}
