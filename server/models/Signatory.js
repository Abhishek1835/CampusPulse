import mongoose from 'mongoose';

const signatorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Signatory name is required'],
      trim: true
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true
    },
    department: {
      type: String,
      trim: true,
      default: ''
    },
    signatureImage: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club'
    }
  },
  {
    timestamps: true
  }
);

signatorySchema.index({ club: 1, isActive: 1 });
signatorySchema.index({ isActive: 1 });

export const Signatory = mongoose.model('Signatory', signatorySchema);
