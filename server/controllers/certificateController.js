import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const archiver = require('archiver');
import { Certificate } from '../models/Certificate.js';
import { Attendance } from '../models/Attendance.js';
import { Event } from '../models/Event.js';
import { User } from '../models/User.js';
import { CollegeSettings } from '../models/CollegeSettings.js';
import { Signatory } from '../models/Signatory.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/apiResponse.js';
import { isEligibleForCertificate } from '../utils/certificateEligibility.js';
import { generateCertificatePDF, getCertificateFilePath } from '../services/pdfService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to mask USN for public verification (e.g. 1BM22CS045 -> 1BM22CS***)
const maskUSN = (usn) => {
  if (!usn || usn.length <= 4) return '***';
  const visiblePart = usn.slice(0, Math.max(3, usn.length - 3));
  return visiblePart + '***';
};

// @desc    Get Current Student's Certificates
// @route   GET /api/certificates/mine
// @access  Private (Student)
export const getMyCertificates = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  // 1. Fetch Issued Certificates
  const certificates = await Certificate.find({
    student: studentId,
    status: { $ne: 'revoked' }
  })
    .populate('event', 'title startDate endDate banner category club')
    .populate('club', 'name logo slug')
    .sort({ issueDate: -1 });

  // 2. Fetch Attended Events where student was late/ineligible (for informative UX card)
  const attendances = await Attendance.find({
    student: studentId,
    status: { $in: ['late', 'absent'] }
  }).populate('event', 'title startDate endDate certificate attendance');

  const ineligibleNotes = attendances
    .filter((a) => a.event && a.event.certificate?.enabled && !a.event.attendance?.allowLateCertificates)
    .map((a) => ({
      eventId: a.event._id,
      eventTitle: a.event.title,
      attendanceStatus: a.status,
      checkInTime: a.checkInTime,
      reason: 'Attendance was marked late (outside the allowed on-time grace period). Certificates are awarded for verified on-time attendance only.'
    }));

  res.status(200).json({
    success: true,
    data: {
      certificates,
      ineligibleNotes
    }
  });
});

// @desc    Download Certificate PDF
// @route   GET /api/certificates/:id/download
// @access  Public / Student
export const downloadCertificate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Can find by Mongo ID or custom certificateId
  let certificate = await Certificate.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { certificateId: id.toUpperCase() }]
  })
    .populate('event')
    .populate('student')
    .populate('club');

  if (!certificate) {
    return res.status(404).json({
      success: false,
      message: 'Certificate not found.'
    });
  }

  if (certificate.status === 'revoked') {
    return res.status(403).json({
      success: false,
      message: `This certificate was revoked on ${new Date(certificate.revokedAt).toLocaleDateString()}. Reason: ${certificate.revokeReason}`
    });
  }

  // Ensure PDF file exists on disk, or regenerate on the fly
  let filePath = getCertificateFilePath(certificate.certificateId);
  if (!fs.existsSync(filePath)) {
    const collegeSettings = await CollegeSettings.findOne();
    filePath = await generateCertificatePDF(certificate, certificate.event, certificate.student, collegeSettings);
  }

  // Increment download counter
  certificate.downloadCount = (certificate.downloadCount || 0) + 1;
  await certificate.save();

  const fileName = `${certificate.certificateId}_${certificate.recipientName.replace(/[^a-z0-9]/gi, '_')}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// @desc    View Certificate PDF in Browser (inline preview)
// @route   GET /api/certificates/:id/view
// @access  Public
export const viewCertificateInline = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let certificate = await Certificate.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { certificateId: id.toUpperCase() }]
  })
    .populate('event')
    .populate('student')
    .populate('club');

  if (!certificate) {
    return res.status(404).json({ success: false, message: 'Certificate not found.' });
  }

  let filePath = getCertificateFilePath(certificate.certificateId);
  if (!fs.existsSync(filePath)) {
    const collegeSettings = await CollegeSettings.findOne();
    filePath = await generateCertificatePDF(certificate, certificate.event, certificate.student, collegeSettings);
  }

  const fileName = `${certificate.certificateId}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// @desc    Get All Certificates for an Event
