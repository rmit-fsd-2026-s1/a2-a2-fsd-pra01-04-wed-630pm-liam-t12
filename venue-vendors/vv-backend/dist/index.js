"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const venueRoutes_1 = __importDefault(require("./routes/venueRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const hirerRoutes_1 = __importDefault(require("./routes/hirerRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use('/api/auth', authRoutes_1.default);
app.use('/api/venues', venueRoutes_1.default);
app.use('/api/bookings', bookingRoutes_1.default);
app.use('/api/hirer', hirerRoutes_1.default);
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
database_1.AppDataSource.initialize()
    .then(() => {
    console.log('✅ Database connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
})
    .catch(err => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
});
