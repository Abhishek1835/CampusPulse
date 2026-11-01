import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure storage directory exists
const CERT_STORAGE_DIR =
  process.env.CERT_STORAGE_PATH ||
  path.join(__dirname, '../uploads/certificates');

if (!fs.existsSync(CERT_STORAGE_DIR)) {
  fs.mkdirSync(CERT_STORAGE_DIR, { recursive: true });
}

/**
 * Returns the local file path for a given certificateId
 * @param {string} certificateId
 * @returns {string}
 */
export function getCertificateFilePath(certificateId) {
  return path.join(CERT_STORAGE_DIR, `${certificateId}.pdf`);
}

/**
 * Generate an A4 Landscape Certificate PDF
 * Supports both certData object and (cert, event, student, collegeSettings)
 */
export async function generateCertificatePDF(certOrData, maybeEvent, maybeStudent, maybeCollegeSettings) {
  const clientBase = process.env.CLIENT_URL || 'http://localhost:5173';
  let certData = {};

  if (maybeEvent || certOrData.recipientName || certOrData.studentName || certOrData.signatoriesSnapshot) {
    const cert = certOrData;
    const event = maybeEvent || cert.event;
    const student = maybeStudent || cert.student;
    const collegeSettings = maybeCollegeSettings || cert.collegeSnapshot;

    certData = {
      certificateId: cert.certificateId,
      studentName: cert.recipientName || cert.studentName || student?.name || 'Student',
      usn: cert.recipientUSN || cert.usn || student?.usn || '',
      eventTitle: cert.eventTitle || event?.title || 'College Event',
      clubName: cert.clubName || (event?.club?.name ? event.club.name : (event?.club ? String(event.club) : 'College Club')),
      eventDate: cert.eventDate || cert.issueDate || event?.date || new Date(),
      venue: cert.venue || event?.venue || 'Campus Auditorium',
      certificateType: cert.certificateType || event?.certificate?.type || 'participation',
      customText: cert.customText || event?.certificate?.customText || '',
      templateId: cert.templateId || event?.certificate?.templateId || 'classic',
      qrVerifyUrl: cert.qrVerifyUrl || `${clientBase}/verify/${cert.certificateId}`,
      signatories: cert.signatoriesSnapshot || [],
      collegeSettings: cert.collegeSnapshot || collegeSettings || {}
    };
  } else {
    certData = { ...certOrData };
    if (!certData.qrVerifyUrl && certData.certificateId) {
      certData.qrVerifyUrl = `${clientBase}/verify/${certData.certificateId}`;
    }
  }

  const {
    certificateId,
    studentName,
    usn,
    eventTitle,
    clubName,
    eventDate,
    venue,
    certificateType = 'participation',
    customText = '',
    templateId = 'classic',
    qrVerifyUrl,
    signatories = [],
    collegeSettings = {}
  } = certData;

  const fileName = `${certificateId}.pdf`;
  const filePath = path.join(CERT_STORAGE_DIR, fileName);
  const relativeUrl = `/uploads/certificates/${fileName}`;

  // Generate QR Code Buffer for verification
  const qrCodeBuffer = await QRCode.toBuffer(qrVerifyUrl, {
    margin: 1,
    width: 90,
    color: {
      dark: '#2F3A2C',
      light: '#FAF5E9'
    }
  });

  return new Promise((resolve, reject) => {
    // A4 Landscape: 841.89 x 595.28 points
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 0,
      info: {
        Title: `${eventTitle} - Certificate of ${certificateType}`,
        Author: clubName,
        Subject: `Certificate for ${studentName} (${usn})`,
        Keywords: 'VTU, College Event, Certificate, Verified'
      }
    });

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    const width = 841.89;
    const height = 595.28;

    // 1. Background Fill: Warm Cream Paper (#FAF5E9)
    doc.rect(0, 0, width, height).fill('#FAF5E9');

    // 2. Borders & Ornaments based on template
    if (templateId === 'modern-garden') {
      drawModernGardenBorders(doc, width, height);
    } else if (templateId === 'minimal') {
      drawMinimalBorders(doc, width, height);
    } else {
      drawClassicBorders(doc, width, height);
    }

    // 3. College Header & Affiliation
    const collegeName = collegeSettings.collegeName || 'BMS COLLEGE OF ENGINEERING';
    const affiliation =
      collegeSettings.affiliation ||
      'Autonomous Institute, Affiliated to Visvesvaraya Technological University (VTU), Belagavi';

    doc
      .fillColor('#2F3A2C')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(collegeName.toUpperCase(), 50, 48, { align: 'center', width: width - 100 });

    doc
      .fillColor('#6F7565')
      .fontSize(9)
      .font('Helvetica')
      .text(affiliation, 50, 70, { align: 'center', width: width - 100 });

    // Decorative divider line
    doc
      .lineWidth(1)
      .strokeColor('#5F7F5B')
      .moveTo(width / 2 - 120, 88)
      .lineTo(width / 2 + 120, 88)
      .stroke();

    // 4. Club Crest / Subtitle
    doc
      .fillColor('#C9895A')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(`PRESENTED BY ${clubName.toUpperCase()}`, 50, 96, {
        align: 'center',
        width: width - 100
      });

    // 5. Certificate Main Title
    let titleText = 'CERTIFICATE OF PARTICIPATION';
    if (certificateType === 'winner') titleText = 'CERTIFICATE OF MERIT & ACHIEVEMENT';
    else if (certificateType === 'volunteer') titleText = 'CERTIFICATE OF APPRECIATION';
    else if (certificateType === 'custom') titleText = 'CERTIFICATE OF EXCELLENCE';

    doc
      .fillColor('#2F3A2C')
      .fontSize(24)
      .font('Times-Bold')
      .text(titleText, 50, 126, { align: 'center', width: width - 100 });

    // 6. Presentation Lead-in
    doc
      .fillColor('#6F7565')
      .fontSize(12)
      .font('Times-Italic')
      .text('This is to proudly certify that', 50, 168, {
        align: 'center',
        width: width - 100
      });

    // 7. Student Name & USN
    doc
      .fillColor('#2F3A2C')
      .fontSize(26)
      .font('Times-Bold')
      .text(studentName, 50, 192, {
        align: 'center',
        width: width - 100
      });

    doc
      .fillColor('#5F7F5B')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(`UNIVERSITY SEAT NUMBER: ${usn}`, 50, 226, {
        align: 'center',
        width: width - 100
      });

    // 8. Event Participation Body Text
    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    let mainSentence = `has actively participated in "${eventTitle}" organised by ${clubName} on ${formattedDate}`;
    if (venue) mainSentence += ` at ${venue}.`;
    else mainSentence += '.';

    doc
      .fillColor('#3B4538')
      .fontSize(12)
      .font('Times-Roman')
      .text(mainSentence, 120, 252, {
        align: 'center',
        width: width - 240,
        lineGap: 4
      });

    if (customText) {
      doc
        .fillColor('#6F7565')
        .fontSize(10.5)
        .font('Times-Italic')
        .text(customText, 140, 305, {
          align: 'center',
          width: width - 280
        });
    }

    // 9. QR Verification Code & Seal (Bottom Left)
    try {
      doc.image(qrCodeBuffer, 65, height - 150, { width: 75, height: 75 });
    } catch (e) {
      // fallback if image embed issue
    }

    doc
      .fillColor('#6F7565')
      .fontSize(7.5)
      .font('Helvetica')
      .text('Scan to Verify Legitimacy', 60, height - 70, { width: 95, align: 'center' });

    doc
      .fillColor('#2F3A2C')
      .fontSize(8)
      .font('Helvetica-Bold')
      .text(certificateId, 60, height - 60, { width: 95, align: 'center' });

    // 10. Signatories (Bottom Right / Center)
    const activeSignatories = signatories.slice(0, 3);
    const count = Math.max(activeSignatories.length, 1);
    const startX = 220;
    const availableWidth = width - startX - 70;
    const colWidth = availableWidth / count;

    activeSignatories.forEach((sig, index) => {
      const x = startX + index * colWidth;
      const sigY = height - 155;

      // Draw signature line
      doc
        .lineWidth(0.8)
        .strokeColor('#A9AF9C')
        .moveTo(x + 20, sigY + 55)
        .lineTo(x + colWidth - 20, sigY + 55)
        .stroke();

      // If signature image exists and is base64 data URL or readable buffer
      if (sig.signatureImage) {
        try {
          if (sig.signatureImage.startsWith('data:image')) {
            const base64Data = sig.signatureImage.replace(/^data:image\/\w+;base64,/, '');
            const imgBuffer = Buffer.from(base64Data, 'base64');
            doc.image(imgBuffer, x + colWidth / 2 - 40, sigY + 5, {
              fit: [80, 45],
              align: 'center'
            });
          }
        } catch (err) {
          // graceful fallback
        }
      }

      // Name & Designation
      doc
        .fillColor('#2F3A2C')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(sig.name, x, sigY + 62, { width: colWidth, align: 'center' });

      doc
        .fillColor('#6F7565')
        .fontSize(8)
        .font('Helvetica')
        .text(sig.designation, x, sigY + 76, { width: colWidth, align: 'center' });

      if (sig.department) {
        doc
          .fillColor('#6F7565')
          .fontSize(7)
          .font('Helvetica')
          .text(sig.department, x, sigY + 87, { width: colWidth, align: 'center' });
      }
    });

    // 11. Security Watermark & Verification Footer
    doc
      .fillColor('#A9AF9C')
      .fontSize(7)
      .font('Helvetica')
      .text(
        `Digital Certificate Authenticated by CampusPulse • Generated on ${new Date().toLocaleDateString()} • Unique ID: ${certificateId}`,
        0,
        height - 30,
        { width, align: 'center' }
      );

    doc.end();

    writeStream.on('finish', () => {
      resolve(filePath);
    });

    writeStream.on('error', (err) => {
      reject(err);
    });
  });
}

