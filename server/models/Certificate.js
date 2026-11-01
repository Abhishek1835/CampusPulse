import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: [true, 'Certificate ID is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required']
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required']
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club'
    },
    usn: {
      type: String,
      uppercase: true,
      trim: true
    },
    recipientUSN: {
      type: String,
      uppercase: true,
      trim: true
    },
    studentName: {
      type: String,
      trim: true
    },
    recipientName: {
      type: String,
      trim: true
    },
    eventTitle: {
      type: String,
      trim: true
    },
    clubName: {
      type: String,
      trim: true
    },
    title: {
      type: String,
      trim: true,
      default: 'Certificate of Participation'
    },
    eventDate: {
      type: Date,
      default: Date.now
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    venue: {
      type: String,
      default: ''
    },
    certificateType: {
      type: String,
      enum: ['participation', 'winner', 'volunteer', 'custom'],
      default: 'participation'
    },
    customText: {
      type: String,
      default: ''
    },
    templateId: {
      type: String,
      default: 'nature-classic'
    },
    pdfPath: {
      type: String,
      default: ''
    },
    qrVerifyUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'issued', 'revoked'],
      default: 'issued'
    },
    issuedAt: {
      type: Date,
      default: Date.now
    },
    revokedAt: {
      type: Date
    },
    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    revokeReason: {
      type: String,
      trim: true,
      default: ''
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    signatoriesSnapshot: [
      {
        name: { type: String, required: true },
        designation: { type: String, required: true },
        department: { type: String, default: '' },
        signatureImage: { type: String, default: '' }
      }
    ],
    collegeSnapshot: {
      name: { type: String, default: 'BMS College of Engineering' },
      affiliation: { type: String, default: 'Autonomous Institute, Affiliated to Visvesvaraya Technological University (VTU), Belagavi' },
      logo: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

// Pre-save normalization
certificateSchema.pre('save', function (next) {
  if (!this.certificateId) {
    const year = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000).toString(36).toUpperCase();
    this.certificateId = `VTU-CEH-${year}-${rand}`;
  }
  if (this.recipientName && !this.studentName) this.studentName = this.recipientName;
  if (this.studentName && !this.recipientName) this.recipientName = this.studentName;
  if (this.recipientUSN && !this.usn) this.usn = this.recipientUSN;
  if (this.usn && !this.recipientUSN) this.recipientUSN = this.usn;
  if (!this.qrVerifyUrl && this.certificateId) {
    const clientBase = process.env.CLIENT_URL || 'http://localhost:5173';
    this.qrVerifyUrl = `${clientBase}/verify/${this.certificateId}`;
  }
  next();
});

// Idempotent constraint: a student can have at most one certificate per event
certificateSchema.index({ event: 1, student: 1 }, { unique: true });
certificateSchema.index({ student: 1, status: 1 });
certificateSchema.index({ event: 1, status: 1 });

export const Certificate = mongoose.model('Certificate', certificateSchema);
