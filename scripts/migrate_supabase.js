const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

  const dbPassword = process.env.DB_PASSWORD || process.env.PGPASSWORD;
  const dbUser = process.env.DB_USER || process.env.PGUSER || "postgres.vdaenqmujfpduvjmuxzm";
  const dbHost = process.env.DB_HOST || process.env.PGHOST || "aws-0-us-east-1.pooler.supabase.com";

  // Try direct port 5432 first, fallback to transaction pooler port 6543 if direct port is firewalled
  const configs = [
    {
      host: dbHost,
      port: 6543,
      user: dbUser,
      password: dbPassword,
      database: "postgres",
      ssl: { rejectUnauthorized: false },
    },
    {
      host: dbHost,
      port: 5432,
      user: dbUser,
      password: dbPassword,
      database: "postgres",
      ssl: { rejectUnauthorized: false },
    }
  ];

  let client = null;
  let connected = false;

  for (let i = 0; i < configs.length; i++) {
    try {
      console.log(`Attempting connection candidate ${i + 1}...`);
      client = new Client(configs[i]);
      await client.connect();
      console.log(`Connected successfully via candidate ${i + 1}!`);
      connected = true;
      break;
    } catch (err) {
      console.log(`Candidate ${i + 1} failed: ${err.message}`);
      if (client) {
        try { await client.end(); } catch (_) {}
      }
    }
  }

  if (!connected || !client) {
    console.error("Could not establish direct TCP connection to PostgreSQL pooler.");
    process.exit(1);
  }

  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, "../supabase/schema.sql"), "utf-8");
    console.log("Executing supabase/schema.sql on Supabase database...");
    
    await client.query(schemaSql);
    console.log("Schema applied successfully!");

    // Verify created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log("Tables present in public schema:", res.rows.map(r => r.table_name));

    // Verify notes table data
    const notesRes = await client.query("SELECT * FROM public.notes;");
    console.log("Rows in public.notes:", notesRes.rows);

  } catch (err) {
    console.error("Migration execution error:", err);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

runMigration();
