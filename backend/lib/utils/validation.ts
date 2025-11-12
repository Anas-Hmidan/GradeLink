export interface ValidationError {
  field: string
  message: string
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function validateRegistration(email: string, password: string, fullName: string) {
  const errors: ValidationError[] = []

  if (!email || !validateEmail(email)) {
    errors.push({ field: "email", message: "Valid email is required" })
  }

  const passwordValidation = validatePassword(password)
  if (!passwordValidation.valid) {
    errors.push({ field: "password", message: passwordValidation.errors.join("; ") })
  }

  if (!fullName || fullName.trim().length < 2) {
    errors.push({ field: "full_name", message: "Full name must be at least 2 characters" })
  }

  return errors
}

export function validateTestCreation(title: string, subject: string, totalQuestions: number) {
  const errors: ValidationError[] = []

  if (!title || title.trim().length < 3) {
    errors.push({ field: "title", message: "Test title must be at least 3 characters" })
  }

  if (!subject || subject.trim().length < 2) {
    errors.push({ field: "subject", message: "Subject is required" })
  }

  if (!totalQuestions || totalQuestions < 1 || totalQuestions > 100) {
    errors.push({ field: "total_questions", message: "Total questions must be between 1 and 100" })
  }

  return errors
}
