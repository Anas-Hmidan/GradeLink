// Migration script to add salt field to existing users
// Run this if you have existing users in your database

import { MongoClient } from "mongodb"
import crypto from "crypto"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = process.env.MONGODB_DB_NAME || "exam_generator"

function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex")
}

async function migrateUsers() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(DB_NAME)
    const usersCollection = db.collection("users")

    // Find all users without a salt field
    const usersWithoutSalt = await usersCollection.find({ salt: { $exists: false } }).toArray()

    console.log(`Found ${usersWithoutSalt.length} users without salt field`)

    if (usersWithoutSalt.length === 0) {
      console.log("No migration needed. All users have salt field.")
      return
    }

    // WARNING: This migration will invalidate all existing passwords
    // Users will need to reset their passwords after this migration

    console.log("\n⚠️  WARNING: This migration will INVALIDATE all existing passwords!")
    console.log("Users will need to reset their passwords after this migration.")
    console.log("\nPress Ctrl+C to cancel, or wait 5 seconds to continue...\n")

    await new Promise((resolve) => setTimeout(resolve, 5000))

    let migratedCount = 0

    for (const user of usersWithoutSalt) {
      const salt = generateSalt()

      await usersCollection.updateOne({ _id: user._id }, { $set: { salt, password: "INVALID_MIGRATED_PASSWORD" } })

      migratedCount++
      console.log(`Migrated user: ${user.email}`)
    }

    console.log(`\n✅ Successfully migrated ${migratedCount} users`)
    console.log("\n📧 Action required: Notify users to reset their passwords")
  } catch (error) {
    console.error("Migration failed:", error)
    throw error
  } finally {
    await client.close()
    console.log("Disconnected from MongoDB")
  }
}

// Alternative: Just add salt field and keep old password hash
// This is LESS SECURE but won't require password reset
async function migrateUsersKeepPasswords() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(DB_NAME)
    const usersCollection = db.collection("users")

    const usersWithoutSalt = await usersCollection.find({ salt: { $exists: false } }).toArray()

    console.log(`Found ${usersWithoutSalt.length} users without salt field`)

    if (usersWithoutSalt.length === 0) {
      console.log("No migration needed.")
      return
    }

    // Add a placeholder salt (less secure, but keeps passwords working)
    const LEGACY_SALT = process.env.PASSWORD_SALT || "salt"

    for (const user of usersWithoutSalt) {
      await usersCollection.updateOne({ _id: user._id }, { $set: { salt: LEGACY_SALT } })

      console.log(`Added legacy salt to user: ${user.email}`)
    }

    console.log(`\n✅ Successfully migrated ${usersWithoutSalt.length} users (legacy mode)`)
    console.log("⚠️  Note: These users are using legacy salt. Recommend password reset for better security.")
  } catch (error) {
    console.error("Migration failed:", error)
    throw error
  } finally {
    await client.close()
  }
}

// Run based on command line argument
const mode = process.argv[2]

if (mode === "--keep-passwords") {
  console.log("Running migration in LEGACY MODE (keeps existing passwords)...")
  migrateUsersKeepPasswords()
} else {
  console.log("Running migration in SECURE MODE (invalidates passwords)...")
  migrateUsers()
}
