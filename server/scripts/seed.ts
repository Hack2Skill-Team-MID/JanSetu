/**
 * JanSetu Database Seeder
 * ========================
 * Seeds the DB with realistic sample data for testing.
 * Run with: npx ts-node scripts/seed.ts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// ======================= Models =======================
// Re-define schemas inline to avoid import path issues in scripts

const UserSchema = new mongoose.Schema({
  name: String, email: String, password: String, role: String, avatar: String,
}, { timestamps: true });

const CommunityNeedSchema = new mongoose.Schema({
  title: String, description: String, category: String, urgency: String,
  location: String, coordinates: { type: [Number], default: [0, 0] },
  affectedPopulation: Number, reportedBy: mongoose.Schema.Types.ObjectId,
  status: { type: String, default: 'active' }, aiProcessed: Boolean,
  tags: [String],
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
  needId: mongoose.Schema.Types.ObjectId,
  createdBy: mongoose.Schema.Types.ObjectId,
  title: String, description: String,
  requiredSkills: [String], location: String,
  coordinates: [Number], deadline: Date,
  volunteersNeeded: Number, volunteersAssigned: { type: Number, default: 0 },
  status: { type: String, default: 'open' },
  applications: [{ volunteerId: mongoose.Schema.Types.ObjectId, volunteerName: String, matchScore: Number, matchReasons: [String], status: String, appliedAt: Date }],
}, { timestamps: true });

const VolunteerProfileSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  skills: [String], location: String,
  coordinates: { type: [Number], default: [0, 0] },
  availability: String, bio: String,
  tasksCompleted: { type: Number, default: 0 },
  hoursLogged: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const CommunityNeed = mongoose.model('CommunityNeed', CommunityNeedSchema);
const Task = mongoose.model('Task', TaskSchema);
const VolunteerProfile = mongoose.model('VolunteerProfile', VolunteerProfileSchema);

// ======================= Seed Data =======================

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jansetu');
  console.log('✅ Connected to MongoDB');

  // Clean existing data
  await Promise.all([
    User.deleteMany({}),
    CommunityNeed.deleteMany({}),
    Task.deleteMany({}),
    VolunteerProfile.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  const hashedPassword = await bcrypt.hash('Password@123', 10);

  // ── 1. Create Users ──
  const [admin, ngo1, ngo2, vol1, vol2, vol3] = await User.insertMany([
    { name: 'Admin Raj', email: 'admin@jansetu.in', password: hashedPassword, role: 'admin' },
    { name: 'Priya Sharma (HelpIndia NGO)', email: 'ngo@helpindia.org', password: hashedPassword, role: 'ngo_coordinator' },
    { name: 'Vikram Nair (CommunityFirst)', email: 'vikram@commfirst.org', password: hashedPassword, role: 'ngo_coordinator' },
    { name: 'Ananya Verma', email: 'ananya@volunteer.in', password: hashedPassword, role: 'volunteer' },
    { name: 'Rohit Gupta', email: 'rohit@volunteer.in', password: hashedPassword, role: 'volunteer' },
    { name: 'Meera Pillai', email: 'meera@volunteer.in', password: hashedPassword, role: 'volunteer' },
  ]);
  console.log('👤 Created 6 users');

  // ── 2. Create Community Needs ──
  const [n1, n2, n3, n4, n5] = await CommunityNeed.insertMany([
    {
      title: 'Acute Water Shortage in Dharavi',
      description: 'Over 2000 families in Dharavi sector 4-B have been without clean drinking water for 8 days. Borewells have run dry and the municipal water supply truck visits only twice a week, which is insufficient. Children are drinking contaminated water leading to diarrhea reports.',
      category: 'water', urgency: 'critical',
      location: 'Dharavi, Mumbai', coordinates: [72.8540, 19.0415],
      affectedPopulation: 2000, reportedBy: ngo1._id,
      status: 'active', aiProcessed: true,
      tags: ['water', 'health', 'emergency'],
    },
    {
      title: 'Primary School Roof Collapsed — Azamgarh',
      description: 'The roof of Section-C of Government Primary School, Azamgarh collapsed during last week\'s heavy rains. 340 students are now studying in the open. Winter is approaching and the school needs urgent structural repair.',
      category: 'education', urgency: 'high',
      location: 'Azamgarh, Uttar Pradesh', coordinates: [83.1842, 26.0737],
      affectedPopulation: 340, reportedBy: ngo2._id,
      status: 'active', aiProcessed: true,
      tags: ['education', 'construction', 'children'],
    },
    {
      title: 'Mobile Health Camp Needed — Sundarbans',
      description: 'Remote island villages in the Sundarbans have no access to healthcare for 3 months due to frequent flooding disrupting ferry services. The nearest PHC is 45km by boat. Elderly patients and pregnant women are severely affected.',
      category: 'healthcare', urgency: 'critical',
      location: 'Sundarbans, West Bengal', coordinates: [88.8857, 21.9497],
      affectedPopulation: 800, reportedBy: ngo1._id,
      status: 'active', aiProcessed: true,
      tags: ['healthcare', 'medical', 'rural'],
    },
    {
      title: 'Youth Unemployment — Skill Training Required',
      description: '60% youth unemployment rate in Paharganj area. Local youth aged 18-25 need vocational training in IT, hospitality, and basic trades to access employment. A community center is available but lacks trainers.',
      category: 'employment', urgency: 'medium',
      location: 'Paharganj, New Delhi', coordinates: [77.2090, 28.6448],
      affectedPopulation: 500, reportedBy: ngo2._id,
      status: 'active', aiProcessed: false,
      tags: ['employment', 'skill', 'youth'],
    },
    {
      title: 'Open Drain Overflowing — Disease Risk',
      description: 'An open drain near the main market of Kurla West has been overflowing for 2 weeks. Raw sewage is mixing into the footpath. Shopkeepers and residents report multiple cases of dengue and cholera suspicion. BMC has not responded to 3 complaints.',
      category: 'sanitation', urgency: 'high',
      location: 'Kurla West, Mumbai', coordinates: [72.8794, 19.0728],
      affectedPopulation: 350, reportedBy: ngo1._id,
      status: 'active', aiProcessed: true,
      tags: ['sanitation', 'health', 'civic'],
    },
  ]);
  console.log('📋 Created 5 community needs');

  // ── 3. Create Tasks ──
  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in14 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const in3 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const [t1, t2, t3, t4, t5] = await Task.insertMany([
    {
      needId: n1._id, createdBy: ngo1._id,
      title: 'Water Tanker Coordination — Dharavi',
      description: 'Coordinate with water tankers and manage distribution at 5 pickup points in Dharavi. Requires managing queues, maintaining distribution log, and coordinating with municipal office.',
      requiredSkills: ['Event Management', 'Driving'], location: 'Dharavi, Mumbai',
      coordinates: [72.8540, 19.0415], deadline: in3,
      volunteersNeeded: 5, status: 'open',
    },
    {
      needId: n2._id, createdBy: ngo2._id,
      title: 'School Roof Emergency Repair — Azamgarh',
      description: 'Assist licensed contractors with carrying materials, site cleanup, and basic construction support for the government school roof repair project.',
      requiredSkills: ['Construction', 'Engineering'], location: 'Azamgarh, UP',
      coordinates: [83.1842, 26.0737], deadline: in14,
      volunteersNeeded: 8, status: 'open',
    },
    {
      needId: n3._id, createdBy: ngo1._id,
      title: 'Medical Camp Setup & Patient Registration',
      description: 'Join the mobile health camp team in Sundarbans. Need volunteers for patient registration, queue management, and first aid support under supervising doctors.',
      requiredSkills: ['Medical', 'First Aid'], location: 'Sundarbans, West Bengal',
      coordinates: [88.8857, 21.9497], deadline: in7,
      volunteersNeeded: 10, status: 'open',
    },
    {
      needId: n4._id, createdBy: ngo2._id,
      title: 'IT & Soft Skills Trainer — Paharganj Youth',
      description: 'Conduct 3-hour weekly training sessions for 25 youth in basic computer skills, MS Office, and professional communication. Duration: 2 months.',
      requiredSkills: ['IT Support', 'Teaching'], location: 'Paharganj, Delhi',
      coordinates: [77.2090, 28.6448], deadline: in14,
      volunteersNeeded: 3, status: 'open',
    },
    {
      needId: n5._id, createdBy: ngo1._id,
      title: 'Drain Awareness & BMC Petition Drive',
      description: 'Organize residents to sign a collective petition to BMC about the overflowing drain. Document the situation with photos for media/legal use. Social media outreach needed.',
      requiredSkills: ['Social Media', 'Photography', 'Legal Aid'], location: 'Kurla, Mumbai',
      coordinates: [72.8794, 19.0728], deadline: in7,
      volunteersNeeded: 4, status: 'open',
    },
  ]);
  console.log('📝 Created 5 tasks');

  // ── 4. Create Volunteer Profiles ──
  await VolunteerProfile.insertMany([
    {
      userId: vol1._id,
      skills: ['Teaching', 'IT Support', 'Social Media'],
      location: 'Delhi NCR', coordinates: [77.1025, 28.7041],
      availability: 'weekends',
      bio: 'Software engineer eager to contribute to education and tech skills training.',
      tasksCompleted: 3, hoursLogged: 24,
    },
    {
      userId: vol2._id,
      skills: ['Medical', 'First Aid', 'Driving'],
      location: 'Mumbai', coordinates: [72.8777, 19.0760],
      availability: 'part-time',
      bio: 'MBBS intern with a passion for rural healthcare outreach.',
      tasksCompleted: 7, hoursLogged: 56,
    },
    {
      userId: vol3._id,
      skills: ['Construction', 'Plumbing', 'Photography'],
      location: 'Kolkata', coordinates: [88.3639, 22.5726],
      availability: 'full-time',
      bio: 'Civil engineering graduate looking to apply skills for community infrastructure.',
      tasksCompleted: 2, hoursLogged: 18,
    },
  ]);
  console.log('🙋 Created 3 volunteer profiles');

  console.log('\n🎉 Database seeded successfully!');
  console.log('─────────────────────────────────');
  console.log('Login credentials (all use password: Password@123)');
  console.log('');
  console.log('NGO Coordinator: ngo@helpindia.org');
  console.log('Volunteer:       ananya@volunteer.in');
  console.log('Volunteer:       rohit@volunteer.in');
  console.log('Admin:           admin@jansetu.in');
  console.log('─────────────────────────────────\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
