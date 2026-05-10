"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../../config/database"));
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/overview', async (req, res) => {
    try {
        const students = await database_1.default.student.count();
        const teachers = await database_1.default.user.count({ where: { role: 'TEACHER' } });
        const schools = await database_1.default.school.count();
        const zones = await database_1.default.zone.count();
        res.json({ students, teachers, schools, zones });
    }
    catch (err) {
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});
exports.default = router;
