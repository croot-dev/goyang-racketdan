import 'server-only'
import { neon, Pool } from '@neondatabase/serverless'

// Neon serverless SQL client
export const sql = neon(process.env.DATABASE_URL!)

export const pool = new Pool({ connectionString: process.env.DATABASE_URL })
