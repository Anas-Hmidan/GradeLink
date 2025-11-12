import crypto from "crypto"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Generate a random salt for each user
export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex")
}

export async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const usedSalt = salt || generateSalt()
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, usedSalt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err)
      resolve({
        hash: derivedKey.toString("hex"),
        salt: usedSalt,
      })
    })
  })
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const result = await hashPassword(password, salt)
  return result.hash === hash
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
    return decoded
  } catch (error) {
    return null
  }
}
