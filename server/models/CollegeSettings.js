import mongoose from 'mongoose';

const collegeSettingsSchema = new mongoose.Schema(
  {
    collegeName: {
      type: String,
      default: 'BMS College of Engineering',
      trim: true
    },
    affiliation: {
      type: String,
      default: 'Autonomous Institute, Affiliated to Visvesvaraya Technological University (VTU), Belagavi',
      trim: true
    },
    collegeLogo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1562774053-701939374585?w=300&auto=format&fit=crop&q=80'
    },
    address: {
      type: String,
      default: 'Bull Temple Road, Basavanagudi, Bengaluru - 560019'
    },
    website: {
      type: String,
      default: 'https://www.bmsce.ac.in'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

export const CollegeSettings = mongoose.model('CollegeSettings', collegeSettingsSchema);
