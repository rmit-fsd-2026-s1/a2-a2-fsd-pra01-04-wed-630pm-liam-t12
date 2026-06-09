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
exports.HireRecord = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Venue_1 = require("./Venue");
let HireRecord = class HireRecord {
};
exports.HireRecord = HireRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], HireRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], HireRecord.prototype, "hirerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], HireRecord.prototype, "venueId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 200 }),
    __metadata("design:type", String)
], HireRecord.prototype, "eventName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], HireRecord.prototype, "dateOfHire", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], HireRecord.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], HireRecord.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.hireRecords),
    (0, typeorm_1.JoinColumn)({ name: 'hirerId' }),
    __metadata("design:type", User_1.User)
], HireRecord.prototype, "hirer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Venue_1.Venue, venue => venue.hireRecords),
    (0, typeorm_1.JoinColumn)({ name: 'venueId' }),
    __metadata("design:type", Venue_1.Venue)
], HireRecord.prototype, "venue", void 0);
exports.HireRecord = HireRecord = __decorate([
    (0, typeorm_1.Entity)('hire_records')
], HireRecord);
