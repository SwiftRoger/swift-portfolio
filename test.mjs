import { neon } from '@neondatabase/serverless'
const sql = neon('postgresql://neondb_owner:npg_OvZ20xiuzhnr@ep-patient-dew-ao6spyqf.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require')
try {
  const r = await sql`SELECT 1`
  console.log('SUCCESS', r)
} catch(e) {
  console.error('ERROR', e.message)
}