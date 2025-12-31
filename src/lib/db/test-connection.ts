import { db } from "./connection";

export async function testConnection() {
  try {
    console.log("Testing database connection...");
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

    // Simple query to test connection
    const result = await db.execute("SELECT 1 as test");
    console.log("✅ Database connection successful!");
    console.log("Test result:", result);

    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testConnection().then((success) => {
    process.exit(success ? 0 : 1);
  });
}