// @route   GET /api/events/:id/certificates
// @access  Private (Organizer)
export const getEventCertificates = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.query;

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  // Authorization check
  const userClubId = req.user.club?._id ? req.user.club._id.toString() : req.user.club?.toString();
  const eventClubId = event.club?._id ? event.club._id.toString() : event.club?.toString();
  if (!userClubId || userClubId !== eventClubId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized to view certificates for this event.'
    });
  }

  const query = { event: id };
  if (status && status !== 'all') {
    query.status = status;
  }

  const certificates = await Certificate.find(query)
    .populate('student', 'name usn email branch year')
    .sort({ issueDate: -1 });

  res.status(200).json({
    success: true,
    data: {
      eventTitle: event.title,
      certificateConfig: event.certificate,
      certificatesGenerated: event.certificatesGenerated,
      certificatesGeneratedAt: event.certificatesGeneratedAt,
      certificates
    }
  });
});

// @desc    Generate Certificates for All Eligible Attendees (Manual Override or Automatic Trigger)
// @route   POST /api/events/:id/certificates/generate
// @access  Private (Organizer)
export const generateEventCertificatesNow = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id).populate('club');
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  // Authorization check
  const userClubId = req.user.club?._id ? req.user.club._id.toString() : req.user.club?.toString();
  const eventClubId = event.club?._id ? event.club._id.toString() : event.club?.toString();
  if (!userClubId || userClubId !== eventClubId) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized to generate certificates for this event.'
    });
  }

  if (!event.certificate?.enabled) {
    return res.status(400).json({
      success: false,
      message: 'Certificate generation is not enabled in this event settings.'
    });
  }

  // Load College Settings and Signatories
  const collegeSettings = await CollegeSettings.findOne();
  let signatories = [];
  if (event.certificate.signatories && event.certificate.signatories.length > 0) {
    signatories = await Signatory.find({
      _id: { $in: event.certificate.signatories },
      isActive: true
    });
  }
  if (signatories.length === 0) {
    // Fallback: load any active signatories
    signatories = await Signatory.find({ isActive: true }).limit(3);
  }

  // Find all attendance records for this event
  const attendances = await Attendance.find({ event: id }).populate('student');

  let generatedCount = 0;
  let alreadyExistingCount = 0;
  let ineligibleCount = 0;

  for (const att of attendances) {
    if (!att.student) continue;

    // Check eligibility rule
    const eligibility = isEligibleForCertificate(event, att);
    if (!eligibility.eligible) {
      ineligibleCount++;
      continue;
    }

    // Check if certificate already generated (idempotent)
    let cert = await Certificate.findOne({ event: id, student: att.student._id });
    if (cert && cert.status !== 'revoked') {
      alreadyExistingCount++;
      continue;
    }

    // Generate new Certificate record
    if (!cert) {
      const year = new Date().getFullYear();
      const rand = Math.floor(100000 + Math.random() * 900000).toString(36).toUpperCase();
      cert = new Certificate({
        certificateId: `VTU-CEH-${year}-${rand}`,
        event: event._id,
        student: att.student._id,
        club: event.club?._id || event.club,
        recipientName: att.student.name,
        recipientUSN: att.usn || att.student.usn,
        certificateType: event.certificate.type || 'participation',
        templateId: event.certificate.templateId || 'nature-classic',
        title: event.certificate.title || 'Certificate of Participation',
        customText: event.certificate.customText || '',
        issueDate: new Date(),
        signatoriesSnapshot: signatories.map((s) => ({
          name: s.name,
          designation: s.designation,
          department: s.department,
          signatureImage: s.signatureImage
        })),
        collegeSnapshot: {
          name: collegeSettings?.collegeName || 'BMS College of Engineering',
          affiliation: collegeSettings?.affiliation || 'Autonomous Institute, Affiliated to Visvesvaraya Technological University (VTU), Belagavi',
          logo: collegeSettings?.collegeLogo || ''
        },
        status: 'issued'
      });
      await cert.save();
    }

    // Generate the PDF file
    try {
      await generateCertificatePDF(cert, event, att.student, collegeSettings);
      generatedCount++;
    } catch (pdfErr) {
      console.error(`Failed to generate PDF for ${cert.recipientUSN}:`, pdfErr);
    }
  }

  // Update Event record
  event.certificatesGenerated = true;
  event.certificatesGeneratedAt = new Date();
  await event.save();

  sendResponse(res, 200, `Certificates processing complete: ${generatedCount} generated, ${alreadyExistingCount} already existed, ${ineligibleCount} ineligible.`, {
    generatedCount,
    alreadyExistingCount,
    ineligibleCount,
    totalProcessed: attendances.length
  });
});

