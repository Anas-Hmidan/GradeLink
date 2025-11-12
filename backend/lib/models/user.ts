import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  password: string // hashed
  salt: string // password salt
  full_name: string
  role: "teacher" | "student"
  created_at: Date
  updated_at: Date
}

export interface UserDocument extends Omit<User, "_id"> {
  _id: ObjectId
}

export const userSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password", "full_name", "role", "created_at"],
      properties: {
        _id: { bsonType: "objectId" },
        email: { bsonType: "string" },
        password: { bsonType: "string" },
        full_name: { bsonType: "string" },
        role: { enum: ["teacher", "student"] },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" },
      },
    },
  },
}
