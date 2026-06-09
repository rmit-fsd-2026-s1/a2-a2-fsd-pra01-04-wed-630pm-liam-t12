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
exports.Venue = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const BlockedPeriod_1 = require("./BlockedPeriod");
const Booking_1 = require("./Booking");
const HireRecord_1 = require("./HireRecord");
let Venue = class Venue {
};
exports.Venue = Venue;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Venue.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 150 }),
    __metadata("design:type", String)
], Venue.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 150 }),
    __metadata("design:type", String)
], Venue.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Venue.prototype, "capacity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Venue.prototype, "pricePerHour", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], Venue.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 1000, nullable: true }),
    __metadata("design:type", String)
], Venue.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 300, nullable: true }),
    __metadata("design:type", String)
], Venue.prototype, "suitability", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Venue.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bit', default: false }),
    __metadata("design:type", Boolean)
], Venue.prototype, "isFeatured", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Venue.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.venues),
    (0, typeorm_1.JoinColumn)({ name: 'vendorId' }),
    __metadata("design:type", User_1.User)
], Venue.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => BlockedPeriod_1.BlockedPeriod, bp => bp.venue, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], Venue.prototype, "blockedPeriods", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Booking_1.Booking, booking => booking.venue),
    __metadata("design:type", Array)
], Venue.prototype, "bookings", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => HireRecord_1.HireRecord, hr => hr.venue),
    __metadata("design:type", Array)
], Venue.prototype, "hireRecords", void 0);
exports.Venue = Venue = __decorate([
    (0, typeorm_1.Entity)('venues')
], Venue);
