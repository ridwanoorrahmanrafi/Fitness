import dns from "node:dns";
import { MongoClient } from "mongodb";
import { EXERCISES } from "../lib/exercises";
import { getExerciseMedia } from "../lib/exerciseMedia";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://ridwanoorrahmanrafi_db_user:kN9j01twgqBFwntx@cluster0.8zpza0s.mongodb.net/fitness?retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function main() {
  console.log("Connecting to MongoDB Atlas...");
  await client.connect();
  const db = client.db("fitness");
  const col = db.collection("exercises");

  let count = 0;
  for (const ex of EXERCISES) {
    const media = getExerciseMedia(ex.id);
    await col.updateOne(
      { _id: ex.id as any },
      {
        $set: {
          id: ex.id,
          name: ex.name,
          muscles: ex.muscles,
          pattern: ex.pattern,
          requires: ex.requires,
          level: ex.level,
          lowImpact: ex.lowImpact,
          timed: Boolean(ex.timed),
          perSide: Boolean(ex.perSide),
          loaded: Boolean(ex.loaded),
          cues: ex.cues,
          easierId: ex.easier ?? null,
          harderId: ex.harder ?? null,
          gifUrl: media.localGif,
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );
    count++;
  }

  console.log(`✅ Successfully seeded ${count} exercises to MongoDB Atlas!`);
  const total = await col.countDocuments();
  console.log(`Total exercises in 'exercises' collection: ${total}`);
  await client.close();
}

main().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});

