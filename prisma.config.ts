import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

config({ path: '.env.local' });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  experimental: {
    externalTables: true,
  },
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  },
  tables: {
    external: [
      'public.exercises',
      'public.exercise_instructions',
      'public.exercise_instruction_steps',
      'public.exercise_secondary_muscles',
    ],
  },
});
