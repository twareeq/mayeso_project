import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function computeStudentResult(
  studentId: string,
  termId: string
): Promise<void> {

  // 1. Get student's class and all its subjects
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { class: { include: { subjects: true } } }
  });
  if (!student) throw new Error('Student not found');

  const subjects = student.class.subjects;

  // 2. Get all marks for this student in this term
  const allMarks = await prisma.mark.findMany({
    where: { studentId, termId }
  });

  // 3. Compute per-subject results
  const subjectResults = [];
  let totalSubjectScores = 0;

  for (const subject of subjects) {
    const subjectMarks = allMarks.filter(m => m.subjectId === subject.id);

    // Get 6 assessment scores (null if not yet entered)
    const assessments = [1,2,3,4,5,6].map(n => {
      const m = subjectMarks.find(
        m => m.markType === 'ASSESSMENT' && m.assessmentNumber === n
      );
      return m?.score ?? null;
    });

    const assessmentTotal = assessments.reduce(
      (sum, s) => (sum as number) + (s ?? 0), 0
    ) as number;

    // End-of-term score
    const eot = subjectMarks.find(m => m.markType === 'END_OF_TERM');
    const endOfTermScore = eot?.score ?? null;

    const subjectTotal = assessmentTotal + (endOfTermScore ?? 0);
    const subjectGrade = getGradeLabel(subjectTotal);

    subjectResults.push({
      subjectName: subject.name,
      subjectCode: subject.code,
      assessment1: assessments[0] ?? undefined,
      assessment2: assessments[1] ?? undefined,
      assessment3: assessments[2] ?? undefined,
      assessment4: assessments[3] ?? undefined,
      assessment5: assessments[4] ?? undefined,
      assessment6: assessments[5] ?? undefined,
      assessmentTotal,
      endOfTermScore: endOfTermScore ?? undefined,
      subjectTotal,
      subjectGrade
    });

    totalSubjectScores += subjectTotal;
  }

  // 4. Overall percentage
  const totalPossible = subjects.length * 100;
  const overallPercentage = totalPossible > 0
    ? (totalSubjectScores / totalPossible) * 100
    : 0;

  const overallGrade = getGradeLabel(overallPercentage);
  const isPassing = overallPercentage >= 50;

  // 5. Upsert result
  const existing = await prisma.studentResult.findUnique({
    where: { studentId_termId: { studentId, termId } }
  });

  if (existing) {
    await prisma.subjectResult.deleteMany({
      where: { studentResultId: existing.id }
    });
    await prisma.studentResult.update({
      where: { id: existing.id },
      data: {
        totalScore: overallPercentage,
        overallGrade,
        isPassing,
        lastComputedAt: new Date(),
        subjectResults: { create: subjectResults }
      }
    });
  } else {
    await prisma.studentResult.create({
      data: {
        studentId,
        termId,
        totalScore: overallPercentage,
        overallGrade,
        isPassing,
        lastComputedAt: new Date(),
        subjectResults: { create: subjectResults }
      }
    });
  }
}

function getGradeLabel(score: number): string {
  if (score >= 81) return 'Excellent';
  if (score >= 71) return 'Very Good';
  if (score >= 50) return 'Good';
  return 'Need Support';
}
