"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const zones_routes_1 = __importDefault(require("./modules/zones/zones.routes"));
const schools_routes_1 = __importDefault(require("./modules/schools/schools.routes"));
const users_routes_1 = __importDefault(require("./modules/users/users.routes"));
const levels_routes_1 = __importDefault(require("./modules/levels/levels.routes"));
const academic_years_routes_1 = __importDefault(require("./modules/academic_years/academic_years.routes"));
const terms_routes_1 = __importDefault(require("./modules/terms/terms.routes"));
const classes_routes_1 = __importDefault(require("./modules/classes/classes.routes"));
const subjects_routes_1 = __importDefault(require("./modules/subjects/subjects.routes"));
const students_routes_1 = __importDefault(require("./modules/students/students.routes"));
const marks_routes_1 = __importDefault(require("./modules/marks/marks.routes"));
const results_routes_1 = __importDefault(require("./modules/results/results.routes"));
const reports_routes_1 = __importDefault(require("./modules/reports/reports.routes"));
const analytics_routes_1 = __importDefault(require("./modules/analytics/analytics.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'ok', message: 'Mayeso API is running' });
});
// Setup modules
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/zones', zones_routes_1.default);
app.use('/api/v1/schools', schools_routes_1.default);
app.use('/api/v1/users', users_routes_1.default);
app.use('/api/v1/levels', levels_routes_1.default);
app.use('/api/v1/academic-years', academic_years_routes_1.default);
app.use('/api/v1/terms', terms_routes_1.default);
app.use('/api/v1/classes', classes_routes_1.default);
app.use('/api/v1/subjects', subjects_routes_1.default);
app.use('/api/v1/students', students_routes_1.default);
app.use('/api/v1/marks', marks_routes_1.default);
app.use('/api/v1/results', results_routes_1.default);
app.use('/api/v1/reports', reports_routes_1.default);
app.use('/api/v1/analytics', analytics_routes_1.default);
app.listen(env_1.ENV.PORT, () => {
    console.log(`Server is running on port ${env_1.ENV.PORT}`);
});
