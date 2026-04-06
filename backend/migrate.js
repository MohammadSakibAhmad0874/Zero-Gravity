/**
 * DevMatch — One-time Migration Script
 * Migrates existing JSON data files → Firestore
 *
 * Usage:
 *   1. Make sure your backend/.env has the Firebase credentials
 *   2. Run: npm run migrate
 *
 * This is NON-DESTRUCTIVE — JSON files are only read, never deleted
 */

import 'dotenv/config'
import admin from 'firebase-admin'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
})

const db = admin.firestore()

function readJSON(filename) {
  const filePath = resolve(__dirname, 'data', filename)
  if (!existsSync(filePath)) {
    console.log(`  ⚠️  ${filename} not found — skipping`)
    return []
  }
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch (e) {
    console.error(`  ❌ Failed to parse ${filename}:`, e.message)
    return []
  }
}

async function migrateCollection(collectionName, records, getDocId) {
  console.log(`\n📦 Migrating ${records.length} records → '${collectionName}'...`)

  if (records.length === 0) {
    console.log('  ℹ️  Nothing to migrate')
    return
  }

  // Firestore batch writes (max 500 per batch)
  const batchSize = 400
  let migrated = 0
  let skipped = 0

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = db.batch()
    const chunk = records.slice(i, i + batchSize)

    for (const record of chunk) {
      const docId = getDocId(record)
      if (!docId) {
        console.warn(`  ⚠️  Skipping record with no ID:`, record)
        skipped++
        continue
      }

      const ref = db.collection(collectionName).doc(docId)

      // Check if already exists
      const existing = await ref.get()
      if (existing.exists) {
        console.log(`  ↩️  Already exists: ${docId}`)
        skipped++
        continue
      }

      // Remove bcrypt password from user records — not needed in Firestore
      const { password, ...cleanRecord } = record
      batch.set(ref, { ...cleanRecord, id: docId })
      migrated++
    }

    await batch.commit()
  }

  console.log(`  ✅  Done: ${migrated} migrated, ${skipped} skipped`)
}

async function main() {
  console.log('🚀 DevMatch Data Migration: JSON → Firestore')
  console.log('━'.repeat(50))

  const users = readJSON('users.json')
  const chats = readJSON('chats.json')
  const meetups = readJSON('meetups.json')

  await migrateCollection('users', users, u => u.id)
  await migrateCollection('chats', chats, c => c.id)
  await migrateCollection('meetups', meetups, m => m.id)

  console.log('\n━'.repeat(50))
  console.log('✅ Migration complete!')
  console.log('\n⚠️  IMPORTANT: Existing users with passwords must use')
  console.log('   "Forgot Password" to reset via Firebase Auth.')
  console.log('   Their profile data has been preserved in Firestore.')

  process.exit(0)
}

main().catch(err => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
