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
    const levels = await database_1.default.level.findMany({ include: { school: true } });
    res.json(levels);
});
router.post('/', (0, rbac_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        const level = await database_1.default.level.create({ data: req.body });
        res.status(201).json(level);
    }
    catch (err) {
        res.status(400).json({ message: 'Error creating level' });
    }
});
exports.default = router;
