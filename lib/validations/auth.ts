// This file will contain validation schemas for authentication forms
// You can use libraries like Zod, Yup, or Joi for validation

export const loginSchema = {
  email: {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address"
    }
  },
  password: {
    required: "Password is required",
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters long"
    }
  }
}

export const registerSchema = {
  name: {
    required: "Name is required",
    minLength: {
      value: 2,
      message: "Name must be at least 2 characters long"
    },
    maxLength: {
      value: 50,
      message: "Name must be less than 50 characters"
    }
  },
  email: {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address"
    }
  },
  password: {
    required: "Password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters long"
    },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }
  },
  confirmPassword: {
    required: "Please confirm your password",
    validate: (value: string, formData: any) => {
      if (value !== formData.password) {
        return "Passwords do not match"
      }
      return true
    }
  }
}

export const resetPasswordSchema = {
  email: {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address"
    }
  }
}

export const changePasswordSchema = {
  currentPassword: {
    required: "Current password is required"
  },
  newPassword: {
    required: "New password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters long"
    },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }
  },
  confirmNewPassword: {
    required: "Please confirm your new password",
    validate: (value: string, formData: any) => {
      if (value !== formData.newPassword) {
        return "Passwords do not match"
      }
      return true
    }
  }
}
