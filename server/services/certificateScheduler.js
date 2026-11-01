import cron from 'node-cron';
import { Event } from '../models/Event.js';
import { Attendance } from '../models/Attendance.js';
import { Certificate } from '../models/Certificate.js';
import { Signatory } from '../models/Signatory.js';
import { CollegeSettings } from '../models/CollegeSettings.js';
import { isEligibleForCertificate } from '../utils/certificateEligibility.js';
import { generateCertificatePDF } from './pdfService.js';

let isJobRunning = false;

/**
 * Runs the certificate generation workflow for a specific event
 * @param {Object} event Mongoose Event document
 */
export const processEventCertificates = async (event) => {
  try {
    console.log(`[Scheduler] 📜 Processing automatic certificates for "${event.title}" (${event._id})...`);

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
      signatories = await Signatory.find({ isActive: true }).limit(3);
    }

    // Find all attendees
    const attendances = await Attendance.find({ event: event._id }).populate('student');

    let generatedCount = 0;
    let ineligibleCount = 0;
    let alreadyExistedCount = 0;

    for (const att of attendances) {
      if (!att.student) continue;

      // Authoritative eligibility check
      const eligibility = isEligibleForCertificate(event, att);
      if (!eligibility.eligible) {
        ineligibleCount++;
        continue;
      }

      // Check if already created (idempotent)
      let cert = await Certificate.findOne({
        event: event._id,
        student: att.student._id
      });

      if (cert && cert.status !== 'revoked') {
        alreadyExistedCount++;
        continue;
      }

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

      try {
        await generateCertificatePDF(cert, event, att.student, collegeSettings);
        generatedCount++;
      } catch (pdfErr) {
        console.error(`[Scheduler] ❌ PDF error for ${cert.recipientUSN}:`, pdfErr);
      }
    }

    event.certificatesGenerated = true;
    event.certificatesGeneratedAt = new Date();
    await event.save();

    console.log(
      `[Scheduler] ✅ Finished "${event.title}": ${generatedCount} issued, ${alreadyExistedCount} existed, ${ineligibleCount} ineligible.`
    );
  } catch (error) {
    console.error(`[Scheduler] ❌ Error processing event ${event._id}:`, error);
  }
};

/**
 * Initializes the background cron task (every 5 minutes)
 */
export const initCertificateScheduler = () => {
  // Cron schedule: every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    if (isJobRunning) {
      console.log('[Scheduler] ⏳ Previous certificate job still running, skipping interval.');
      return;
    }

    isJobRunning = true;
    try {
      const now = new Date();
      // Check if override is set in env for testing
      const overrideMinutes = process.env.CERT_DELAY_MINUTES_OVERRIDE
        ? parseInt(process.env.CERT_DELAY_MINUTES_OVERRIDE, 10)
        : null;

      // Find published events where certificates are enabled and not yet generated
      const candidates = await Event.find({
        status: 'published',
        'certificate.enabled': true,
        certificatesGenerated: { $ne: true },
        'certificate.issueMode': { $ne: 'manual-approve' }
      }).populate('club');

      for (const event of candidates) {
        if (!event.endDateTime) continue;

        const endEpoch = new Date(event.endDateTime).getTime();
        let delayMs = (event.certificate?.autoGenerateDelayHours || 2) * 60 * 60 * 1000;

        if (overrideMinutes !== null && !isNaN(overrideMinutes)) {
          delayMs = overrideMinutes * 60 * 1000;
        }

        const eligibilityTime = endEpoch + delayMs;

        if (now.getTime() >= eligibilityTime) {
          await processEventCertificates(event);
        }
      }
    } catch (err) {
      console.error('[Scheduler] ❌ Error in certificate cron run:', err);
    } finally {
      isJobRunning = false;
    }
  });

  console.log('⏰ Certificate Automation Background Scheduler initialized (runs every 5 mins).');
};
