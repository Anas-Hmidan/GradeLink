# MCQ Test Generation Backend

A Next.js-based backend system that generates multiple-choice questions (MCQ) from PDF or Word documents using Google's Gemini AI. Teachers can upload course materials and generate tests with customizable difficulty levels and question counts.

## Features

- 📄 **Document Processing**: Upload PDF or Word (.docx) course materials
- 🤖 **AI-Powered Question Generation**: Uses Google Gemini to create relevant MCQ questions
- 👨‍🏫 **Teacher Dashboard**: Create and manage tests
- 👨‍🎓 **Student Testing**: Take tests with time limits
- ✅ **Automatic Grading**: Instant results with cheating detection
- 🔐 **Authentication**: JWT-based auth with role-based access (teacher/student)
- 🛡️ **Security**: Rate limiting, password hashing with salt, file validation

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB
- **AI**: Google Gemini 1.5 Flash
- **File Processing**: pdf-parse (PDF), mammoth (Word)
- **Authentication**: JWT (jsonwebtoken)
- **Language**: TypeScript

## Prerequisites

- Node.js 18+ 
- MongoDB instance (local or cloud)
- Google Gemini API Key

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB_NAME=exam_generator

   # JWT Configuration (Use a strong random string in production)
   JWT_SECRET=your-secure-jwt-secret-min-32-characters-long

   # Gemini API Configuration
   GEMINI_API_KEY=your-gemini-api-key-here

   # Upload Configuration
   MAX_FILE_SIZE=10485760
   # 10MB in bytes

   # Server Configuration
   NODE_ENV=development
   PORT=3000
   ```

4. **Get a Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file

5. **Set up MongoDB**
   - Install MongoDB locally or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Update `MONGODB_URI` in `.env`

## Running the Application

### Development Mode
```bash
pnpm dev
# or
npm run dev
```

The server will start at `http://localhost:3000`

### Production Mode
```bash
pnpm build
pnpm start
```

## API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "teacher@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "role": "teacher"  // or "student"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "teacher@example.com",
  "password": "SecurePass123"
}
```

### Test Generation (Teachers Only)

#### Generate Test from Document
```http
POST /api/test/generate
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

