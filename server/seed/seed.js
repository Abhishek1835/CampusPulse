import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import { seedDatabase } from './seedData.js';
import { Registration } from '../models/Registration.js';
import { Event } from '../models/Event.js';
import { Club } from '../models/Club.js';
import { User } from '../models/User.js';
import { Attendance } from '../models/Attendance.js';
import { Certificate } from '../models/Certificate.js';
import { Signatory } from '../models/Signatory.js';
import { CollegeSettings } from '../models/CollegeSettings.js';

dotenv.config();

const runSeed = async () => {
  try {
    console.log('🌱 Starting database seeding script...');
    await connectDB();

    // Clear existing collections
    await Registration.deleteMany({});
    await Event.deleteMany({});
    await Club.deleteMany({});
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Certificate.deleteMany({});
    await Signatory.deleteMany({});
    await CollegeSettings.deleteMany({});
    console.log('🧹 Cleared existing database collections.');

    await seedDatabase();

    console.log('\n======================================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('🔑 DEMO CREDENTIALS FOR TESTING:');
    console.log('------------------------------------------------------');
    console.log('👤 ORGANIZER ACCOUNTS:');
    console.log('  1) USN: 1BM22CS001 | Password: Password@123 | Club: CodeForge (Technical)');
    console.log('  2) USN: 1BM22EC010 | Password: Password@123 | Club: NrityaKala (Cultural)');
    console.log('  Organizer Access Code for new signups: COLLEGE_ORG_2025\n');
    console.log('🎓 STUDENT ACCOUNTS:');
    console.log('  1) USN: 1BM22CS045 | Password: Password@123 | Name: Rohan Gupta (CSE 3rd Year)');
    console.log('  2) USN: 1BM22IS012 | Password: Password@123 | Name: Ananya Iyer (ISE 2nd Year)');
    console.log('  3) USN: 1BM22EC033 | Password: Password@123 | Name: Karthik Rao (ECE 3rd Year)');
    console.log('  4) USN: 1BM23AI007 | Password: Password@123 | Name: Pooja Verma (AIML 1st Year)');
    console.log('  5) USN: 1BM21ME090 | Password: Password@123 | Name: Vikram Singh (MECH 4th Year)');
    console.log('======================================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed with error:', err);
    await disconnectDB();
    process.exit(1);
  }
};

runSeed();
