import type { ObjectId } from "mongodb"

export interface Question {
  id: string
  question: string
  options: string[]
  correct_answer: number // index of correct option
  explanation?: string
}

export interface Test {
  _id?: ObjectId
  teacher_id: ObjectId
  title: string
  description: string
  subject: string
  difficulty: "easy" | "medium" | "hard"
  duration_minutes: number
  total_questions: number
  questions: Question[]
  course_file_name?: string
  test_code: string // Unique 8-character code for students to access test
  created_at: Date
  updated_at: Date
}

export interface TestDocument extends Omit<Test, "_id"> {
  _id: ObjectId
}

export const testSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["teacher_id", "title", "subject", "total_questions", "questions", "test_code", "created_at"],
      properties: {
        _id: { bsonType: "objectId" },
        teacher_id: { bsonType: "objectId" },
        title: { bsonType: "string" },
        description: { bsonType: "string" },
        subject: { bsonType: "string" },
        difficulty: { enum: ["easy", "medium", "hard"] },
        duration_minutes: { bsonType: "int" },
        total_questions: { bsonType: "int" },
        questions: { bsonType: "array" },
        test_code: { bsonType: "string" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" },
      },
    },
  },
}
