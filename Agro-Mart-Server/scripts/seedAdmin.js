require("dotenv").config();
const { MongoClient } = require("mongodb");

async function seedAdmin() {
  const email = process.argv[2] || "admin.agromart26@gmail.com";
  const password = process.argv[3] || "Agro@Admin#2026";

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();

  const users = client.db("AgroMart").collection("users");
  const adminDoc = {
    name: "AgroMart Admin",
    email,
    password,
    role: "admin",
    photoURL: "",
    createdAt: new Date().toISOString(),
  };

  const result = await users.updateOne(
    { email },
    { $set: adminDoc },
    { upsert: true }
  );

  console.log(
    JSON.stringify(
      {
        email,
        role: "admin",
        upsertedId: result.upsertedId || null,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
      null,
      2
    )
  );

  await client.close();
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
