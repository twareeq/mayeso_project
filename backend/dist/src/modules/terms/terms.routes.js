"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../../config/database"));
const auth_1 = require("../../middleware/auth");
const rbac_1 = require("../../middleware/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', async (req, res) => {
    const terms = await database_1.default.term.findMany({
        include: { academicYear: true },
        orderBy: [{ academicYear: { year: 'desc' } }, { termNumber: 'asc' }]
    });
    res.json(terms);
});
router.post('/', (0, rbac_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        const term = await database_1.default.term.create({ data: req.body });
        res.status(201).json(term);
    }
    catch (err) {
        res.status(400).json({ message: 'Error creating term' });
    }
});
exports.default = router;
