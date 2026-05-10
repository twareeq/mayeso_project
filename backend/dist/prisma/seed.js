"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Cleaning up database...');
    // Clear in reverse order of dependencies
    await prisma.subjectResult.deleteMany();
    await prisma.studentResult.deleteMany();
    await prisma.mark.deleteMany();
    await prisma.teacherSubject.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.student.deleteMany();
    await prisma.class.deleteMany();
    await prisma.level.deleteMany();
    await prisma.term.deleteMany();
    await prisma.academicYear.deleteMany();
    // We keep the school and users created by upsert
    console.log('Starting seed...');
    // 1. Zone
    const zone = await prisma.zone.upsert({
        where: { name: 'Northern Zone' },
        update: {},
        create: {
            name: 'Northern Zone',
            region: 'Northern Region',
        },
    });
    // 2. School
    const school = await prisma.school.upsert({
        where: { id: 'mayeso-primary' }, // We don't have unique name, but we can just create it
        update: {},
        create: {
            name: 'Mayeso Primary School',
            zoneId: zone.id,
            address: '123 Education Way, Mzuzu',
        },
    });
    // 3. Levels
    const lowLevel = await prisma.level.create({
        data: { name: 'Low Level', type: client_1.LevelType.LOW, schoolId: school.id },
    });
    const seniorLevel = await prisma.level.create({
        data: { name: 'Senior Level', type: client_1.LevelType.SENIOR, schoolId: school.id },
    });
    // 4. Academic Year
    const year2025 = await prisma.academicYear.upsert({
        where: { year: '2025' },
        update: { isCurrent: true },
        create: { year: '2025', isCurrent: true },
    });
    // 5. Terms
    const term1 = await prisma.term.upsert({
        where: { academicYearId_termNumber: { academicYearId: year2025.id, termNumber: 1 } },
        update: { isCurrent: true },
        create: {
            termNumber: 1,
            startDate: new Date('2025-01-06'),
            endDate: new Date('2025-03-28'),
            isCurrent: true,
            academicYearId: year2025.id,
        },
    });
    const term2 = await prisma.term.upsert({
        where: { academicYearId_termNumber: { academicYearId: year2025.id, termNumber: 2 } },
        update: {},
        create: {
            termNumber: 2,
            startDate: new Date('2025-04-14'),
            endDate: new Date('2025-07-11'),
            isCurrent: false,
            academicYearId: year2025.id,
        },
    });
    const term3 = await prisma.term.upsert({
        where: { academicYearId_termNumber: { academicYearId: year2025.id, termNumber: 3 } },
        update: {},
        create: {
            termNumber: 3,
            startDate: new Date('2025-09-08'),
            endDate: new Date('2025-12-12'),
            isCurrent: false,
            academicYearId: year2025.id,
        },
    });
    // 6. Users
    const passwordHashAdmin = await bcrypt_1.default.hash('Admin1234', 12);
    const passwordHashHead = await bcrypt_1.default.hash('Head1234', 12);
    const passwordHashTeacher = await bcrypt_1.default.hash('Teacher1234', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@mayeso.mw' },
        update: {},
        create: {
            fullName: 'System Admin',
            email: 'admin@mayeso.mw',
            password: passwordHashAdmin,
            role: client_1.Role.ADMIN,
        },
    });
    const headTeacher = await prisma.user.upsert({
        where: { email: 'head@mayeso.mw' },
        update: {},
        create: {
            fullName: 'Head Teacher Phiri',
            email: 'head@mayeso.mw',
            password: passwordHashHead,
            role: client_1.Role.HEAD_TEACHER,
            schoolId: school.id,
        },
    });
    const teacher = await prisma.user.upsert({
        where: { email: 'teacher@mayeso.mw' },
        update: {},
        create: {
            fullName: 'Mr. James Phiri',
            email: 'teacher@mayeso.mw',
            password: passwordHashTeacher,
            role: client_1.Role.TEACHER,
            schoolId: school.id,
        },
    });
    // 7. Classes
    const std6A = await prisma.class.create({
        data: {
            name: 'Standard 6A',
            standardNumber: 6,
            stream: 'A',
            academicYear: '2025',
            levelId: lowLevel.id,
        },
    });
    const std8B = await prisma.class.create({
        data: {
            name: 'Standard 8B',
            standardNumber: 8,
            stream: 'B',
            academicYear: '2025',
            levelId: seniorLevel.id,
            responsibleTeacherId: teacher.id, // Teacher responsible
        },
    });
    // 8. Subjects
    const subjectNames = ['Mathematics', 'English', 'Chichewa', 'Science', 'Social Studies', 'Religious Education'];
    const subjectCodes = ['MTH', 'ENG', 'CHI', 'SCI', 'SST', 'RE'];
    const subjects = [];
    for (let i = 0; i < subjectNames.length; i++) {
        const subj = await prisma.subject.create({
            data: {
                name: subjectNames[i],
                code: subjectCodes[i],
                classId: std8B.id,
            },
        });
        subjects.push(subj);
        // Assign teacher to subject
        await prisma.teacherSubject.create({
            data: {
                teacherId: teacher.id,
                subjectId: subj.id,
            },
        });
    }
    // 9. Students
    const studentNames = [
        { first: 'John', last: 'Banda', gender: client_1.Gender.MALE },
        { first: 'Mary', last: 'Phiri', gender: client_1.Gender.FEMALE },
        { first: 'James', last: 'Tembo', gender: client_1.Gender.MALE },
        { first: 'Grace', last: 'Mwale', gender: client_1.Gender.FEMALE },
        { first: 'Peter', last: 'Banda', gender: client_1.Gender.MALE },
    ];
    const students = [];
    for (let i = 0; i < studentNames.length; i++) {
        const admissionNumber = `MPS-2025-${String(i + 1).padStart(4, '0')}`;
        const st = await prisma.student.create({
            data: {
                admissionNumber,
                firstName: studentNames[i].first,
                lastName: studentNames[i].last,
                gender: studentNames[i].gender,
                classId: std8B.id,
                createdById: headTeacher.id,
            },
        });
        students.push(st);
    }
    // 10. Marks for John Banda (Fully complete)
    const john = students[0];
    for (const subject of subjects) {
        // 6 assessments
        for (let a = 1; a <= 6; a++) {
            await prisma.mark.create({
                data: {
                    markType: client_1.MarkType.ASSESSMENT,
                    assessmentNumber: a,
                    score: 4,
                    maxScore: 5,
                    isDraft: false,
                    studentId: john.id,
                    subjectId: subject.id,
                    termId: term1.id,
                    enteredById: teacher.id,
                },
            });
        }
        // End of term
        await prisma.mark.create({
            data: {
                markType: client_1.MarkType.END_OF_TERM,
                score: 60,
                maxScore: 70,
                isDraft: false,
                studentId: john.id,
                subjectId: subject.id,
                termId: term1.id,
                enteredById: teacher.id,
            },
        });
    }
    // 11. Marks for Mary Phiri (Partial)
    const mary = students[1];
    for (const subject of subjects) {
        // only first 2 assessments
        for (let a = 1; a <= 2; a++) {
            await prisma.mark.create({
                data: {
                    markType: client_1.MarkType.ASSESSMENT,
                    assessmentNumber: a,
                    score: 3,
                    maxScore: 5,
                    isDraft: true,
                    studentId: mary.id,
                    subjectId: subject.id,
                    termId: term1.id,
                    enteredById: teacher.id,
                },
            });
        }
    }
    console.log('Seeding complete!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
