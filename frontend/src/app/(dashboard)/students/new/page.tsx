"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterStudentPage() {
  const router = useRouter();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy success
    alert("Student registered. Admission No: MPS-2025-0043");
    router.push('/students');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Register Student</h1>
        <p className="text-muted-foreground">Enter student details to enroll them into a class.</p>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <form onSubmit={handleSave} className="space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input required />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input required />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Input placeholder="MALE / FEMALE" required />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" required />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Parent/Guardian Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Parent Name</Label>
                <Input required />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input required />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Academic Assignment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Input placeholder="Select Class (e.g. Standard 8B)" required />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">Register Student</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
