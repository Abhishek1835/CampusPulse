import { User } from '../models/User.js';
import { Club } from '../models/Club.js';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { CollegeSettings } from '../models/CollegeSettings.js';
import { Signatory } from '../models/Signatory.js';
import { Attendance } from '../models/Attendance.js';
import { Certificate } from '../models/Certificate.js';
import { generateCertificatePDF } from '../services/pdfService.js';

export const seedDatabase = async () => {
  console.log('🌱 Checking / Seeding database collections...');

  // 1. Create 5 Diverse Clubs
  const clubsData = [
    {
      name: 'CodeForge: Coding & Open Source Society',
      slug: 'codeforge',
      logo: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
      tagline: 'Compiling Passion into Production',
      description:
        'CodeForge is the premier technical and competitive programming club of the institution. We host national hackathons, algorithm bootcamps, open-source workshops, and developer meetups to groom industry-ready software engineers.',
      category: 'technical',
      foundedYear: 2018,
      facultyCoordinator: {
        name: 'Dr. Rajeshwar Swamy',
        email: 'rajeshwar.swamy@bmsce.ac.in',
        phone: '+91 94481 22334'
      },
      contactEmail: 'codeforge@bmsce.ac.in',
      contactPhone: '+91 98801 12345',
      socialLinks: {
        instagram: 'https://instagram.com/codeforge_vtu',
        linkedin: 'https://linkedin.com/company/codeforge-vtu',
        website: 'https://codeforge.bmsce.ac.in',
        discord: 'https://discord.gg/codeforge'
      },
      isVerified: true
    },
    {
      name: 'NrityaKala: Cultural & Performing Arts Guild',
      slug: 'nrityakala',
      logo: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80',
      tagline: 'Rhythm, Drama & Soul Unleashed',
      description:
        'NrityaKala celebrates music, dance, theatre, and visual arts. From vibrant classical jugalbandis to cutting-edge contemporary street dances, we ignite campus creativity and represent our university in national youth festivals.',
      category: 'cultural',
      foundedYear: 2015,
      facultyCoordinator: {
        name: 'Prof. Sunita Deshmukh',
        email: 'sunita.d@bmsce.ac.in',
        phone: '+91 98450 77123'
      },
      contactEmail: 'nrityakala@bmsce.ac.in',
      contactPhone: '+91 99012 34567',
      socialLinks: {
        instagram: 'https://instagram.com/nrityakala_fest',
        linkedin: 'https://linkedin.com/company/nrityakala',
        website: 'https://arts.bmsce.ac.in',
        discord: ''
      },
      isVerified: true
    },
    {
      name: 'Titan Athletics: Sports & Fitness Club',
      slug: 'titan-athletics',
      logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop&q=80',
      tagline: 'Chasing Greatness On and Off the Arena',
      description:
        'Dedicated to building champions in athletics, football, basketball, badminton, and e-sports. We maintain campus fitness facilities, organize inter-branch cups, and lead university teams to VTU state medals.',
      category: 'sports',
      foundedYear: 2012,
      facultyCoordinator: {
        name: 'Coach Balram Yadav',
        email: 'balram.sports@bmsce.ac.in',
        phone: '+91 97412 88990'
      },
      contactEmail: 'sports@bmsce.ac.in',
      contactPhone: '+91 98440 98765',
      socialLinks: {
        instagram: 'https://instagram.com/titan_athletics',
        linkedin: '',
        website: 'https://sports.bmsce.ac.in',
        discord: ''
      },
      isVerified: true
    },
    {
      name: 'RoboTech: Robotics & Autonomous Systems Club',
      slug: 'robotech',
      logo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
      tagline: 'Engineering the Automations of Tomorrow',
      description:
        'RoboTech unites mechanical wizards, embedded programmers, and AI enthusiasts to build combat robots, autonomous drones, ROS2 rovers, and IoT automation projects. Active participants in Robocon and Techfest.',
      category: 'technical',
      foundedYear: 2019,
      facultyCoordinator: {
        name: 'Dr. Anand Kulkarni',
        email: 'anand.k@bmsce.ac.in',
        phone: '+91 96112 33445'
      },
      contactEmail: 'robotech@bmsce.ac.in',
      contactPhone: '+91 91100 22334',
      socialLinks: {
        instagram: 'https://instagram.com/robotech_lab',
        linkedin: 'https://linkedin.com/company/robotech-college',
        website: 'https://robotech.bmsce.ac.in',
        discord: 'https://discord.gg/robotech'
      },
      isVerified: true
    },
    {
      name: 'VenturePulse: The Entrepreneurship Cell (E-Cell)',
      slug: 'venturepulse',
      logo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&auto=format&fit=crop&q=80',
      tagline: 'From Campus Dorms to Unicorn Summits',
      description:
        'VenturePulse fosters student entrepreneurship through incubation support, angel investor pitch sessions, startup bootcamps, and networking with seasoned venture capitalists and alumni founders.',
      category: 'other',
      foundedYear: 2020,
      facultyCoordinator: {
        name: 'Prof. Manisha Bansal',
        email: 'manisha.b@bmsce.ac.in',
        phone: '+91 98860 44556'
      },
      contactEmail: 'ecell@bmsce.ac.in',
      contactPhone: '+91 98450 11223',
      socialLinks: {
        instagram: 'https://instagram.com/venturepulse_ecell',
        linkedin: 'https://linkedin.com/company/venturepulse-ecell',
        website: 'https://ecell.bmsce.ac.in',
        discord: ''
      },
      isVerified: true
    }
  ];

  const createdClubs = await Club.insertMany(clubsData);
  const codeforge = createdClubs[0];
  const nrityakala = createdClubs[1];
  const titanAthletics = createdClubs[2];
  const robotech = createdClubs[3];
  const venturepulse = createdClubs[4];

  // 2. Create 2 Organizers (valid VTU USN format)
  const org1 = await User.create({
    usn: '1BM22CS001',
    name: 'Aditya Sharma',
    email: 'org.codeforge@bmsce.ac.in',
    phone: '9880112345',
    passwordHash: 'Password@123',
    role: 'organizer',
    branch: 'Computer Science & Engineering',
    year: 3,
    designation: 'Lead President & Technical Head',
    club: codeforge._id,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  });

  const org2 = await User.create({
    usn: '1BM22EC010',
    name: 'Meera Nair',
    email: 'org.cultural@bmsce.ac.in',
    phone: '9901234567',
    passwordHash: 'Password@123',
    role: 'organizer',
    branch: 'Electronics & Communication Engineering',
    year: 3,
    designation: 'Secretary & Cultural Coordinator',
    club: nrityakala._id,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
  });

  await Club.findByIdAndUpdate(codeforge._id, { $addToSet: { organizers: org1._id } });
  await Club.findByIdAndUpdate(nrityakala._id, { $addToSet: { organizers: org2._id } });

  // 3. Create 5 Students (valid VTU USN format)
  const studentsData = [
    {
      usn: '1BM22CS045',
      name: 'Rohan Gupta',
      email: 'rohan.cs@bmsce.ac.in',
      phone: '9876543210',
      passwordHash: 'Password@123',
      role: 'student',
      branch: 'Computer Science & Engineering',
      year: 3,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'
    },
    {
      usn: '1BM22IS012',
      name: 'Ananya Iyer',
      email: 'ananya.is@bmsce.ac.in',
      phone: '9876543211',
      passwordHash: 'Password@123',
      role: 'student',
      branch: 'Information Science & Engineering',
      year: 2,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
    },
    {
      usn: '1BM22EC033',
      name: 'Karthik Rao',
      email: 'karthik.ec@bmsce.ac.in',
      phone: '9876543212',
      passwordHash: 'Password@123',
      role: 'student',
      branch: 'Electronics & Communication Engineering',
      year: 3,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    },
    {
      usn: '1BM23AI007',
      name: 'Pooja Verma',
      email: 'pooja.ai@bmsce.ac.in',
      phone: '9876543213',
      passwordHash: 'Password@123',
      role: 'student',
      branch: 'Artificial Intelligence & Machine Learning',
      year: 1,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80'
    },
    {
      usn: '1BM21ME090',
      name: 'Vikram Singh',
      email: 'vikram.me@bmsce.ac.in',
      phone: '9876543214',
      passwordHash: 'Password@123',
      role: 'student',
      branch: 'Mechanical Engineering',
      year: 4,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
    }
  ];

  const createdStudents = await Promise.all(
    studentsData.map((student) => User.create(student))
  );

  // 4. Create 13 Diverse Events across categories
  const now = new Date();
  const futureDate = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const pastDate = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const eventsData = [
    {
      title: 'HackVTU 2026: 36-Hour National Hackathon',
      shortDescription:
        'Build next-gen solutions in Web3, AI, and GreenTech with prize pool worth ₹1,50,000.',
      description:
        'Join over 500 passionate student developers, designers, and innovators for a grueling 36-hour sprint. Mentors from Google, Microsoft, and leading startups will guide teams through prototyping and investor pitches.',
      poster: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
      club: codeforge._id,
      createdBy: org1._id,
      category: 'hackathon',
      tags: ['Hackathon', 'AI', 'Web3', 'Coding', 'Prizes'],
      date: futureDate(14),
      startTime: '09:00 AM',
      endTime: '09:00 PM',
      venue: 'Campus Innovation Center, Block B, 4th Floor',
      mode: 'offline',
      registrationDeadline: futureDate(10),
      capacity: 100,
      fee: 0,
      isTeamEvent: true,
      teamSizeMin: 2,
      teamSizeMax: 4,
      rules: [
        'All code must be written during the hackathon period.',
        'Open-source libraries are permitted; pre-built proprietary software is not.',
        'Inter-college and cross-branch teams are strictly permitted.'
      ],
      prizes: '1st: ₹75,000 | 2nd: ₹45,000 | 3rd: ₹30,000 + Internship fast-tracks',
      eligibility: 'Open to all undergraduate engineering students',
      contactPersons: [
        { name: 'Aditya Sharma', phone: '9880112345', email: 'org.codeforge@bmsce.ac.in' }
      ],
      status: 'published'
    },
    {
      title: 'Full-Stack Mastery: Next.js 15, Docker & Microservices',
      shortDescription:
        'Hands-on masterclass building production web systems with SSR and Kubernetes containerization.',
      description:
        'A rigorous 2-day deep dive into scalable frontend architecture and container orchestration. You will build, test, and deploy a real-time collaborative workspace to cloud infrastructure.',
      poster: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
      club: codeforge._id,
      createdBy: org1._id,
      category: 'workshop',
      tags: ['Next.js', 'Docker', 'WebDev', 'Cloud'],
      date: futureDate(7),
      startTime: '10:00 AM',
      endTime: '04:30 PM',
      venue: 'CSE Seminar Hall 101',
      mode: 'hybrid',
      meetingLink: 'https://meet.google.com/xyz-code-workshop',
      registrationDeadline: futureDate(5),
      capacity: 60,
      fee: 150,
      isTeamEvent: false,
      rules: ['Bring your own laptop with Node.js LTS and Docker Desktop pre-installed.'],
      prizes: 'Certificate of Excellence + 6 Months JetBrains License',
      eligibility: '2nd, 3rd, and 4th year CS/IS/EC students',
      contactPersons: [
        { name: 'Aditya Sharma', phone: '9880112345', email: 'org.codeforge@bmsce.ac.in' }
      ],
      status: 'published'
    },
    {
      title: 'Demystifying Generative AI: From Transformers to Agents',
      shortDescription:
        'Keynote lecture by Senior AI Researcher on LLM fine-tuning, RAG pipelines, and agentic workflows.',
      description:
        'An inspiring tech seminar exploring the architectural mechanics of Transformer models, multi-agent frameworks, and autonomous reasoning. Followed by a 45-minute open Q&A session.',
      poster: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
      club: codeforge._id,
      createdBy: org1._id,
      category: 'seminar',
      tags: ['AI', 'LLM', 'MachineLearning', 'Seminar'],
      date: futureDate(21),
      startTime: '02:00 PM',
      endTime: '05:00 PM',
      venue: 'Dr. APJ Abdul Kalam Auditorium',
      mode: 'offline',
      registrationDeadline: futureDate(19),
      capacity: 250,
      fee: 0,
      isTeamEvent: false,
      rules: ['Please be seated 15 minutes before the talk.'],
      prizes: 'Signed AI Handbooks + Certificate of Attendance',
      eligibility: 'Open to all students and faculty',
      contactPersons: [
        { name: 'Aditya Sharma', phone: '9880112345', email: 'org.codeforge@bmsce.ac.in' }
      ],
      status: 'published'
    },
    {
      title: 'AlgoBlitz 2026: Speed Competitive Programming',
      shortDescription:
        'Fast-paced 3-hour algorithmic challenge testing speed, dynamic programming, and graph theory.',
      description:
        'Put your DSA skills to the ultimate test in this high-adrenaline contest hosted on Codeforces custom gym. Solve 6 problems of progressive difficulty in C++, Java, or Python.',
      poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      club: codeforge._id,
      createdBy: org1._id,
      category: 'technical',
      tags: ['Algorithms', 'DSA', 'CompetitiveProgramming'],
      date: futureDate(12),
      startTime: '04:00 PM',
      endTime: '07:00 PM',
      venue: 'Central Computing Facility (CCF Labs 1 & 2)',
      mode: 'offline',
      registrationDeadline: futureDate(10),
      capacity: 80,
      fee: 0,
      isTeamEvent: false,
      rules: ['Plagiarism check will run across all submissions.'],
      prizes: '1st: ₹10,000 | 2nd: ₹5,000 | 3rd: ₹3,000',
      eligibility: 'All college engineering students',
      contactPersons: [
        { name: 'Aditya Sharma', phone: '9880112345', email: 'org.codeforge@bmsce.ac.in' }
      ],
      status: 'published'
    },
    {
      title: 'Rhythm & Raag: Annual Inter-College Music Fest',
      shortDescription:
        'A spectacular musical extravaganza showcasing classical vocalists, rock bands, and fusion ensembles.',
      description:
        'The flagship musical carnival featuring solo singing, acoustic unplugged duos, and electrifying battle of the rock bands under the starry campus amphitheater.',
      poster: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      club: nrityakala._id,
      createdBy: org2._id,
      category: 'cultural',
      tags: ['Music', 'BattleOfTheBands', 'Cultural'],
      date: futureDate(18),
      startTime: '05:00 PM',
      endTime: '10:00 PM',
      venue: 'Open Air Amphitheatre',
      mode: 'offline',
      registrationDeadline: futureDate(14),
      capacity: 400,
      fee: 50,
      isTeamEvent: true,
      teamSizeMin: 1,
      teamSizeMax: 6,
      rules: ['Each band gets 12 minutes for sound check and stage performance.'],
      prizes: 'Rolling Trophy + Cash Prize of ₹40,000 for Best Band',
      eligibility: 'Open to all music enthusiasts',
      contactPersons: [
        { name: 'Meera Nair', phone: '9901234567', email: 'org.cultural@bmsce.ac.in' }
      ],
      status: 'published'
    },
    {
      title: 'Natya Tarang: Stage Play & Street Theatre Festival',
      shortDescription:
        'Powerful theatrical acts and street plays (Nukkad Natak) addressing urgent social issues.',
      description:
        'Experience the raw emotion of street theatre and dramatic stage plays crafted by student playwrights.',
      poster: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&auto=format&fit=crop&q=80',
      club: nrityakala._id,
      createdBy: org2._id,
      category: 'cultural',
      tags: ['Theatre', 'Drama', 'NukkadNatak'],
      date: futureDate(25),
      startTime: '03:00 PM',
      endTime: '08:00 PM',
      venue: 'Student Activity Center Lawn',
      mode: 'offline',
      registrationDeadline: futureDate(20),
      capacity: 150,
      fee: 0,
      isTeamEvent: true,
      teamSizeMin: 4,
      teamSizeMax: 12,
      rules: ['Street play duration: 15 minutes max.'],
      prizes: 'Gold Medal + ₹25,000 for Best Script & Acting',
      eligibility: 'All students',
      contactPersons: [
        { name: 'Meera Nair', phone: '9901234567', email: 'org.cultural@bmsce.ac.in' }
      ],
      status: 'published'
    },
    {
      title: 'Smash Arena: Inter-Branch Badminton Tournament',
      shortDescription:
        'Intense singles and doubles badminton showdown for the ultimate branch bragging rights.',
      description:
        'Battle it out on the indoor wooden courts in Singles and Mixed Doubles format. Professional referees and Yonex shuttlecocks.',
      poster: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
      club: titanAthletics._id,
      createdBy: org1._id,
      category: 'sports',
      tags: ['Badminton', 'Sports', 'Fitness'],
      date: futureDate(9),
      startTime: '08:30 AM',
      endTime: '06:00 PM',
      venue: 'Indoor Sports Complex, Court 1 & 2',
      mode: 'offline',
      registrationDeadline: futureDate(6),
      capacity: 64,
      fee: 100,
      isTeamEvent: false,
      rules: ['Non-marking shoes are strictly mandatory.'],
      prizes: 'Championship Trophy + Yonex Astrox Rackets',
      eligibility: 'All enrolled undergraduate students',
      contactPersons: [
        { name: 'Coach Balram', phone: '9741288990', email: 'balram.sports@bmsce.ac.in' }
      ],
      status: 'published'
    },
    {
      title: 'Titan Turf: 7-a-Side Inter-Collegiate Football Cup',
      shortDescription:
        'High-octane football under the floodlights. Fast passes, dramatic goals, and passionate crowds.',
      description:
        '16 premier college teams clash in a 7-a-side knockout tournament. Full 40-minute matches on artificial astroturf.',
      poster: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
      club: titanAthletics._id,
      createdBy: org1._id,
      category: 'sports',
      tags: ['Football', 'Soccer', 'Sports'],
      date: futureDate(16),
      startTime: '04:00 PM',
      endTime: '10:00 PM',
      venue: 'Main Campus Stadium & Astroturf Ground',
      mode: 'offline',
      registrationDeadline: futureDate(11),
      capacity: 16,
      fee: 500,
      isTeamEvent: true,
      teamSizeMin: 7,
      teamSizeMax: 10,
      rules: ['Shin guards mandatory.'],
      prizes: 'Grand Trophy + ₹35,000 Champions Purse',
      eligibility: 'College teams with valid ID cards',
      contactPersons: [
        { name: 'Coach Balram', phone: '9741288990', email: 'balram.sports@bmsce.ac.in' }
      ],
      status: 'published'
    },
    {
      title: 'BotWars 2026: Robo-Sumo & Autonomous Maze Runner',
      shortDescription:
        'Custom robots push each other out of the dohyo ring and navigate sensor-based obstacle mazes.',
      description:
        'Microcontroller robots fight for physical dominance in the circular ring. LIMITED TO ONLY 2 TEAMS (CAPACITY FULL DEMO)!',
      poster: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
      club: robotech._id,
      createdBy: org1._id,
      category: 'technical',
      tags: ['Robotics', 'RoboWars', 'Hardware'],
      date: futureDate(8),
      startTime: '10:00 AM',
      endTime: '04:00 PM',
      venue: 'Mechanical Workshop Hall C',
      mode: 'offline',
      registrationDeadline: futureDate(5),
      capacity: 2, // Full capacity event demo!
      fee: 200,
      isTeamEvent: true,
      teamSizeMin: 1,
      teamSizeMax: 3,
      rules: ['Robot dimensions must not exceed 25cm x 25cm.'],
      prizes: '₹20,000 cash + Robotics component kit',
      eligibility: 'All engineering students',
      contactPersons: [
        { name: 'Dr. Anand', phone: '9611233445', email: 'anand.k@bmsce.ac.in' }
      ],
      status: 'published'
    },
    {
      title: 'Pitch Tank 2026: Angel Investors Demo Day',
      shortDescription:
        'Present your disruptive startup prototype to prominent VCs and angel investors for pre-seed funding.',
      description:
        '10 selected student startups will deliver 5-minute pitches followed by live grilling by a panel of renowned angel investors.',
      poster: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80',
      club: venturepulse._id,
      createdBy: org1._id,
      category: 'other',
      tags: ['Startup', 'PitchDeck', 'Funding'],
      date: futureDate(30),
      startTime: '01:30 PM',
      endTime: '06:30 PM',
      venue: 'Auditorium Conference Suite',
      mode: 'hybrid',
      meetingLink: 'https://meet.google.com/venture-pitch-2026',
      registrationDeadline: futureDate(22),
      capacity: 20,
      fee: 0,
      isTeamEvent: true,
      teamSizeMin: 1,
      teamSizeMax: 4,
      rules: ['Pitch deck must not exceed 10 slides.'],
      prizes: 'Up to ₹5,00,000 Equity-free Incubation Grant',
      eligibility: 'Student founders and early-stage campus teams',
      contactPersons: [
        { name: 'Prof. Manisha', phone: '9886044556', email: 'ecell@bmsce.ac.in' }
      ],
      status: 'published'
    },
    {
      title: 'Autonomous Drones & ROS2 Architecture Masterclass',
      shortDescription:
        'Hands-on firmware configuration, PID tuning, and aerial waypoint navigation completed successfully.',
      description:
        'A weekend boot camp on assembling quadcopters, flashing Betaflight firmware, and programming autonomous path finding using ROS2 and OpenCV.',
      poster: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80',
      club: robotech._id,
      createdBy: org1._id,
      category: 'workshop',
      tags: ['Drones', 'ROS2', 'Autonomous'],
      date: pastDate(10),
      startTime: '09:30 AM',
      endTime: '05:00 PM',
      venue: 'Robotics Lab 3',
      mode: 'offline',
      registrationDeadline: pastDate(15),
      capacity: 40,
      fee: 100,
      isTeamEvent: false,
      rules: ['Workshop completed.'],
      prizes: 'Certified drone operator badges awarded',
      eligibility: 'Past participants',
      contactPersons: [
        { name: 'Dr. Anand', phone: '9611233445', email: 'anand.k@bmsce.ac.in' }
      ],
      status: 'completed'
    },
    {
      title: 'Zero-Knowledge Cryptography & Modular Blockchains',
      shortDescription:
        'Deep dive into zk-SNARKs, rollup economics, and quantum-resistant cryptographic primitives.',
      description:
        'Specialist research session exploring privacy-preserving computational proofs and Ethereum Layer-2 execution environments. Note: Registration deadline for this event has closed.',
      poster: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80',
      club: codeforge._id,
      createdBy: org1._id,
      category: 'seminar',
      tags: ['Web3', 'Cryptography', 'ZK'],
      date: futureDate(3),
      startTime: '11:00 AM',
      endTime: '02:00 PM',
      venue: 'Virtual Seminar Room',
      mode: 'online',
      meetingLink: 'https://meet.google.com/zkp-crypto-summit',
      registrationDeadline: pastDate(2), // Deadline passed!
      capacity: 100,
      fee: 0,
      isTeamEvent: false,
      rules: ['Registration is closed.'],
      prizes: 'Verifiable digital credentials',
      eligibility: 'Advanced CS students',
      contactPersons: [
        { name: 'Aditya Sharma', phone: '9880112345', email: 'org.codeforge@bmsce.ac.in' }
      ],
      status: 'published'
    },
    {
      title: 'Shadows & Highlights: Golden Hour Campus Photowalk',
      shortDescription:
        'Explore composition, architectural frames, and street portraiture across the lush green campus.',
      description:
        'Grab your DSLR or smartphone and join the visual arts guild for an evening of golden-hour photography.',
      poster: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&auto=format&fit=crop&q=80',
      club: nrityakala._id,
      createdBy: org2._id,
      category: 'cultural',
      tags: ['Photography', 'VisualArts', 'PhotoWalk'],
      date: futureDate(11),
      startTime: '04:30 PM',
      endTime: '07:00 PM',
      venue: 'Campus Clock Tower Circle',
      mode: 'offline',
      registrationDeadline: futureDate(8),
      capacity: 50,
      fee: 0,
      isTeamEvent: false,
      rules: ['Original captures taken during the event only.'],
      prizes: 'Framed Exhibition Feature + Amazon Gift Cards',
      eligibility: 'All students and faculty',
      contactPersons: [
        { name: 'Meera Nair', phone: '9901234567', email: 'org.cultural@bmsce.ac.in' }
      ],
      status: 'published'
    }
  ];

  const createdEvents = await Event.insertMany(eventsData);
  const hackathonEvent = createdEvents[0];
  const workshopEvent = createdEvents[1];
  const botwarsEvent = createdEvents[8]; // Capacity 2 (Full)
  const pastWorkshopEvent = createdEvents[10];

  const s1 = createdStudents[0];
  const s2 = createdStudents[1];
  const s3 = createdStudents[2];
  const s4 = createdStudents[3];
  const s5 = createdStudents[4];

  // Fill BotWars to capacity 2/2!
  await Registration.create({
    event: botwarsEvent._id,
    student: s1._id,
    usn: s1.usn,
    name: s1.name,
    email: s1.email,
    phone: s1.phone,
    branch: s1.branch,
    year: s1.year,
    teamName: 'CyberKnights',
    teamMembers: [{ name: 'Harish M', usn: '1BM22CS088' }],
    status: 'registered'
  });

  await Registration.create({
    event: botwarsEvent._id,
    student: s2._id,
    usn: s2.usn,
    name: s2.name,
    email: s2.email,
    phone: s2.phone,
    branch: s2.branch,
    year: s2.year,
    teamName: 'RoboVipers',
    teamMembers: [{ name: 'Deepak K', usn: '1BM22IS099' }],
    status: 'registered'
  });

  // HackVTU registrations
  await Registration.create({
    event: hackathonEvent._id,
    student: s1._id,
    usn: s1.usn,
    name: s1.name,
    email: s1.email,
    phone: s1.phone,
    branch: s1.branch,
    year: s1.year,
    teamName: 'CodeCrafters',
    teamMembers: [
      { name: 'Ananya Iyer', usn: '1BM22IS012' },
      { name: 'Karthik Rao', usn: '1BM22EC033' }
    ],
    status: 'registered'
  });

  await Registration.create({
    event: hackathonEvent._id,
    student: s4._id,
    usn: s4.usn,
    name: s4.name,
    email: s4.email,
    phone: s4.phone,
    branch: s4.branch,
    year: s4.year,
    teamName: 'NeuralNinjas',
    teamMembers: [{ name: 'Sneha Patil', usn: '1BM23AI090' }],
    status: 'registered'
  });

  // Next.js Workshop registration
  await Registration.create({
    event: workshopEvent._id,
    student: s3._id,
    usn: s3.usn,
    name: s3.name,
    email: s3.email,
    phone: s3.phone,
    branch: s3.branch,
    year: s3.year,
    status: 'registered'
  });

  // Seed College Settings
  let collegeSettings = await CollegeSettings.findOne();
  if (!collegeSettings) {
    collegeSettings = await CollegeSettings.create({
      collegeName: 'BMS College of Engineering',
      affiliation: 'Autonomous Institute, Affiliated to Visvesvaraya Technological University (VTU), Belagavi',
      collegeLogo: '',
      address: 'Bull Temple Road, Basavanagudi, Bengaluru - 560019',
      website: 'https://www.bmsce.ac.in'
    });
  }

  // Seed Signatories
  const sig1 = await Signatory.create({
    name: 'Dr. H.S. Shwetha',
    designation: 'Professor & Head',
    department: 'Dept. of Computer Science & Engineering',
    isActive: true,
    createdBy: org1._id,
    club: codeforge._id
  });

  const sig2 = await Signatory.create({
    name: 'Dr. P. Jayarekha',
    designation: 'Dean - Academics',
    department: 'BMSCE Bengaluru',
    isActive: true,
    createdBy: org1._id,
    club: codeforge._id
  });

  const sig3 = await Signatory.create({
    name: 'Prof. Anand K.',
    designation: 'Faculty Coordinator',
    department: 'RoboTech Society',
    isActive: true,
    createdBy: org1._id,
    club: robotech._id
  });

  // Attach signatories and configure past workshop event
  pastWorkshopEvent.attendance = {
    enabled: true,
    checkInOpensBefore: 15,
    onTimeGraceMinutes: 15,
    checkInClosesAfter: 45,
    method: 'all',
    allowLateCertificates: false
  };
  pastWorkshopEvent.certificate = {
    enabled: true,
    type: 'participation',
    title: 'Certificate of Hands-on Excellence',
    templateId: 'nature-classic',
    signatories: [sig1._id, sig2._id],
    autoGenerateDelayHours: 2,
    issueMode: 'auto'
  };
  pastWorkshopEvent.certificatesGenerated = true;
  pastWorkshopEvent.certificatesGeneratedAt = new Date();
  await pastWorkshopEvent.save();

  // Also enable attendance for live event (workshopEvent)
  workshopEvent.attendance = {
    enabled: true,
    checkInOpensBefore: 120,
    onTimeGraceMinutes: 60,
    checkInClosesAfter: 180,
    method: 'all',
    allowLateCertificates: false
  };
  workshopEvent.certificate = {
    enabled: true,
    type: 'participation',
    title: 'Certificate of Technical Participation',
    templateId: 'nature-classic',
    signatories: [sig1._id, sig2._id],
    autoGenerateDelayHours: 2,
    issueMode: 'auto'
  };
  await workshopEvent.save();

  // Registrations & Attendance for pastWorkshopEvent
  // 1. Student 1 (s1 - Rahul Sharma): On-time attendee -> Earns certificate!
  await Registration.create({
    event: pastWorkshopEvent._id,
    student: s1._id,
    usn: s1.usn,
    name: s1.name,
    email: s1.email,
    phone: s1.phone,
    branch: s1.branch,
    year: s1.year,
    status: 'attended'
  });

  await Attendance.create({
    event: pastWorkshopEvent._id,
    student: s1._id,
    usn: s1.usn,
    checkInTime: new Date(new Date(pastWorkshopEvent.date).getTime() + 10 * 60 * 1000), // 10m after start (on-time)
    status: 'on-time',
    method: 'qr',
    ip: '127.0.0.1',
    deviceInfo: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
    geofenceVerified: false
  });

  const cert1 = await Certificate.create({
    certificateId: 'VTU-CEH-2026-A8K2F9',
    event: pastWorkshopEvent._id,
    student: s1._id,
    club: pastWorkshopEvent.club,
    recipientName: s1.name,
    recipientUSN: s1.usn,
    certificateType: 'participation',
    templateId: 'nature-classic',
    title: 'Certificate of Hands-on Excellence',
    issueDate: new Date(pastWorkshopEvent.date),
    signatoriesSnapshot: [
      {
        name: sig1.name,
        designation: sig1.designation,
        department: sig1.department,
        signatureImage: sig1.signatureImage
      },
      {
        name: sig2.name,
        designation: sig2.designation,
        department: sig2.department,
        signatureImage: sig2.signatureImage
      }
    ],
    collegeSnapshot: {
      name: collegeSettings.collegeName,
      affiliation: collegeSettings.affiliation,
      logo: collegeSettings.collegeLogo
    },
    status: 'issued'
  });

  try {
    await generateCertificatePDF(cert1, pastWorkshopEvent, s1, collegeSettings);
  } catch (e) {
    console.error('Error generating seed PDF for cert1:', e);
  }

  // 2. Student 2 (s2 - Priya Patel): Late attendee -> Disqualified from certificate
  await Registration.create({
    event: pastWorkshopEvent._id,
    student: s2._id,
    usn: s2.usn,
    name: s2.name,
    email: s2.email,
    phone: s2.phone,
    branch: s2.branch,
    year: s2.year,
    status: 'attended'
  });

  await Attendance.create({
    event: pastWorkshopEvent._id,
    student: s2._id,
    usn: s2.usn,
    checkInTime: new Date(new Date(pastWorkshopEvent.date).getTime() + 35 * 60 * 1000), // 35m after start (late!)
    status: 'late',
    method: 'code',
    ip: '127.0.0.1',
    deviceInfo: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile',
    geofenceVerified: false
  });
  // No certificate for s2! Late arrivals do not receive certificates.

  // 3. Student 5 (s5 - Ananya Rao): Manual approval attendee -> Earns certificate!
  await Registration.create({
    event: pastWorkshopEvent._id,
    student: s5._id,
    usn: s5.usn,
    name: s5.name,
    email: s5.email,
    phone: s5.phone,
    branch: s5.branch,
    year: s5.year,
    status: 'attended'
  });

  await Attendance.create({
    event: pastWorkshopEvent._id,
    student: s5._id,
    usn: s5.usn,
    checkInTime: new Date(pastWorkshopEvent.date),
    status: 'manual',
    method: 'manual',
    markedBy: org1._id,
    manualReason: 'Attended session and assisted as technical lab demonstrator',
    ip: '127.0.0.1',
    deviceInfo: 'Organizer Console'
  });

  const cert2 = await Certificate.create({
    certificateId: 'VTU-CEH-2026-M4P7B1',
    event: pastWorkshopEvent._id,
    student: s5._id,
    club: pastWorkshopEvent.club,
    recipientName: s5.name,
    recipientUSN: s5.usn,
    certificateType: 'participation',
    templateId: 'nature-classic',
    title: 'Certificate of Hands-on Excellence',
    issueDate: new Date(pastWorkshopEvent.date),
    signatoriesSnapshot: [
      {
        name: sig1.name,
        designation: sig1.designation,
        department: sig1.department,
        signatureImage: sig1.signatureImage
      },
      {
        name: sig3.name,
        designation: sig3.designation,
        department: sig3.department,
        signatureImage: sig3.signatureImage
      }
    ],
    collegeSnapshot: {
      name: collegeSettings.collegeName,
      affiliation: collegeSettings.affiliation,
      logo: collegeSettings.collegeLogo
    },
    status: 'issued'
  });

  try {
    await generateCertificatePDF(cert2, pastWorkshopEvent, s5, collegeSettings);
  } catch (e) {
    console.error('Error generating seed PDF for cert2:', e);
  }

  console.log('✅ Seeding completed: 5 clubs, 2 organizers, 5 students, 13 events, registrations, attendance & certificates.');
};
