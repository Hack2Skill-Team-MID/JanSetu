import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

dotenv.config({ path: '../../.env' });

// Models
import { User } from '../models/User';
import Organization from '../models/Organization';
import Campaign from '../models/Campaign';
import { CommunityNeed } from '../models/CommunityNeed';
import Donation from '../models/Donation';
import { Task } from '../models/Task';
import EmergencyEvent from '../models/EmergencyEvent';
import FraudCase from '../models/FraudCase';
import AuditLog from '../models/AuditLog';
import Message from '../models/Message';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jansetu';

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Organization.deleteMany({}),
    Campaign.deleteMany({}),
    CommunityNeed.deleteMany({}),
    Donation.deleteMany({}),
    Task.deleteMany({}),
    EmergencyEvent.deleteMany({}),
    FraudCase.deleteMany({}),
    AuditLog.deleteMany({}),
    Message.deleteMany({}),
  ]);

  const hashedPassword = await bcrypt.hash('password123', 10);

  // ─────────────────────────────────────────
  // USERS
  // ─────────────────────────────────────────
  console.log('👤 Creating users...');
  const platformAdmin = await User.create({
    name: 'Aditya Sharma',
    email: 'admin@jansetu.org',
    password: hashedPassword,
    role: 'platform_admin',
    phone: '+91 98765 43210',
    language: 'en',
    skills: ['management', 'strategy', 'technology'],
    bio: 'Platform administrator for JanSetu',
  });

  const ngoAdmin1 = await User.create({
    name: 'Priya Deshmukh',
    email: 'priya@helpindia.org',
    password: hashedPassword,
    role: 'ngo_admin',
    phone: '+91 87654 32109',
    language: 'hi',
    skills: ['project_management', 'fundraising', 'community_outreach'],
    bio: 'Founder of HelpIndia Foundation, 10 years in rural development.',
  });

  const ngoAdmin2 = await User.create({
    name: 'Kavitha Ramachandran',
    email: 'kavitha@sahayatrust.org',
    password: hashedPassword,
    role: 'ngo_admin',
    phone: '+91 76543 21098',
    language: 'ta',
    skills: ['healthcare', 'education', 'women_empowerment'],
    bio: 'CEO of Sahaya Trust, pioneering healthcare access in Tamil Nadu.',
  });

  const volunteer1 = await User.create({
    name: 'Rohit Kumar',
    email: 'rohit@gmail.com',
    password: hashedPassword,
    role: 'volunteer',
    phone: '+91 65432 10987',
    language: 'en',
    skills: ['teaching', 'data_entry', 'first_aid', 'driving'],
    bio: 'Engineering student passionate about community service.',
    gamification: { points: 450, level: 3, badges: ['first_task', 'team_player', 'early_bird'], streak: 5 },
  });

  const volunteer2 = await User.create({
    name: 'Sneha Patel',
    email: 'sneha@gmail.com',
    password: hashedPassword,
    role: 'volunteer',
    phone: '+91 54321 09876',
    language: 'hi',
    skills: ['healthcare', 'counseling', 'cooking'],
    bio: 'Nurse turned community health volunteer.',
    gamification: { points: 780, level: 5, badges: ['first_task', 'team_player', 'healthcare_hero', 'mentor'], streak: 12 },
  });

  const volunteer3 = await User.create({
    name: 'Arjun Mehta',
    email: 'arjun@gmail.com',
    password: hashedPassword,
    role: 'volunteer',
    phone: '+91 43210 98765',
    language: 'en',
    skills: ['technology', 'web_dev', 'photography'],
    bio: 'Freelance developer volunteering spare time for digital literacy.',
    gamification: { points: 320, level: 2, badges: ['first_task', 'tech_guru'], streak: 3 },
  });

  const donor1 = await User.create({
    name: 'Vikram Singhania',
    email: 'vikram@gmail.com',
    password: hashedPassword,
    role: 'donor',
    phone: '+91 32109 87654',
    language: 'en',
    bio: 'Entrepreneur and philanthropist supporting education causes.',
  });

  const donor2 = await User.create({
    name: 'Meera Agarwal',
    email: 'meera@gmail.com',
    password: hashedPassword,
    role: 'donor',
    phone: '+91 21098 76543',
    language: 'hi',
    bio: 'Corporate CSR coordinator at TechIndia Ltd.',
  });

  // ─────────────────────────────────────────
  // ORGANIZATIONS
  // ─────────────────────────────────────────
  console.log('🏢 Creating organizations...');
  const org1 = await Organization.create({
    name: 'HelpIndia Foundation',
    slug: 'helpindia',
    type: 'ngo',
    description: 'Empowering rural communities through education, healthcare, and sustainable livelihoods. Active across 5 states since 2015.',
    region: 'Maharashtra',
    address: '42 Community Lane, Pune 411038',
    contactEmail: 'contact@helpindia.org',
    contactPhone: '+91 20 2567 8901',
    website: 'https://helpindia.org',
    adminId: ngoAdmin1._id,
    members: [ngoAdmin1._id, volunteer1._id, volunteer2._id],
    verified: true,
    trustScore: 87,
    trustTier: 'gold',
    stats: {
      totalCampaigns: 4,
      activeCampaigns: 2,
      totalVolunteers: 35,
      totalDonationsReceived: 285000,
      peopleHelped: 12500,
    },
    focusAreas: ['education', 'healthcare', 'water_sanitation'],
  });

  const org2 = await Organization.create({
    name: 'Sahaya Trust',
    slug: 'sahaya-trust',
    type: 'ngo',
    description: 'Providing healthcare, women empowerment, and disaster relief across Tamil Nadu. Registered under FCRA with transparent operations.',
    region: 'Tamil Nadu',
    address: '15 Anna Nagar, Chennai 600040',
    contactEmail: 'info@sahayatrust.org',
    contactPhone: '+91 44 2345 6789',
    website: 'https://sahayatrust.org',
    adminId: ngoAdmin2._id,
    members: [ngoAdmin2._id, volunteer3._id],
    verified: true,
    trustScore: 92,
    trustTier: 'platinum',
    stats: {
      totalCampaigns: 3,
      activeCampaigns: 2,
      totalVolunteers: 48,
      totalDonationsReceived: 420000,
      peopleHelped: 18000,
    },
    focusAreas: ['healthcare', 'women_empowerment', 'disaster_relief'],
  });

  // Update users with org IDs
  await User.updateMany(
    { _id: { $in: [ngoAdmin1._id, volunteer1._id, volunteer2._id] } },
    { organizationId: org1._id }
  );
  await User.updateMany(
    { _id: { $in: [ngoAdmin2._id, volunteer3._id] } },
    { organizationId: org2._id }
  );

  // ─────────────────────────────────────────
  // CAMPAIGNS
  // ─────────────────────────────────────────
  console.log('🎯 Creating campaigns...');
  const campaign1 = await Campaign.create({
    title: 'Clean Water for Dharavi 2026',
    description: 'Installing 50 water purification units across Dharavi slum settlements. Each unit provides clean water for 200+ families. Includes community training, maintenance kits, and water quality monitoring for 2 years.',
    category: 'water_sanitation',
    organizationId: org1._id,
    createdBy: ngoAdmin1._id,
    status: 'active',
    visibility: 'public',
    region: 'Maharashtra',
    location: 'Dharavi, Mumbai',
    goals: { fundingGoal: 500000, fundingRaised: 285000, volunteersNeeded: 20, volunteersJoined: 12, peopleToHelp: 10000, peopleHelped: 4200 },
    milestones: [
      { title: 'Site assessment complete', completed: true, completedAt: new Date('2026-03-15') },
      { title: '25 units installed', completed: true, completedAt: new Date('2026-04-01') },
      { title: '50 units installed', completed: false },
      { title: 'Community training', completed: false },
    ],
    featured: true,
  });

  const campaign2 = await Campaign.create({
    title: 'Digital Literacy for Rural Schools',
    description: 'Bringing tablet-based education to 30 village schools in Marathwada. Includes teacher training, offline learning apps, solar charging stations, and 3 years of content updates.',
    category: 'education',
    organizationId: org1._id,
    createdBy: ngoAdmin1._id,
    status: 'active',
    visibility: 'public',
    region: 'Maharashtra',
    location: 'Marathwada Region',
    goals: { fundingGoal: 800000, fundingRaised: 120000, volunteersNeeded: 15, volunteersJoined: 6, peopleToHelp: 3000, peopleHelped: 400 },
    milestones: [
      { title: 'School selection finalized', completed: true, completedAt: new Date('2026-03-20') },
      { title: 'Tablets procured', completed: false },
      { title: 'Teacher training sessions', completed: false },
    ],
  });

  const campaign3 = await Campaign.create({
    title: 'Women Health Camps — Chennai',
    description: 'Monthly health screening camps for women in underprivileged areas of Chennai. Free mammograms, blood tests, nutrition counseling, and referral to partner hospitals.',
    category: 'healthcare',
    organizationId: org2._id,
    createdBy: ngoAdmin2._id,
    status: 'active',
    visibility: 'public',
    region: 'Tamil Nadu',
    location: 'North Chennai',
    goals: { fundingGoal: 300000, fundingRaised: 220000, volunteersNeeded: 30, volunteersJoined: 22, peopleToHelp: 5000, peopleHelped: 3200 },
    milestones: [
      { title: 'Partner hospitals onboarded', completed: true, completedAt: new Date('2026-02-10') },
      { title: '4 camps completed', completed: true, completedAt: new Date('2026-04-05') },
      { title: '8 camps completed', completed: false },
    ],
    featured: true,
  });

  const campaign4 = await Campaign.create({
    title: 'Cyclone Preparedness — Coastal TN',
    description: 'Building disaster-resilient shelters and training 500 community first responders in coastal Tamil Nadu villages. Includes early warning system setup.',
    category: 'disaster_relief',
    organizationId: org2._id,
    createdBy: ngoAdmin2._id,
    status: 'active',
    visibility: 'public',
    region: 'Tamil Nadu',
    location: 'Nagapattinam District',
    goals: { fundingGoal: 1200000, fundingRaised: 340000, volunteersNeeded: 40, volunteersJoined: 18, peopleToHelp: 25000, peopleHelped: 5000 },
    milestones: [
      { title: 'Village assessment', completed: true, completedAt: new Date('2026-03-01') },
      { title: 'First responder training — batch 1', completed: true, completedAt: new Date('2026-04-10') },
      { title: 'Shelter construction begins', completed: false },
    ],
  });

  // ─────────────────────────────────────────
  // COMMUNITY NEEDS
  // ─────────────────────────────────────────
  console.log('📋 Creating community needs...');
  const needs = await CommunityNeed.insertMany([
    { ngoId: ngoAdmin1._id, title: 'Water supply disrupted in Kothrud slum', description: 'Municipal water not reaching 200 households for 3 weeks.', category: 'water_sanitation', urgencyLevel: 'critical', priorityScore: 95, status: 'in_progress', location: 'Kothrud, Pune', region: 'Maharashtra', affectedPopulation: 800, sourceType: 'community_report' },
    { ngoId: ngoAdmin1._id, title: 'School needs blackboard repairs', description: '4 classrooms have damaged blackboards affecting 120 students.', category: 'education', urgencyLevel: 'medium', priorityScore: 55, status: 'reported', location: 'Hadapsar, Pune', region: 'Maharashtra', affectedPopulation: 120, sourceType: 'field_report' },
    { ngoId: ngoAdmin2._id, title: 'Elderly care needed in Mylapore', description: '15 elderly residents need weekly health checkups and medication.', category: 'healthcare', urgencyLevel: 'high', priorityScore: 78, status: 'in_progress', location: 'Mylapore, Chennai', region: 'Tamil Nadu', affectedPopulation: 15, sourceType: 'field_report' },
    { ngoId: ngoAdmin2._id, title: 'Flood damage to fishing village', description: 'Recent flooding damaged 30 houses and a community center.', category: 'shelter', urgencyLevel: 'critical', priorityScore: 92, status: 'reported', location: 'Nagapattinam, Tamil Nadu', region: 'Tamil Nadu', affectedPopulation: 250, sourceType: 'community_report' },
    { ngoId: ngoAdmin1._id, title: 'Malnutrition among children under 5', description: 'Survey reveals 40% malnutrition rate in Yavatmal district villages.', category: 'food_nutrition', urgencyLevel: 'high', priorityScore: 85, status: 'reported', location: 'Yavatmal, Maharashtra', region: 'Maharashtra', affectedPopulation: 3000, sourceType: 'survey' },
  ]);

  // ─────────────────────────────────────────
  // DONATIONS
  // ─────────────────────────────────────────
  console.log('💰 Creating donations...');
  await Donation.insertMany([
    { donorId: donor1._id, organizationId: org1._id, campaignId: campaign1._id, amount: 25000, type: 'one_time', paymentStatus: 'completed', razorpayOrderId: `order_${crypto.randomBytes(8).toString('hex')}`, razorpayPaymentId: `pay_${crypto.randomBytes(8).toString('hex')}`, message: 'Clean water changes lives!' },
    { donorId: donor1._id, organizationId: org2._id, campaignId: campaign3._id, amount: 15000, type: 'one_time', paymentStatus: 'completed', razorpayOrderId: `order_${crypto.randomBytes(8).toString('hex')}`, razorpayPaymentId: `pay_${crypto.randomBytes(8).toString('hex')}`, message: 'Women health is a priority.' },
    { donorId: donor2._id, organizationId: org1._id, campaignId: campaign1._id, amount: 50000, type: 'one_time', paymentStatus: 'completed', razorpayOrderId: `order_${crypto.randomBytes(8).toString('hex')}`, razorpayPaymentId: `pay_${crypto.randomBytes(8).toString('hex')}`, message: 'CSR contribution from TechIndia.' },
    { donorId: donor2._id, organizationId: org2._id, campaignId: campaign4._id, amount: 100000, type: 'one_time', paymentStatus: 'completed', razorpayOrderId: `order_${crypto.randomBytes(8).toString('hex')}`, razorpayPaymentId: `pay_${crypto.randomBytes(8).toString('hex')}`, message: 'Cyclone preparedness is critical for coastal communities.' },
    { donorId: donor1._id, organizationId: org1._id, campaignId: campaign2._id, amount: 10000, type: 'recurring', paymentStatus: 'completed', razorpayOrderId: `order_${crypto.randomBytes(8).toString('hex')}`, razorpayPaymentId: `pay_${crypto.randomBytes(8).toString('hex')}`, message: 'Monthly support for digital education.' },
  ]);

  // ─────────────────────────────────────────
  // EMERGENCY
  // ─────────────────────────────────────────
  console.log('🚨 Creating active emergency...');
  await EmergencyEvent.create({
    organizationId: org2._id,
    declarationType: 'flood',
    title: 'Chennai Coastal Flooding — April 2026',
    description: 'Heavy unseasonal rains have caused flooding in 3 coastal districts of Tamil Nadu. Over 2,000 families displaced. Immediate need for food, shelter, and medical supplies.',
    severity: 'level_2',
    affectedArea: { name: 'North Chennai Coast', coordinates: [80.2707, 13.0827], radiusKm: 25 },
    status: 'active',
    activatedBy: ngoAdmin2._id,
    activatedAt: new Date(),
    estimatedAffectedPeople: 12000,
    autoActions: { broadcastSent: true, tasksCreated: 3, resourcesLocked: 5, needsCreated: 2 },
  });

  // ─────────────────────────────────────────
  // FRAUD CASES
  // ─────────────────────────────────────────
  console.log('🔍 Creating fraud cases...');
  await FraudCase.create({
    caseNumber: 'FRAUD-2026-0001',
    source: 'ai_detection',
    entityType: 'campaign',
    entityId: campaign2._id,
    entityTitle: 'Suspicious donation velocity pattern',
    severity: 'medium',
    status: 'investigating',
    assignedTo: platformAdmin._id,
    reportedBy: platformAdmin._id,
    aiAnalysis: { riskScore: 62, flags: ['3x normal donation rate in 24hrs', 'Multiple donations from same IP', 'New donor accounts created in burst'], recommendation: 'Manual review — likely promotional campaign, not fraud' },
    notes: [
      { author: platformAdmin._id, authorName: 'Aditya Sharma', content: 'Investigating — appears to be a social media viral moment, not fraud.', timestamp: new Date() },
    ],
  });

  await FraudCase.create({
    caseNumber: 'FRAUD-2026-0002',
    source: 'community_flag',
    entityType: 'user',
    entityId: volunteer3._id,
    entityTitle: 'Reported fake volunteer hours',
    severity: 'low',
    status: 'dismissed',
    reportedBy: ngoAdmin1._id,
    resolution: { action: 'dismiss', details: 'Community reporter confirmed hours were legitimate but logged under wrong task.', resolvedBy: platformAdmin._id, timestamp: new Date() },
  });

  // ─────────────────────────────────────────
  // AUDIT LOGS
  // ─────────────────────────────────────────
  console.log('📋 Creating audit logs...');
  const auditEvents = [
    { action: 'create', entity: 'organization', actorId: ngoAdmin1._id, actorName: 'Priya Deshmukh', organizationId: org1._id, description: 'Organization created: HelpIndia Foundation' },
    { action: 'create', entity: 'campaign', actorId: ngoAdmin1._id, actorName: 'Priya Deshmukh', organizationId: org1._id, description: 'Campaign created: Clean Water for Dharavi 2026' },
    { action: 'donation', entity: 'donation', actorId: donor1._id, actorName: 'Vikram Singhania', description: 'Donation: ₹25,000 to Clean Water for Dharavi' },
    { action: 'create', entity: 'campaign', actorId: ngoAdmin2._id, actorName: 'Kavitha Ramachandran', organizationId: org2._id, description: 'Campaign created: Women Health Camps — Chennai' },
    { action: 'donation', entity: 'donation', actorId: donor2._id, actorName: 'Meera Agarwal', description: 'Donation: ₹100,000 to Cyclone Preparedness' },
    { action: 'emergency_activate', entity: 'emergency', actorId: ngoAdmin2._id, actorName: 'Kavitha Ramachandran', organizationId: org2._id, description: 'Emergency declared: Chennai Coastal Flooding' },
    { action: 'fraud_flag', entity: 'fraud_case', actorId: platformAdmin._id, actorName: 'Aditya Sharma', description: 'Fraud case FRAUD-2026-0001 opened: Suspicious donation velocity' },
    { action: 'login', entity: 'user', actorId: platformAdmin._id, actorName: 'Aditya Sharma', description: 'Admin login from Mumbai IP' },
  ];

  for (const event of auditEvents) {
    await AuditLog.create({
      ...event,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // random time in last 7 days
      ip: `103.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    });
  }

  // ─────────────────────────────────────────
  // DONE
  // ─────────────────────────────────────────
  console.log('\n✅ SEED COMPLETE! Here are the demo credentials:\n');
  console.log('┌──────────────────────────────────────────────────────┐');
  console.log('│  Role            │ Email                  │ Password │');
  console.log('├──────────────────┼────────────────────────┼──────────┤');
  console.log('│  Platform Admin  │ admin@jansetu.org       │ password123 │');
  console.log('│  NGO Admin       │ priya@helpindia.org     │ password123 │');
  console.log('│  NGO Admin       │ kavitha@sahayatrust.org │ password123 │');
  console.log('│  Volunteer       │ rohit@gmail.com         │ password123 │');
  console.log('│  Volunteer       │ sneha@gmail.com         │ password123 │');
  console.log('│  Donor           │ vikram@gmail.com        │ password123 │');
  console.log('└──────────────────────────────────────────────────────┘');
  console.log(`\n📊 Seeded: 8 users, 2 orgs, 4 campaigns, 5 needs, 5 donations, 1 emergency, 2 fraud cases, 8 audit logs\n`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
