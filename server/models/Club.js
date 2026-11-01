import mongoose from 'mongoose';
import { CLUB_CATEGORIES } from '../utils/constants.js';

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Club name is required'],
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    logo: {
      type: String,
      default: ''
    },
    banner: {
      type: String,
      default: ''
    },
    tagline: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      required: [true, 'Club description is required']
    },
    category: {
      type: String,
      enum: CLUB_CATEGORIES,
      required: [true, 'Category is required']
    },
    foundedYear: {
      type: Number,
      default: () => new Date().getFullYear()
    },
    facultyCoordinator: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' }
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true
    },
    contactPhone: {
      type: String,
      default: ''
    },
    socialLinks: {
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      website: { type: String, default: '' },
      discord: { type: String, default: '' }
    },
    organizers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    isVerified: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const Club = mongoose.model('Club', clubSchema);
