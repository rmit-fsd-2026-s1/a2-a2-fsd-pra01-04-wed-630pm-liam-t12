import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import dotenv from 'dotenv';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers/resolvers';
import { AppDataSource } from './config/database';

dotenv.config();

const PORT = parseInt(process.env.PORT || '4000');

async function start() {
  await AppDataSource.initialize();
  console.log('✅ Database connected');

  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
    context: async () => ({}),
  });

  console.log(`🚀 Admin GraphQL running at ${url}`);
}

start().catch(err => {
  console.error('❌ Failed to start:', err);
  process.exit(1);
});