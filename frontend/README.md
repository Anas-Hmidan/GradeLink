# 🎓 TeachAI - MCQ Test Generation Platform

## Frontend Application

AI-powered multiple-choice question generator from PDF/Word documents using Google Gemini.

---

## 🎯 Features

### For Teachers:
- 📄 **Upload course materials** (PDF/Word documents)
- 🤖 **AI-generated questions** using Google Gemini
- ⚙️ **Customizable tests** (difficulty, question count, time limits)
- 📊 **Track student performance** (coming soon)
- 🎨 **Beautiful, modern UI** with dark mode support

### For Students:
- ✍️ **Take tests online** with intuitive interface
- ⏱️ **Timed tests** with countdown timer
- 🧭 **Question navigator** to easily move between questions
- ✅ **Instant results** with score and percentage
- 🚨 **Cheating detection** based on time patterns

---

## 🚀 Quick Start

### Prerequisites:
- Node.js v18+
- pnpm (or npm)
- Backend server running on port 3000

### Installation:
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Frontend runs on **http://localhost:3001**

See `QUICK_START.md` for detailed walkthrough.

---

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Home (redirects to dashboard)
│   ├── layout.tsx           # Root layout with AuthProvider
│   ├── login/               # Login page
│   ├── dashboard/           # Teacher/Student dashboard
│   ├── create-test/         # Test creation with file upload
│   ├── test/[id]/           # Student test-taking interface
│   ├── tests/[id]/          # Teacher test view (legacy)
│   └── results/             # Results page
├── components/              # Reusable React components
│   ├── ui/                  # shadcn/ui components
│   ├── file-upload.tsx      # Drag-and-drop file upload
│   ├── login-form.tsx       # Login/signup form with role selector
│   ├── dashboard-header.tsx # Navigation header
│   └── ...
├── context/                 # React Context
│   └── auth-context.tsx    # Authentication with role management
├── lib/                     # Utilities
│   ├── axios.ts            # Axios instance with interceptors
│   ├── navigation.ts       # Next.js navigation wrappers
│   └── utils.ts            # Helper functions
├── types/                   # TypeScript types
│   └── auth.ts             # User and auth types
└── styles/                  # Global styles
    └── globals.css
```

---

## 🔧 Configuration

### Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Change for production:
```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

---

## 🎨 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **State Management**: React Context API

---

## 📡 API Integration

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in

### Tests (Teacher)
- `POST /api/test/generate` - Generate test from document
- `GET /api/tests` - List all tests

### Tests (Student)
- `GET /api/test/{id}` - Get test questions
- `POST /api/test/{id}/submit` - Submit answers

See `INTEGRATION_COMPLETE.md` for full API documentation.

---

## 🔐 Authentication Flow

1. User registers with email, password, name, and role (teacher/student)
2. JWT token received and stored in localStorage
3. Token automatically included in all API requests via Axios interceptor
4. Token expires after 7 days → auto-redirect to login
5. Role-based UI elements shown/hidden based on user role

---

## 📝 Key Features Implemented

### ✅ File Upload System
- Drag-and-drop interface
- File type validation (PDF, DOCX, DOC)
- Size validation (max 10MB)
- Real-time upload progress
- User-friendly error messages

### ✅ Test Generation
- Multi-stage loading states:
  1. Uploading document
  2. Processing document
  3. Generating questions with AI
- Comprehensive error handling
- Success feedback with redirect

### ✅ Test Taking Interface
- Question-by-question navigation
- Visual question navigator
- Countdown timer with color warnings
- Time tracking per question (for cheating detection)
- Auto-submit on timeout
- Results display with score/percentage

### ✅ Role-Based Access Control
- Different dashboards for teachers vs students
- Teachers can create tests
- Students can take tests
- Role shown in header
- Protected routes

---

## 🧪 Testing

### Manual Testing:
```bash
# Run lint
pnpm lint

# Build for production
pnpm build

# Run production build
pnpm start
```

### Test Flows:

**Teacher Flow:**
1. Register as teacher
2. Login
3. Click "Create Test"
4. Upload PDF/Word document
5. Fill test details
6. Generate test
7. View test details

**Student Flow:**
1. Register as student
2. Login
3. Navigate to /test/{id}
4. Take test
5. Submit answers
6. View results

---

## 🐛 Known Issues

1. **Tests list endpoint** - Backend `/api/tests` might not be implemented yet
2. **No pagination** - Will be slow with many tests
3. **No test editing** - Can't modify generated questions yet
4. **No test sharing** - Must manually share test ID
5. **No results page** - Backend endpoint not implemented

---

## 📚 Documentation

- **Quick Start**: `QUICK_START.md` - Get running in 5 minutes
- **Integration Guide**: `INTEGRATION_COMPLETE.md` - Full technical details
- **Migration Guide**: `MIGRATION_GUIDE.md` - Fix common issues
- **Summary**: `FRONTEND_UPDATES_SUMMARY.md` - All changes made

---

## 🔄 Recent Updates

### Major Changes (Latest):
1. ✅ Fixed Next.js navigation (removed react-router-dom)
2. ✅ Added file upload for test generation
3. ✅ Implemented proper JWT token handling
4. ✅ Added role-based authentication
5. ✅ Created student test-taking interface
6. ✅ Comprehensive error handling
7. ✅ Loading states for better UX

---

## 🛠️ Development Commands

```bash
# Install dependencies
pnpm install

# Start dev server (port 3001)
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Run linter
pnpm lint
```

---

## 🎯 Roadmap

### Coming Soon:
- [ ] Test list pagination
- [ ] Test search and filtering
- [ ] Teacher view of student results
- [ ] Test editing capability
- [ ] Test sharing via links
- [ ] Analytics dashboard
- [ ] Question bank
- [ ] Test templates
- [ ] Bulk test operations

---

## 💡 Tips

1. **Use real documents**: Make sure PDFs/Word docs have extractable text (not scanned images)
2. **File size matters**: Keep documents under 10MB
3. **Good content**: More detailed course content = better questions
4. **Test both roles**: Create separate accounts for teacher and student
5. **Check console**: Browser DevTools console shows helpful errors

---

## 🤝 Contributing

This is a educational project. Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- AI powered by [Google Gemini](https://deepmind.google/technologies/gemini/)

---

## 📞 Support

Having issues?
1. Check `QUICK_START.md` for setup help
2. Check `MIGRATION_GUIDE.md` for common fixes
3. Check browser console for errors
4. Check backend logs
5. Review `INTEGRATION_COMPLETE.md` for technical details

---

## 🎉 Status

✅ **Frontend is fully functional and ready to use!**

All critical features implemented and tested. Compatible with latest backend API.

**Happy test generating!** 🚀
