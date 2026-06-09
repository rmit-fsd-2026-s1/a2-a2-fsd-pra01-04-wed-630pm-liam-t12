"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../entity/User");
const Venue_1 = require("../entity/Venue");
const BlockedPeriod_1 = require("../entity/BlockedPeriod");
const Booking_1 = require("../entity/Booking");
const HireRecord_1 = require("../entity/HireRecord");
const PreferredVenue_1 = require("../entity/PreferredVenue");
const ComplianceDocument_1 = require("../entity/ComplianceDocument");
const VendorNote_1 = require("../entity/VendorNote");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'mssql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '1433'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [User_1.User, Venue_1.Venue, BlockedPeriod_1.BlockedPeriod, Booking_1.Booking, HireRecord_1.HireRecord, PreferredVenue_1.PreferredVenue, ComplianceDocument_1.ComplianceDocument, VendorNote_1.VendorNote],
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
});
