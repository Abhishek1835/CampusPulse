import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { USN_REGEX } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    usn: {
      type: String,
      required: [true, 'USN is required'],
      unique: true,
      trim: true,
      uppercase: true,
      validate: {
        validator: function (v) {
          return USN_REGEX.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid USN. Format: 1BM22CS045 (VTU standard)`
      }
    },
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters']
    },
    role: {
      type: String,
      enum: ['student', 'organizer'],
      default: 'student',
      required: true
    },
    branch: {
      type: String,
      trim: true
    },
    year: {
      type: Number,
      enum: [1, 2, 3, 4]
    },
    designation: {
      type: String,
      trim: true
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club'
    },
    avatar: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Pre-save normalization and hashing
userSchema.pre('save', async function (next) {
  if (this.isModified('usn')) {
    this.usn = this.usn.trim().toUpperCase();
  }
  if (this.isModified('email')) {
    this.email = this.email.trim().toLowerCase();
  }
  if (!this.isModified('passwordHash')) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);
