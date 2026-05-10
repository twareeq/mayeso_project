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
router.use((0, rbac_1.requireRole)(['ADMIN']));
router.get('/', async (req, res) => {
    const years = await database_1.default.academicYear.findMany({ include: { terms: true } });
    res.json(years);
});
router.post('/', async (req, res) => {
    try {
        const year = await database_1.default.academicYear.create({ data: req.body });
        res.status(201).json(year);
    }
    catch (err) {
        res.status(400).json({ message: 'Error creating academic year' });
    }
});
exports.default = router;
