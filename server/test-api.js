import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './config/db.js';
import { seedDatabase } from './seed/seedData.js';
import { User } from './models/User.js';
import { Club } from './models/Club.js';
import { Event } from './models/Event.js';
import { Registration } from './models/Registration.js';
import app from './server.js';

dotenv.config();

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 RUNNING COMPREHENSIVE BACKEND ACCEPTANCE TESTS');
  console.log('======================================================\n');

  // Wait for MongoDB connection to be ready and auto-seed to finish
  while (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Ensure DB has seeded events and clubs
  let eventCount = await Event.countDocuments();
  while (eventCount < 10) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    eventCount = await Event.countDocuments();
  }
  console.log(`✅ Database connection confirmed with ${eventCount} events.`);

  const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api`;

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`).then((r) => r.json());
    assert(healthRes.success === true, 'GET /api/health returns success');

    // 2. Fetch clubs
    const clubsRes = await fetch(`${BASE_URL}/clubs`).then((r) => r.json());
    assert(clubsRes.success === true && clubsRes.data.length >= 5, 'GET /api/clubs returns 5+ seeded clubs');

    const firstClub = clubsRes.data[0];
    const clubBySlugRes = await fetch(`${BASE_URL}/clubs/${firstClub.slug}`).then((r) => r.json());
    assert(clubBySlugRes.success === true && clubBySlugRes.data.club.slug === firstClub.slug, 'GET /api/clubs/:slug returns club with upcoming/past events');

    // 3. Fetch events
    const eventsRes = await fetch(`${BASE_URL}/events?limit=20`).then((r) => r.json());
    assert(eventsRes.success === true && eventsRes.data.pagination.total >= 10, 'GET /api/events returns 10+ seeded events');

    const hackathonEvent = eventsRes.data.events.find((e) => e.category === 'hackathon');
    assert(!!hackathonEvent, 'HackVTU hackathon event exists');

    // 4. Test Student Login (Rohan Gupta)
    const studentLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usn: '1BM22CS045', password: 'Password@123' })
    }).then((r) => r.json());
    assert(
      studentLogin.success === true && studentLogin.data.user.role === 'student',
      'POST /api/auth/login succeeds for Student with valid USN and password'
    );
    const studentToken = studentLogin.data.token;

    // 5. Test Organizer Login (Aditya Sharma)
    const orgLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usn: '1BM22CS001', password: 'Password@123' })
    }).then((r) => r.json());
    assert(
      orgLogin.success === true && orgLogin.data.user.role === 'organizer' && !!orgLogin.data.user.club,
      'POST /api/auth/login succeeds for Organizer with club association'
    );
    const orgToken = orgLogin.data.token;

    // 6. Test Invalid USN Format Rejection
    const invalidUsnRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usn: 'INVALID_USN',
        name: 'Test Student',
        email: 'test@invalid.edu',
        phone: '9999999999',
        password: 'Password@123',
        role: 'student'
      })
    }).then((r) => r.json());
    assert(invalidUsnRes.success === false, 'POST /api/auth/register rejects invalid USN format');

    // 7. Test Duplicate USN Rejection
    const dupUsnRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usn: '1BM22CS045', // Already registered
        name: 'Duplicate Student',
        email: 'duplicate@bmsce.ac.in',
        phone: '9999999999',
        password: 'Password@123',
        role: 'student'
      })
    }).then((r) => r.json());
    assert(
      dupUsnRes.success === false && dupUsnRes.message.includes('already registered'),
      'POST /api/auth/register rejects duplicate USN with clear message'
    );

    // 8. Test Organizer Signup without Access Code
    const orgNoCodeRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usn: '1BM22CS099',
        name: 'Unverified Organizer',
        email: 'unverified@bmsce.ac.in',
        phone: '9999999999',
        password: 'Password@123',
        role: 'organizer',
        designation: 'President',
        accessCode: 'WRONG_CODE'
      })
    }).then((r) => r.json());
    assert(
      orgNoCodeRes.success === false && orgNoCodeRes.message.includes('access code'),
      'Organizer signup requires valid ORGANIZER_ACCESS_CODE'
    );

    // 9. Role-based Access Control: Student cannot access organizer routes
    const studentBlockedRes = await fetch(`${BASE_URL}/organizer/stats`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    }).then((r) => r.json());
    assert(
      studentBlockedRes.success === false,
      'RBAC: Student is blocked from /api/organizer/stats (403 Forbidden)'
    );

    // 10. Organizer Stats endpoint
    const orgStatsRes = await fetch(`${BASE_URL}/organizer/stats`, {
      headers: { Authorization: `Bearer ${orgToken}` }
    }).then((r) => r.json());
    assert(
      orgStatsRes.success === true && orgStatsRes.data.overview.totalEvents > 0,
      'RBAC: Organizer accesses /api/organizer/stats with valid metrics'
    );

    // 11. Test Full Capacity Guard (BotWars: capacity 2, both filled)
    const botwarsEvent = eventsRes.data.events.find((e) => e.title.includes('BotWars'));
    if (botwarsEvent) {
      // Create student 3 token
      const s3Login = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usn: '1BM22EC033', password: 'Password@123' })
      }).then((r) => r.json());

      const fullRegRes = await fetch(`${BASE_URL}/events/${botwarsEvent._id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${s3Login.data.token}`
        },
        body: JSON.stringify({ teamName: 'ExtraTeam' })
      }).then((r) => r.json());

      assert(
        fullRegRes.success === false && fullRegRes.message.toLowerCase().includes('capacity'),
        'Registration blocked when event is at full capacity'
      );
    }

    // 12. Test Past Deadline Guard
    const expiredEvent = eventsRes.data.events.find((e) => e.title.includes('Zero-Knowledge'));
    if (expiredEvent) {
      const s3Login = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usn: '1BM22EC033', password: 'Password@123' })
      }).then((r) => r.json());

      const expiredRegRes = await fetch(`${BASE_URL}/events/${expiredEvent._id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${s3Login.data.token}`
        }
      }).then((r) => r.json());

      assert(
        expiredRegRes.success === false && expiredRegRes.message.toLowerCase().includes('deadline'),
        'Registration blocked when deadline has passed'
      );
    }

    // 13. Student successful registration and cancellation
    const aiSeminarEvent = eventsRes.data.events.find((e) => e.title.includes('Demystifying'));
    if (aiSeminarEvent) {
      const s3Login = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usn: '1BM22EC033', password: 'Password@123' })
      }).then((r) => r.json());

      // Register
      const regSuccessRes = await fetch(`${BASE_URL}/events/${aiSeminarEvent._id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${s3Login.data.token}`
        }
      }).then((r) => r.json());
      assert(regSuccessRes.success === true, 'Student successfully registers for an upcoming event');

      // Duplicate registration test
      const dupRegRes = await fetch(`${BASE_URL}/events/${aiSeminarEvent._id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${s3Login.data.token}`
        }
      }).then((r) => r.json());
      assert(
        dupRegRes.success === false && dupRegRes.message.toLowerCase().includes('already registered'),
        'Duplicate registration rejected with clear message'
      );

      // Cancel registration
      const cancelRes = await fetch(`${BASE_URL}/events/${aiSeminarEvent._id}/register`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${s3Login.data.token}` }
      }).then((r) => r.json());
      assert(cancelRes.success === true, 'Student can cancel registration before deadline');
    }

    // 14. Attendance toggle by organizer (own club event)
    const codeforgeClub = await Club.findOne({ slug: 'codeforge' });
    const codeforgeEvents = await Event.find({ club: codeforgeClub._id });
    const cfEventIds = codeforgeEvents.map((e) => e._id);
    const sampleReg = await Registration.findOne({ event: { $in: cfEventIds } });

    if (sampleReg) {
      const attendRes = await fetch(`${BASE_URL}/registrations/${sampleReg._id}/attendance`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${orgToken}`
        },
        body: JSON.stringify({ status: 'attended' })
      }).then((r) => r.json());
      assert(
        attendRes.success === true && attendRes.data.status === 'attended',
        'Organizer toggles student attendance for own club event'
      );
    }

    console.log('\n------------------------------------------------------');
    console.log(`🎯 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('------------------------------------------------------\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
};

runTests().catch((err) => {
  console.error('FATAL TEST RUN ERROR:', err);
  process.exit(1);
});
