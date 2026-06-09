"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const typeorm_1 = require("typeorm");
const Venue_1 = require("./Venue");
const Booking_1 = require("./Booking");
const HireRecord_1 = require("./HireRecord");
const PreferredVenue_1 = require("./PreferredVenue");
const ComplianceDocument_1 = require("./ComplianceDocument");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 100 }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 150, unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 255 }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 10 }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "avatarUrl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "joinedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Venue_1.Venue, venue => venue.vendor),
    __metadata("design:type", Array)
], User.prototype, "venues", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Booking_1.Booking, booking => booking.hirer),
    __metadata("design:type", Array)
], User.prototype, "bookings", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => HireRecord_1.HireRecord, hr => hr.hirer),
    __metadata("design:type", Array)
], User.prototype, "hireRecords", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PreferredVenue_1.PreferredVenue, pv => pv.hirer),
    __metadata("design:type", Array)
], User.prototype, "preferredVenues", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ComplianceDocument_1.ComplianceDocument, doc => doc.hirer),
    __metadata("design:type", Array)
], User.prototype, "complianceDocuments", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
