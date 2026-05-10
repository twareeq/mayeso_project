import PDFDocument from 'pdfkit';
import { PrismaClient } from '@prisma/client';
import { Writable } from 'stream';

const prisma = new PrismaClient();

export async function generateStudentReportPDF(
  studentId: string,
  termId: string,
  stream: Writable
): Promise<void> {
  const result = await prisma.studentResult.findUnique({
    where: { studentId_termId: { studentId, termId } },
    include: {
      student: {
        include: { class: { include: { level: { include: { school: true } } } } }
      },
      term: { include: { academicYear: true } },
      subjectResults: true
    }
  });

  if (!result) throw new Error('Result not found');

  const student = result.student;
  const cls = student.class;
  const level = cls.level;
  const school = level.school;
  const term = result.term;
  
  // Get responsible teacher name
  let teacherName = 'N/A';
  if (cls.responsibleTeacherId) {
    const teacher = await prisma.user.findUnique({ where: { id: cls.responsibleTeacherId } });
    if (teacher) teacherName = teacher.fullName;
  }

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(stream);

  // Header
  doc.font('Helvetica-Bold').fontSize(14).text('REPUBLIC OF MALAWI — MINISTRY OF EDUCATION', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(16).text(school.name.toUpperCase(), { align: 'center' });
  doc.fontSize(14).text('ACADEMIC PROGRESS REPORT', { align: 'center' });
  doc.moveDown(1);
  
  doc.lineWidth(1).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);

  // Student Info
  doc.font('Helvetica').fontSize(11);
  doc.text(`Student Name:     ${student.firstName} ${student.lastName}`);
  doc.moveUp();
  doc.text(`Admission No: ${student.admissionNumber}`, { align: 'right' });
  
  doc.text(`Class:            ${cls.name}`);
  doc.moveUp();
  doc.text(`Level: ${level.name}`, { align: 'right' });
  
  doc.text(`School:           ${school.name}`);
  doc.text(`Class Teacher:    ${teacherName}`);
  
  doc.text(`Term:             Term ${term.termNumber}`);
  doc.moveUp();
  doc.text(`Year: ${term.academicYear.year}`, { align: 'right' });
  
  doc.moveDown(1);
  doc.lineWidth(1).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);

  // Subject Performance
  doc.font('Helvetica-Bold').text('SUBJECT PERFORMANCE', { align: 'center' });
  doc.moveDown(1);
  doc.lineWidth(1).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  // Table Header
  const headers = ['Subject', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', '/30', 'Exam', 'Total', 'Remarks'];
  const colX = [40, 160, 185, 210, 235, 260, 285, 320, 360, 410, 460];
  
  doc.font('Helvetica-Bold').fontSize(10);
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], colX[i], doc.y, { continued: i < headers.length - 1 });
  }
  doc.moveDown(0.5);
  doc.lineWidth(0.5).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  // Table Rows
  doc.font('Helvetica').fontSize(10);
  let totalA = 0;
  let totalExam = 0;
  let totalObtained = 0;

  for (const sr of result.subjectResults) {
    const startY = doc.y;
    doc.text(sr.subjectName, colX[0], startY);
    doc.text(sr.assessment1?.toString() || '-', colX[1], startY);
    doc.text(sr.assessment2?.toString() || '-', colX[2], startY);
    doc.text(sr.assessment3?.toString() || '-', colX[3], startY);
    doc.text(sr.assessment4?.toString() || '-', colX[4], startY);
    doc.text(sr.assessment5?.toString() || '-', colX[5], startY);
    doc.text(sr.assessment6?.toString() || '-', colX[6], startY);
    doc.text(sr.assessmentTotal.toString(), colX[7], startY);
    doc.text(sr.endOfTermScore?.toString() || '-', colX[8], startY);
    doc.text(sr.subjectTotal.toString(), colX[9], startY);
    doc.text(sr.subjectGrade || '-', colX[10], startY);

    totalA += sr.assessmentTotal;
    totalExam += sr.endOfTermScore || 0;
    totalObtained += sr.subjectTotal;
    doc.moveDown(0.5);
  }

  doc.moveDown(0.5);
  doc.lineWidth(0.5).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  // Total Row
  doc.font('Helvetica-Bold');
  const startY = doc.y;
  doc.text('TOTAL', colX[0], startY);
  doc.text(totalA.toString(), colX[7], startY);
  doc.text(totalExam.toString(), colX[8], startY);
  doc.text(totalObtained.toString(), colX[9], startY);
  doc.moveDown(2);

  // Summary
  doc.lineWidth(1).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);
  doc.font('Helvetica-Bold').text('SUMMARY', { align: 'center' });
  doc.moveDown(1);
  doc.lineWidth(1).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);

  doc.font('Helvetica');
  const totalPossible = result.subjectResults.length * 100;
  doc.text(`Total Marks Obtained:   ${totalObtained}`);
  doc.text(`Total Marks Possible:   ${totalPossible}  (${result.subjectResults.length} subjects × 100)`);
  doc.text(`Overall Percentage:     ${result.totalScore.toFixed(1)}%`);
  doc.text(`Overall Grade:          ${result.overallGrade}`);
  doc.font('Helvetica-Bold');
  const passStatus = result.isPassing ? '✓ ELIGIBLE TO PROCEED TO NEXT CLASS' : '✗ ADDITIONAL SUPPORT REQUIRED';
  doc.text(`Result Status:          ${passStatus}`);
  doc.moveDown(2);

  // Remarks
  doc.lineWidth(1).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);
  doc.font('Helvetica-Bold').text("TEACHER'S REMARKS", { align: 'center' });
  doc.moveDown(1);
  doc.lineWidth(1).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);
  
  doc.font('Helvetica').text(result.teacherRemarks || 'No remarks provided.');
  doc.moveDown(3);

  // Signatures
  doc.lineWidth(1).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(2);
  
  doc.text('Class Teacher: _______________________', 40, doc.y, { continued: true });
  doc.text('Date: ______________', { align: 'right' });
  doc.moveDown(2);
  
  doc.text('Head Teacher:  _______________________');
  doc.moveUp(1.5);
  doc.text('[  SCHOOL STAMP  ]', { align: 'right' });
  
  doc.moveDown(3);
  doc.lineWidth(1).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);
  
  // Footer
  doc.fontSize(8).text(`This report was generated by the Mayeso School Management System on ${new Date().toLocaleString()}`, { align: 'center' });

  doc.end();
}
