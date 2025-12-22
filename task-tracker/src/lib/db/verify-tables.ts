import { config } from 'dotenv';

// Load environment variables from .env.local BEFORE importing db
config({ path: '.env.local' });

import { db } from './connection';

export async function verifyTables() {
  try {
    console.log('Verifying database tables...');
    
    // Check if our tables exist
    const result = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('✅ Tables found in database:');
    result.rows.forEach((row: any) => {
      console.log(`  - ${row.table_name}`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Failed to verify tables:', error);
    return false;
  }
}

// Run verification if this file is executed directly
if (require.main === module) {
  verifyTables().then((success) => {
    process.exit(success ? 0 : 1);
  });
}