function drawClassicBorders(doc, width, height) {
  // Outer matcha border
  doc
    .lineWidth(4)
    .strokeColor('#5F7F5B')
    .rect(20, 20, width - 40, height - 40)
    .stroke();

  // Inner honey border
  doc
    .lineWidth(1)
    .strokeColor('#D8B168')
    .rect(26, 26, width - 52, height - 52)
    .stroke();

  // Corner floral flourishes (clean vector corners)
  const cornerSize = 14;
  const corners = [
    [32, 32],
    [width - 32 - cornerSize, 32],
    [32, height - 32 - cornerSize],
    [width - 32 - cornerSize, height - 32 - cornerSize]
  ];

  corners.forEach(([cx, cy]) => {
    doc
      .lineWidth(0.8)
      .strokeColor('#5F7F5B')
      .rect(cx, cy, cornerSize, cornerSize)
      .stroke();
  });
}

function drawModernGardenBorders(doc, width, height) {
  // Soft double sage frame
  doc
    .lineWidth(2.5)
    .strokeColor('#5F7F5B')
    .rect(24, 24, width - 48, height - 48)
    .stroke();

  doc
    .lineWidth(0.8)
    .strokeColor('#DCE6D2')
    .rect(30, 30, width - 60, height - 60)
    .stroke();
}

function drawMinimalBorders(doc, width, height) {
  // Clean single frame with muted moss
  doc
    .lineWidth(1.5)
    .strokeColor('#2F3A2C')
    .rect(30, 30, width - 60, height - 60)
    .stroke();
}
