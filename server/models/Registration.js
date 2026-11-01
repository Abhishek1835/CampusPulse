import mongoose from 'mongoose';
import { REGISTRATION_STATUSES } from '../utils/constants.js';

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required']
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required']
    },
    usn: {
      type: String,
      required: [true, 'USN is required'],
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    branch: {
      type: String,
      default: ''
    },
    year: {
      type: Number,
      default: 1
    },
    teamName: {
      type: String,
      trim: true,
      default: ''
    },
    teamMembers: [
      {
        name: { type: String, required: true },
        usn: { type: String, required: true, uppercase: true, trim: true }
      }
    ],
    status: {
      type: String,
      enum: REGISTRATION_STATUSES,
      default: 'registered'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index ensuring a student registers only once per event
registrationSchema.index({ event: 1, student: 1 }, { unique: true });
registrationSchema.index({ event: 1, status: 1 });
registrationSchema.index({ student: 1, status: 1 });

export const Registration = mongoose.model('Registration', registrationSchema);
