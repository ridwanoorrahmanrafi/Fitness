const fs = require("fs");
const path = require("path");
const dns = require("dns");
const { MongoClient } = require("mongodb");

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // ignore
}

// 1. Read environment variables from .env.local or .env if present
function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const uri =
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  "mongodb://ridwanoorrahmanrafi_db_user:<db_password>@ac-kwrhnde-shard-00-00.blmnhaa.mongodb.net:27017,ac-kwrhnde-shard-00-01.blmnhaa.mongodb.net:27017,ac-kwrhnde-shard-00-02.blmnhaa.mongodb.net:27017/fitness?ssl=true&replicaSet=atlas-t8ab33-shard-0&authSource=admin&compressors=zlib";

async function main() {
  console.log("=== Testing MongoDB Atlas Connection ===");

  if (uri.includes("<db_password>")) {
    console.error("\n❌ Error: '<db_password>' placeholder detected!");
    console.error("Please replace '<db_password>' in your .env.local file with your actual database password before testing.\n");
    process.exit(1);
  }

  // Hide password in console logs
  const maskedUri = uri.replace(/:([^@]+)@/, ":*****@");
  console.log(`Connecting to: ${maskedUri}...`);

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME || "fitness");
    const pingResult = await db.command({ ping: 1 });
    console.log("\n✅ You successfully connected to MongoDB!");
    console.log("Ping response:", pingResult);

    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collection(s) in '${db.databaseName}':`, collections.map(c => c.name));
  } catch (err) {
    console.error("\n❌ MongoDB connection failed:");
    console.dir(err);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

main();
