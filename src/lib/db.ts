import { neon } from '@neondatabase/serverless'

// Neon serverless SQL client
export const sql = neon(process.env.DATABASE_URL!)
