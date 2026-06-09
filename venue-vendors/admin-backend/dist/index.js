"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const server_1 = require("@apollo/server");
const standalone_1 = require("@apollo/server/standalone");
const dotenv_1 = __importDefault(require("dotenv"));
const typeDefs_1 = require("./schema/typeDefs");
const resolvers_1 = require("./resolvers/resolvers");
const database_1 = require("./config/database");
dotenv_1.default.config();
const PORT = parseInt(process.env.PORT || '4000');
async function start() {
    await database_1.AppDataSource.initialize();
    console.log('✅ Database connected');
    const server = new server_1.ApolloServer({ typeDefs: typeDefs_1.typeDefs, resolvers: resolvers_1.resolvers });
    const { url } = await (0, standalone_1.startStandaloneServer)(server, {
        listen: { port: PORT },
        context: async () => ({}),
    });
    console.log(`🚀 Admin GraphQL running at ${url}`);
}
start().catch(err => {
    console.error('❌ Failed to start:', err);
    process.exit(1);
});
