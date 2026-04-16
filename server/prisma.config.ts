import path from 'node:path';
import { defineConfig } from 'prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/jansetu';

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: DATABASE_URL,
  },
});