Form Data:
- file: <PDF or Word file>
- title: "Midterm Exam"
- description: "Chapter 1-5"
- subject: "Mathematics"
- difficulty: "medium"  // easy, medium, or hard
- total_questions: 20
- duration_minutes: 60
```

### Taking Tests

#### Get Test (Students)
```http
GET /api/test/{testId}
Authorization: Bearer <jwt-token>
```

#### Submit Test
```http
POST /api/test/{testId}/submit
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "answers": [
    {
      "question_id": "q-1",
      "selected_answer": 2,
      "time_spent_seconds": 45
    }
  ],
  "total_time_seconds": 3000
}
```

## File Upload Specifications

### Supported File Types
- PDF (`.pdf`)
- Microsoft Word (`.docx`, `.doc`)

### File Size Limits
- Maximum: 10MB (configurable via `MAX_FILE_SIZE` env variable)

### Content Requirements
- Minimum 100 characters of extractable text
- Clear, readable content for best AI generation results

## Security Features

1. **Rate Limiting**
   - Registration: 5 attempts per hour per IP
   - Login: 10 attempts per hour per IP
   - Test Generation: 20 tests per hour per teacher

2. **Password Security**
   - Minimum 8 characters
   - Must contain uppercase, lowercase, and number
   - Salted and hashed using PBKDF2 (100,000 iterations)

3. **File Validation**
   - Type checking
   - Size limits
   - Content validation

4. **JWT Authentication**
   - 7-day expiration
   - Role-based access control
   - Secure token verification

## Database Schema

### Users Collection
```typescript
{
  _id: ObjectId,
  email: string,
  password: string,  // hashed
  salt: string,
  full_name: string,
  role: "teacher" | "student",
  created_at: Date,
  updated_at: Date
}
```

### Tests Collection
```typescript
{
  _id: ObjectId,
  teacher_id: ObjectId,
  title: string,
  description: string,
  subject: string,
  difficulty: "easy" | "medium" | "hard",
  duration_minutes: number,
  total_questions: number,
  questions: [
    {
      id: string,
      question: string,
      options: string[],
      correct_answer: number,  // index 0-3
      explanation: string
    }
  ],
  course_file_name: string,
  created_at: Date,
  updated_at: Date
}
```

### Results Collection
```typescript
{
  _id: ObjectId,
  test_id: ObjectId,
  student_id: ObjectId,
  answers: [
    {
      question_id: string,
      selected_answer: number,
      is_correct: boolean,
      time_spent_seconds: number
    }
  ],
  score: number,
  total_questions: number,
  percentage: number,
  time_taken_seconds: number,
  submitted_at: Date,
  flagged_for_cheating: boolean,
  cheating_reasons: string[]
}
```

## Cheating Detection

The system includes basic cheating detection that flags submissions if:
- Test completed unusually fast (< 10% of allocated time)
- Suspiciously consistent time per question (low variance)

## Error Handling

All API endpoints return consistent error responses:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

## Common Error Codes

- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `RATE_LIMITED`: Too many requests
- `VALIDATION_ERROR`: Input validation failed
- `FILE_TOO_LARGE`: File exceeds size limit
- `INVALID_FILE_TYPE`: Unsupported file format
- `INSUFFICIENT_CONTENT`: Document content too short
- `AI_SERVICE_ERROR`: Gemini API error

## Troubleshooting

### PDF Processing Issues
- Ensure PDF contains actual text (not scanned images)
- Try converting the PDF to a newer format
- Check file isn't password-protected

### Word Document Issues
- Use `.docx` format (newer format works better)
- Avoid complex formatting or embedded objects
- Ensure document isn't corrupted

### Gemini API Errors
- Verify API key is correct and active
- Check you haven't exceeded API quotas
- Ensure you have proper billing enabled (if required)

### Database Connection Issues
- Verify MongoDB is running
- Check connection string format
- Ensure network access is allowed (for MongoDB Atlas)

## Development

### Adding New Features

1. **API Routes**: Add new routes in `app/api/`
2. **Models**: Define schemas in `lib/models/`
3. **Utils**: Add helpers in `lib/utils/`
4. **Middleware**: Add middleware in `lib/middleware/`

### Testing Tips

Use tools like:
- **Postman** or **Insomnia** for API testing
- **MongoDB Compass** for database inspection
- **VS Code REST Client** extension for quick tests

## Production Deployment

1. **Environment Variables**
   - Use strong, random values for `JWT_SECRET`
   - Never commit `.env` files
   - Use environment-specific configurations

2. **Security Checklist**
   - Enable HTTPS
   - Set `NODE_ENV=production`
   - Use secure MongoDB connection (SSL/TLS)
   - Implement proper CORS policies
   - Add request logging
   - Set up monitoring

3. **Performance**
   - Enable MongoDB indexes (see `lib/db.ts`)
   - Configure rate limiting appropriately
   - Consider caching strategies
   - Monitor Gemini API usage and costs

## Known Limitations

1. **File Size**: Large documents may cause timeouts
2. **AI Generation**: Questions quality depends on document content quality
3. **Language**: Currently optimized for English content
4. **Concurrent Uploads**: No queue system for multiple simultaneous uploads

## Future Improvements

- [ ] Add file storage (S3/Cloud Storage) instead of processing on-the-fly
- [ ] Implement question review/edit interface for teachers
- [ ] Add support for images in questions
- [ ] Multiple language support
- [ ] Advanced analytics dashboard
- [ ] Export test results to CSV/PDF
- [ ] Bulk test generation
- [ ] Question bank system
- [ ] Real-time test monitoring

## License

[Add your license here]

## Support

For issues or questions, please [open an issue](your-repo-url/issues) on GitHub.
