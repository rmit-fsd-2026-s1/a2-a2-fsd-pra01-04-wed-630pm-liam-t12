"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
exports.typeDefs = `#graphql
  type User {
    id: Int!
    name: String!
    email: String!
    role: String!
    phone: String
    joinedAt: String
  }

  type Venue {
    id: Int!
    name: String!
    location: String!
    capacity: Int!
    pricePerHour: Float!
    image: String
    description: String
    suitability: String
    vendorId: Int!
    isFeatured: Boolean!
    vendor: User
  }

  type Booking {
    id: Int!
    hirerId: Int!
    venueId: Int!
    eventName: String!
    date: String!
    time: String!
    status: String!
    createdAt: String
    hirer: User
    venue: Venue
  }

  type VenueReport {
    venueId: Int!
    venueName: String!
    totalBookings: Int!
    popularDay: String
    popularTime: String
  }

  type HirerReport {
    hirerId: Int!
    hirerName: String!
    totalApplications: Int!
    successfulBookings: Int!
  }

  type AuthPayload {
    token: String!
    role: String!
  }

  type Query {
    # Auth
    login(email: String!, password: String!): AuthPayload!

    # Venues
    venues: [Venue!]!
    venue(id: Int!): Venue
    vendors: [User!]!

    # Reports
    topVenues: [VenueReport!]!
    topHirers: [HirerReport!]!
  }

  type Mutation {
    # Venue CRUD
    createVenue(name: String!, location: String!, capacity: Int!, pricePerHour: Float!, image: String, description: String, suitability: String, vendorId: Int!): Venue!
    updateVenue(id: Int!, name: String, location: String, capacity: Int, pricePerHour: Float, image: String, description: String, suitability: String, vendorId: Int, isFeatured: Boolean): Venue!
    deleteVenue(id: Int!): Boolean!

    # Featured toggle
    setFeatured(id: Int!, isFeatured: Boolean!): Venue!

    # Assign vendor
    assignVendor(venueId: Int!, vendorId: Int!): Venue!
  }
`;
