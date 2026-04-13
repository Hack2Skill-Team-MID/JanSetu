/**
 * JanSetu Database Seeder — Full Ecosystem
 * ==========================================
 * Seeds the DB with realistic sample data for the complete platform.
 * Run with: npx ts-node scripts/seed.ts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// ======================= Inline Schemas =======================
const UserSchema = new mongoose.Schema({
  name: String, email: String, password: String, role: String, avatar: String,
  organizationId: mongoose.Schema.Types.ObjectId,
  reputationScore: { type: Number, default: 50 },
  badges: [String], points: { type: Number, default: 0 },
  language: { type: String, default: 'en' },
}, { timestamps: true });

const CommunityNeedSchema = new mongoose.Schema({
  title: String, description: String, category: String, urgency: String,
  location: String, coordinates: { type: [Number], default: [0, 0] },
  affectedPopulation: Number, reportedBy: mongoose.Schema.Types.ObjectId,
  status: { type: String, default: 'active' }, aiProcessed: Boolean, tags: [String],
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
  needId: mongoose.Schema.Types.ObjectId, createdBy: mongoose.Schema.Types.ObjectId,
  title: String, description: String, requiredSkills: [String], location: String,
  coordinates: [Number], deadline: Date,
  volunteersNeeded: Number, volunteersAssigned: { type: Number, default: 0 },
  status: { type: String, default: 'open' },
  applications: [{ volunteerId: mongoose.Schema.Types.ObjectId, volunteerName: String, matchScore: Number, matchReasons: [String], status: String, appliedAt: Date }],
}, { timestamps: true });

const VolunteerProfileSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId, skills: [String], location: String,
  coordinates: { type: [Number], default: [0, 0] }, availability: String, bio: String,
  tasksCompleted: { type: Number, default: 0 }, hoursLogged: { type: Number, default: 0 },
}, { timestamps: true });

const OrganizationSchema = new mongoose.Schema({
  name: String, slug: String, description: String, type: String,
  verified: Boolean, trustScore: Number, trustTier: String,
  mode: String, subscription: String,
  email: String, phone: String, website: String,
  address: String, region: String, coordinates: [Number],
  stats: { totalCampaigns: Number, activeCampaigns: Number, totalVolunteers: Number, totalDonationsReceived: Number, peopleHelped: Number },
  createdBy: mongoose.Schema.Types.ObjectId, isActive: Boolean,
}, { timestamps: true });

const CampaignSchema = new mongoose.Schema({
  organizationId: mongoose.Schema.Types.ObjectId, createdBy: mongoose.Schema.Types.ObjectId,
  title: String, description: String, category: String, tags: [String],
  visibility: String, featured: Boolean,
  startDate: Date, endDate: Date, status: String,
  location: String, region: String, coordinates: [Number],
  goals: { volunteersNeeded: Number, volunteersJoined: Number, fundingGoal: Number, fundingRaised: Number, peopleToHelp: Number, peopleHelped: Number },
  milestones: [{ title: String, description: String, targetDate: Date, completed: Boolean, completedAt: Date }],
  impactSummary: String,
}, { timestamps: true });

const DonationSchema = new mongoose.Schema({
  donorId: mongoose.Schema.Types.ObjectId, organizationId: mongoose.Schema.Types.ObjectId,
  campaignId: mongoose.Schema.Types.ObjectId,
  amount: Number, currency: String, paymentMethod: String, paymentStatus: String,
  razorpayOrderId: String, razorpayPaymentId: String,
  type: String, isAnonymous: Boolean, message: String,
}, { timestamps: true });

const ResourceSchema = new mongoose.Schema({
  organizationId: mongoose.Schema.Types.ObjectId,
  name: String, category: String, description: String,
  quantity: Number, unit: String, expiryDate: Date, condition: String,
  location: String, coordinates: [Number],
  allocated: Number, available: Number,
  availableForSharing: Boolean, status: String,
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const CommunityNeed = mongoose.model('CommunityNeed', CommunityNeedSchema);
const Task = mongoose.model('Task', TaskSchema);
const VolunteerProfile = mongoose.model('VolunteerProfile', VolunteerProfileSchema);
const Organization = mongoose.model('Organization', OrganizationSchema);
const Campaign = mongoose.model('Campaign', CampaignSchema);
const Donation = mongoose.model('Donation', DonationSchema);
const Resource = mongoose.model('Resource', ResourceSchema);

// ======================= Seed =======================
async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jansetu');
  console.log('✅ Connected to MongoDB');

  await Promise.all([
    User.deleteMany({}), CommunityNeed.deleteMany({}), Task.deleteMany({}),
    VolunteerProfile.deleteMany({}), Organization.deleteMany({}),
    Campaign.deleteMany({}), Donation.deleteMany({}), Resource.deleteMany({}),
  ]);
  console.log('🗑️  Cleared all collections');

  const hash = await bcrypt.hash('Password@123', 10);

  // ── 1. Users ──
  const [admin, ngo1, ngo2, vol1, vol2, vol3, donor1] = await User.insertMany([
    { name: 'Admin Raj', email: 'admin@jansetu.in', password: hash, role: 'platform_admin', reputationScore: 100, badges: ['admin'], points: 0 },
    { name: 'Priya Sharma', email: 'ngo@helpindia.org', password: hash, role: 'ngo_admin', reputationScore: 85, badges: ['verified_ngo', 'crisis_responder'], points: 450 },
    { name: 'Vikram Nair', email: 'vikram@commfirst.org', password: hash, role: 'ngo_admin', reputationScore: 78, badges: ['verified_ngo'], points: 320 },
    { name: 'Ananya Verma', email: 'ananya@volunteer.in', password: hash, role: 'volunteer', reputationScore: 72, badges: ['first_task', 'five_tasks', 'team_player'], points: 280 },
    { name: 'Rohit Gupta', email: 'rohit@volunteer.in', password: hash, role: 'volunteer', reputationScore: 88, badges: ['first_task', 'ten_tasks', 'first_aid_hero', 'weekly_star'], points: 650 },
    { name: 'Meera Pillai', email: 'meera@volunteer.in', password: hash, role: 'volunteer', reputationScore: 65, badges: ['first_task'], points: 120 },
    { name: 'Arjun Kapoor', email: 'arjun@donor.in', password: hash, role: 'donor', reputationScore: 90, badges: ['top_donor'], points: 500 },
  ]);
  console.log('👤 Created 7 users');

  // ── 2. Organizations ──
  const [org1, org2] = await Organization.insertMany([
    {
      name: 'HelpIndia Foundation', slug: 'helpindia-foundation',
      description: 'Pan-India NGO focused on water, sanitation, and healthcare in underserved communities. Operating since 2015 with 500+ campaigns.',
      type: 'ngo', verified: true, trustScore: 87, trustTier: 'verified',
      mode: 'public', subscription: 'pro',
      email: 'contact@helpindia.org', phone: '+91-9876543210', website: 'https://helpindia.org',
      address: 'Andheri East, Mumbai', region: 'Maharashtra', coordinates: [72.8777, 19.0760],
      stats: { totalCampaigns: 12, activeCampaigns: 3, totalVolunteers: 45, totalDonationsReceived: 125000, peopleHelped: 8500 },
      createdBy: ngo1._id, isActive: true,
    },
    {
      name: 'CommunityFirst Trust', slug: 'communityfirst-trust',
      description: 'Education and youth empowerment trust working across UP, Bihar, and Delhi. Specializes in school infrastructure and skill training.',
      type: 'ngo', verified: true, trustScore: 74, trustTier: 'verified',
      mode: 'public', subscription: 'free',
      email: 'hello@commfirst.org', phone: '+91-9123456789', website: 'https://commfirst.org',
      address: 'Lajpat Nagar, New Delhi', region: 'Delhi NCR', coordinates: [77.2373, 28.5706],
      stats: { totalCampaigns: 6, activeCampaigns: 2, totalVolunteers: 22, totalDonationsReceived: 45000, peopleHelped: 3200 },
      createdBy: ngo2._id, isActive: true,
    },
  ]);
  console.log('🏢 Created 2 organizations');

  await User.updateOne({ _id: ngo1._id }, { organizationId: org1._id });
  await User.updateOne({ _id: ngo2._id }, { organizationId: org2._id });

  // ── 3. Community Needs ──
  const [n1, n2, n3, n4, n5] = await CommunityNeed.insertMany([
    { title: 'Acute Water Shortage in Dharavi', description: 'Over 2000 families without clean drinking water for 8 days. Borewells dried up. Children drinking contaminated water.', category: 'water', urgency: 'critical', location: 'Dharavi, Mumbai', coordinates: [72.8540, 19.0415], affectedPopulation: 2000, reportedBy: ngo1._id, status: 'active', aiProcessed: true, tags: ['water', 'health', 'emergency'] },
    { title: 'Primary School Roof Collapsed — Azamgarh', description: 'Roof of Section-C collapsed during rains. 340 students studying in the open. Winter approaching.', category: 'education', urgency: 'high', location: 'Azamgarh, Uttar Pradesh', coordinates: [83.1842, 26.0737], affectedPopulation: 340, reportedBy: ngo2._id, status: 'active', aiProcessed: true, tags: ['education', 'construction'] },
    { title: 'Mobile Health Camp Needed — Sundarbans', description: 'Remote villages without healthcare for 3 months. Nearest PHC 45km by boat.', category: 'healthcare', urgency: 'critical', location: 'Sundarbans, West Bengal', coordinates: [88.8857, 21.9497], affectedPopulation: 800, reportedBy: ngo1._id, status: 'active', aiProcessed: true, tags: ['healthcare', 'rural'] },
    { title: 'Youth Unemployment — Skill Training Required', description: '60% youth unemployment in Paharganj. Need IT and vocational training.', category: 'employment', urgency: 'medium', location: 'Paharganj, New Delhi', coordinates: [77.2090, 28.6448], affectedPopulation: 500, reportedBy: ngo2._id, status: 'active', aiProcessed: false, tags: ['employment', 'youth'] },
    { title: 'Open Drain Overflowing — Disease Risk', description: 'Open drain overflowing 2 weeks. Dengue and cholera cases reported. BMC unresponsive.', category: 'sanitation', urgency: 'high', location: 'Kurla West, Mumbai', coordinates: [72.8794, 19.0728], affectedPopulation: 350, reportedBy: ngo1._id, status: 'active', aiProcessed: true, tags: ['sanitation', 'health'] },
  ]);
  console.log('📋 Created 5 community needs');

  // ── 4. Tasks ──
  const now = new Date();
  const in3 = new Date(now.getTime() + 3 * 86400000);
  const in7 = new Date(now.getTime() + 7 * 86400000);
  const in14 = new Date(now.getTime() + 14 * 86400000);

  await Task.insertMany([
    { needId: n1._id, createdBy: ngo1._id, title: 'Water Tanker Coordination — Dharavi', description: 'Coordinate tankers at 5 pickup points.', requiredSkills: ['Event Management', 'Driving'], location: 'Dharavi, Mumbai', coordinates: [72.8540, 19.0415], deadline: in3, volunteersNeeded: 5 },
    { needId: n2._id, createdBy: ngo2._id, title: 'School Roof Emergency Repair', description: 'Assist contractors with materials and cleanup.', requiredSkills: ['Construction', 'Engineering'], location: 'Azamgarh, UP', coordinates: [83.1842, 26.0737], deadline: in14, volunteersNeeded: 8 },
    { needId: n3._id, createdBy: ngo1._id, title: 'Medical Camp Setup & Registration', description: 'Patient registration and first aid support.', requiredSkills: ['Medical', 'First Aid'], location: 'Sundarbans, WB', coordinates: [88.8857, 21.9497], deadline: in7, volunteersNeeded: 10 },
    { needId: n4._id, createdBy: ngo2._id, title: 'IT Skills Trainer — Paharganj Youth', description: 'Weekly training in basic IT and communication.', requiredSkills: ['IT Support', 'Teaching'], location: 'Paharganj, Delhi', coordinates: [77.2090, 28.6448], deadline: in14, volunteersNeeded: 3 },
    { needId: n5._id, createdBy: ngo1._id, title: 'Drain Awareness & BMC Petition', description: 'Organize residents for BMC petition, document with media.', requiredSkills: ['Social Media', 'Photography'], location: 'Kurla, Mumbai', coordinates: [72.8794, 19.0728], deadline: in7, volunteersNeeded: 4 },
  ]);
  console.log('📝 Created 5 tasks');

  // ── 5. Volunteer Profiles ──
  await VolunteerProfile.insertMany([
    { userId: vol1._id, skills: ['Teaching', 'IT Support', 'Social Media'], location: 'Delhi NCR', coordinates: [77.1025, 28.7041], availability: 'weekends', bio: 'Software engineer helping with education.', tasksCompleted: 5, hoursLogged: 40 },
    { userId: vol2._id, skills: ['Medical', 'First Aid', 'Driving'], location: 'Mumbai', coordinates: [72.8777, 19.0760], availability: 'part-time', bio: 'MBBS intern passionate about rural healthcare.', tasksCompleted: 10, hoursLogged: 80 },
    { userId: vol3._id, skills: ['Construction', 'Plumbing', 'Photography'], location: 'Kolkata', coordinates: [88.3639, 22.5726], availability: 'full-time', bio: 'Civil engineer for community infrastructure.', tasksCompleted: 2, hoursLogged: 18 },
  ]);
  console.log('🙋 Created 3 volunteer profiles');

  // ── 6. Campaigns ──
  const in30 = new Date(now.getTime() + 30 * 86400000);
  const in60 = new Date(now.getTime() + 60 * 86400000);
  const in90 = new Date(now.getTime() + 90 * 86400000);

  await Campaign.insertMany([
    {
      organizationId: org1._id, createdBy: ngo1._id,
      title: 'Clean Water for Dharavi 2025',
      description: 'Emergency campaign to install 10 community RO water purifiers in Dharavi sector 4-B.',
      category: 'water', tags: ['water', 'health', 'dharavi'], visibility: 'public', featured: true,
      startDate: now, endDate: in60, status: 'active',
      location: 'Dharavi, Mumbai', region: 'Maharashtra', coordinates: [72.854, 19.0415],
      goals: { volunteersNeeded: 20, volunteersJoined: 12, fundingGoal: 200000, fundingRaised: 87500, peopleToHelp: 2000, peopleHelped: 800 },
      milestones: [
        { title: 'Site assessment complete', targetDate: in3, completed: true, completedAt: now },
        { title: 'First 3 RO units installed', targetDate: in14, completed: false },
        { title: 'Community training on maintenance', targetDate: in30, completed: false },
        { title: 'All 10 units operational', targetDate: in60, completed: false },
      ],
    },
    {
      organizationId: org2._id, createdBy: ngo2._id,
      title: 'Rebuild Schools — UP Storm Recovery',
      description: 'Repair 5 schools in Azamgarh damaged by monsoon storms.',
      category: 'education', tags: ['education', 'construction'], visibility: 'public', featured: true,
      startDate: now, endDate: in90, status: 'active',
      location: 'Azamgarh, UP', region: 'Uttar Pradesh', coordinates: [83.1842, 26.0737],
      goals: { volunteersNeeded: 30, volunteersJoined: 8, fundingGoal: 500000, fundingRaised: 125000, peopleToHelp: 1700, peopleHelped: 340 },
      milestones: [
        { title: 'Damage assessment for all 5 schools', targetDate: in7, completed: true, completedAt: now },
        { title: 'Material procurement', targetDate: in14, completed: false },
      ],
    },
    {
      organizationId: org1._id, createdBy: ngo1._id,
      title: 'Sundarbans Mobile Health Mission',
      description: 'Deploy mobile health camps reaching 12 island villages.',
      category: 'healthcare', tags: ['healthcare', 'rural'], visibility: 'public', featured: false,
      startDate: now, endDate: in30, status: 'active',
      location: 'Sundarbans, WB', region: 'West Bengal', coordinates: [88.8857, 21.9497],
      goals: { volunteersNeeded: 15, volunteersJoined: 6, fundingGoal: 150000, fundingRaised: 42000, peopleToHelp: 800, peopleHelped: 120 },
      milestones: [
        { title: 'Boat logistics arranged', targetDate: in3, completed: true, completedAt: now },
        { title: 'First 4 villages covered', targetDate: in14, completed: false },
      ],
    },
  ]);
  console.log('🎯 Created 3 campaigns');

  // ── 7. Donations ──
  await Donation.insertMany([
    { donorId: donor1._id, organizationId: org1._id, amount: 25000, currency: 'INR', paymentMethod: 'razorpay', paymentStatus: 'completed', razorpayOrderId: 'order_seed_001', razorpayPaymentId: 'pay_seed_001', type: 'one_time', isAnonymous: false, message: 'Keep up the great work HelpIndia!' },
    { donorId: donor1._id, organizationId: org2._id, amount: 10000, currency: 'INR', paymentMethod: 'upi', paymentStatus: 'completed', razorpayOrderId: 'order_seed_002', razorpayPaymentId: 'pay_seed_002', type: 'one_time', isAnonymous: false, message: 'For the children in Azamgarh' },
    { donorId: vol1._id, organizationId: org1._id, amount: 2000, currency: 'INR', paymentMethod: 'razorpay', paymentStatus: 'completed', razorpayOrderId: 'order_seed_003', razorpayPaymentId: 'pay_seed_003', type: 'one_time', isAnonymous: true, message: '' },
    { donorId: donor1._id, organizationId: org1._id, amount: 5000, currency: 'INR', paymentMethod: 'razorpay', paymentStatus: 'completed', razorpayOrderId: 'order_seed_004', razorpayPaymentId: 'pay_seed_004', type: 'recurring', isAnonymous: false, message: 'Monthly contribution for healthcare' },
  ]);
  console.log('💰 Created 4 donations (₹42,000 total)');

  // ── 8. Resources ──
  await Resource.insertMany([
    { organizationId: org1._id, name: 'Water Purification Tablets', category: 'medicine', quantity: 5000, unit: 'tablets', expiryDate: in90, condition: 'new', location: 'Mumbai Warehouse', coordinates: [72.8777, 19.076], allocated: 1200, available: 3800, availableForSharing: true, status: 'available' },
    { organizationId: org1._id, name: 'First Aid Kits', category: 'medicine', quantity: 50, unit: 'kits', expiryDate: in60, condition: 'new', location: 'Mumbai Warehouse', coordinates: [72.8777, 19.076], allocated: 15, available: 35, availableForSharing: true, status: 'available' },
    { organizationId: org1._id, name: 'Emergency Tarpaulins', category: 'shelter', quantity: 200, unit: 'sheets', condition: 'good', location: 'Mumbai Warehouse', coordinates: [72.8777, 19.076], allocated: 180, available: 20, availableForSharing: false, status: 'low_stock' },
    { organizationId: org2._id, name: 'School Roofing Sheets', category: 'equipment', quantity: 100, unit: 'sheets', condition: 'new', location: 'Delhi Storage', coordinates: [77.2373, 28.5706], allocated: 30, available: 70, availableForSharing: true, status: 'available' },
    { organizationId: org2._id, name: 'Textbooks (Hindi Medium)', category: 'other', quantity: 500, unit: 'books', condition: 'new', location: 'Delhi Storage', coordinates: [77.2373, 28.5706], allocated: 0, available: 500, availableForSharing: true, status: 'available' },
    { organizationId: org1._id, name: 'Rice Packets (5kg)', category: 'food', quantity: 300, unit: 'packets', expiryDate: in30, condition: 'new', location: 'Mumbai Warehouse', coordinates: [72.8777, 19.076], allocated: 200, available: 100, availableForSharing: true, status: 'available' },
  ]);
  console.log('📦 Created 6 resources');

  // ── Summary ──
  console.log('\n🎉 Full Ecosystem Seeded!');
  console.log('═══════════════════════════════════');
  console.log('  7 Users | 2 Orgs | 5 Needs | 5 Tasks');
  console.log('  3 Campaigns | 4 Donations | 6 Resources');
  console.log('  3 Volunteer Profiles');
  console.log('');
  console.log('  🔑 All passwords: Password@123');
  console.log('  Admin:     admin@jansetu.in');
  console.log('  NGO:       ngo@helpindia.org');
  console.log('  NGO:       vikram@commfirst.org');
  console.log('  Volunteer: ananya@volunteer.in');
  console.log('  Volunteer: rohit@volunteer.in');
  console.log('  Donor:     arjun@donor.in');
  console.log('═══════════════════════════════════\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
