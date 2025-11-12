import type { ObjectId } from "mongodb"

export interface StudentAnswer {
  question_id: string
  selected_answer: number
  is_correct: boolean
  time_spent_seconds: number
}

export interface Result {
  _id?: ObjectId
  test_id: ObjectId
  student_id: ObjectId
  answers: StudentAnswer[]
  score: number
  total_questions: number
  percentage: number
  time_taken_seconds: number
  submitted_at: Date
  flagged_for_cheating: boolean
  cheating_reasons?: string[]
}

export interface ResultDocument extends Omit<Result, "_id"> {
  _id: ObjectId
}

export const resultSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["test_id", "student_id", "answers", "score", "submitted_at"],
      properties: {
        _id: { bsonType: "objectId" },
        test_id: { bsonType: "objectId" },
        student_id: { bsonType: "objectId" },
        answers: { bsonType: "array" },
        score: { bsonType: "int" },
        total_questions: { bsonType: "int" },
        percentage: { bsonType: "double" },
        time_taken_seconds: { bsonType: "int" },
        submitted_at: { bsonType: "date" },
        flagged_for_cheating: { bsonType: "bool" },
        cheating_reasons: { bsonType: "array" },
      },
    },
  },
}
