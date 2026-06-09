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
exports.PreferredVenue = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Venue_1 = require("./Venue");
let PreferredVenue = class PreferredVenue {
};
exports.PreferredVenue = PreferredVenue;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PreferredVenue.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PreferredVenue.prototype, "hirerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PreferredVenue.prototype, "venueId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PreferredVenue.prototype, "rank", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.preferredVenues),
    (0, typeorm_1.JoinColumn)({ name: 'hirerId' }),
    __metadata("design:type", User_1.User)
], PreferredVenue.prototype, "hirer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Venue_1.Venue),
    (0, typeorm_1.JoinColumn)({ name: 'venueId' }),
    __metadata("design:type", Venue_1.Venue)
], PreferredVenue.prototype, "venue", void 0);
exports.PreferredVenue = PreferredVenue = __decorate([
    (0, typeorm_1.Entity)('preferred_venues'),
    (0, typeorm_1.Unique)(['hirerId', 'venueId'])
], PreferredVenue);
