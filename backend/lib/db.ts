import { MongoClient, type Db } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is not defined")
  }

  const client = new MongoClient(mongoUri)

  try {
    await client.connect()
    const db = client.db(process.env.MONGODB_DB_NAME || "exam_generator")

    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error("MongoDB connection failed:", error)
    throw error
  }
}

export async function ensureIndexes(db: Db) {
  // User indexes
  await db.collection("users").createIndex({ email: 1 }, { unique: true })

  // Test indexes
  await db.collection("tests").createIndex({ teacher_id: 1 })
  await db.collection("tests").createIndex({ created_at: -1 })

  // Result indexes
  await db.collection("results").createIndex({ student_id: 1 })
  await db.collection("results").createIndex({ test_id: 1 })
  await db.collection("results").createIndex({ submitted_at: -1 })
}
