import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
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
    usn: {
      type: String,
      required: [true, 'USN is required'],
      uppercase: true,
      trim: true
    },
    checkInTime: {
      type: Date,
      default: Date.now
    },
    checkOutTime: {
      type: Date
    },
    status: {
      type: String,
      enum: ['on-time', 'late', 'absent', 'manual'],
      required: true
    },
    method: {
      type: String,
      enum: ['qr', 'code', 'manual'],
      default: 'qr'
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    manualReason: {
      type: String,
      trim: true,
      default: ''
    },
    durationMinutes: {
      type: Number,
      default: 0
    },
    ip: {
      type: String,
      default: ''
    },
    deviceInfo: {
      type: String,
      default: ''
    },
    geofenceVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index ensuring one attendance record per student per event
attendanceSchema.index({ event: 1, student: 1 }, { unique: true });
attendanceSchema.index({ event: 1, status: 1 });
attendanceSchema.index({ student: 1, status: 1 });
attendanceSchema.index({ usn: 1 });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