// @desc    Re-generate a single certificate PDF
// @route   POST /api/certificates/:id/regenerate
// @access  Private (Organizer)
export const regenerateCertificate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const certificate = await Certificate.findById(id)
    .populate('event')
    .populate('student')
    .populate('club');

  if (!certificate) {
    return res.status(404).json({ success: false, message: 'Certificate not found.' });
  }

  // Refresh student name and USN from database if changed
  if (certificate.student) {
    certificate.recipientName = certificate.student.name;
    certificate.recipientUSN = certificate.student.usn;
  }

  const collegeSettings = await CollegeSettings.findOne();
  await generateCertificatePDF(certificate, certificate.event, certificate.student, collegeSettings);
  await certificate.save();

  sendResponse(res, 200, 'Certificate regenerated successfully', certificate);
});

// @desc    Revoke a Certificate
// @route   POST /api/certificates/:id/revoke
// @access  Private (Organizer)
export const revokeCertificate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || reason.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: 'A mandatory revocation reason is required.'
    });
  }

  const certificate = await Certificate.findById(id);
  if (!certificate) {
    return res.status(404).json({ success: false, message: 'Certificate not found.' });
  }

  certificate.status = 'revoked';
  certificate.revokedAt = new Date();
  certificate.revokedBy = req.user._id;
  certificate.revokeReason = reason.trim();
  await certificate.save();

  sendResponse(res, 200, 'Certificate revoked successfully', certificate);
});

// @desc    Bulk Download All Certificates as ZIP Archive
// @route   GET /api/events/:id/certificates/zip
// @access  Private (Organizer)
export const bulkDownloadCertificatesZip = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  const certificates = await Certificate.find({
    event: id,
    status: 'issued'
  }).populate('student');

  if (certificates.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No issued certificates found for this event to export.'
    });
  }

  const collegeSettings = await CollegeSettings.findOne();

  // Set HTTP ZIP headers
  const zipFilename = `${event.title.replace(/[^a-z0-9]/gi, '_')}_Certificates.zip`;
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('error', (err) => {
    console.error('Archiver error:', err);
    res.status(500).send({ error: err.message });
  });

  archive.pipe(res);

  // Add each certificate PDF to archive
  for (const cert of certificates) {
    let filePath = getCertificateFilePath(cert.certificateId);
    if (!fs.existsSync(filePath)) {
      try {
        filePath = await generateCertificatePDF(cert, event, cert.student, collegeSettings);
      } catch (err) {
        console.error(`Failed to generate PDF for ${cert.certificateId}:`, err);
        continue;
      }
    }

    if (fs.existsSync(filePath)) {
      const entryName = `${cert.certificateId}_${cert.recipientUSN}_${cert.recipientName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      archive.file(filePath, { name: entryName });
    }
  }

  await archive.finalize();
});

// @desc    Public Verification Endpoint (No Auth, Rate-Limited)
// @route   GET /api/verify/:certificateId
// @access  Public
export const verifyCertificatePublic = asyncHandler(async (req, res) => {
  const { certificateId } = req.params;

  if (!certificateId || certificateId.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Certificate ID is required.'
    });
  }

  const normalizedId = certificateId.trim().toUpperCase();

  const certificate = await Certificate.findOne({ certificateId: normalizedId })
    .populate('event', 'title startDate endDate category venue')
    .populate('club', 'name logo slug');

  if (!certificate) {
    return res.status(404).json({
      success: false,
      verified: false,
      status: 'not_found',
      message: `No certificate found with ID "${normalizedId}". Please verify the code on your credential.`
    });
  }

  const isRevoked = certificate.status === 'revoked';

  res.status(200).json({
    success: true,
    verified: !isRevoked,
    status: certificate.status,
    data: {
      certificateId: certificate.certificateId,
      recipientName: certificate.recipientName,
      maskedUSN: maskUSN(certificate.recipientUSN),
      eventTitle: certificate.event?.title || 'College Event',
      clubName: certificate.club?.name || 'College Club',
      issueDate: certificate.issueDate,
      certificateType: certificate.certificateType,
      title: certificate.title,
      signatories: certificate.signatoriesSnapshot.map((s) => ({
        name: s.name,
        designation: s.designation,
        department: s.department
      })),
      collegeName: certificate.collegeSnapshot?.name || 'BMS College of Engineering',
      affiliation: certificate.collegeSnapshot?.affiliation || '',
      downloadUrl: isRevoked ? null : `/api/certificates/${certificate.certificateId}/download`,
      revocation: isRevoked
        ? {
            revokedAt: certificate.revokedAt,
            reason: certificate.revokeReason
          }
        : null
    }
  });
});
