// This file will contain validation schemas for poll forms
// You can use libraries like Zod, Yup, or Joi for validation

export const createPollSchema = {
  title: {
    required: "Poll title is required",
    minLength: {
      value: 3,
      message: "Title must be at least 3 characters long"
    },
    maxLength: {
      value: 200,
      message: "Title must be less than 200 characters"
    }
  },
  description: {
    maxLength: {
      value: 1000,
      message: "Description must be less than 1000 characters"
    }
  },
  options: {
    required: "At least 2 options are required",
    minLength: {
      value: 2,
      message: "At least 2 options are required"
    },
    maxLength: {
      value: 10,
      message: "Maximum 10 options allowed"
    }
  },
  category: {
    required: "Category is required"
  },
  endsAt: {
    validate: (value: string) => {
      if (value) {
        const endDate = new Date(value)
        const now = new Date()
        if (endDate <= now) {
          return "End date must be in the future"
        }
      }
      return true
    }
  }
}

export const voteSchema = {
  pollId: {
    required: "Poll ID is required"
  },
  optionIds: {
    required: "At least one option must be selected",
    validate: (value: string[], poll: any) => {
      if (!poll.allowMultipleVotes && value.length > 1) {
        return "Only one option can be selected for this poll"
      }
      return true
    }
  }
}
