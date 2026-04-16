import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

dotenv.config({ path: '../../.env' });

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/jansetu';
const pool = new Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function seed() {
  console.log('🌱 Connecting to PostgreSQL...');
  await prisma.$connect();
  console.log('✅ Connected');

  // Clear existing data (order matters due to FKs)
  console.log('🗑️  Clearing existing data...');
  // Truncate all tables in one shot — bypasses FK ordering issues
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "FraudCaseNote", "TaskApplication", "ResourceAllocation",
      "AuditLog", "Message", "FraudCase", "EmergencyEvent",
      "Donation", "Task", "CommunityNeed", "SurveyUpload",
      "Campaign", "Resource", "VolunteerProfile", "Notification",
      "Organization", "User"
    RESTART IDENTITY CASCADE
  `);

  const hashedPassword = await bcrypt.hash('password123', 10);

  // ─────────────────────────────────────────
  // USERS (created without orgId first)
  // ─────────────────────────────────────────
  console.log('👤 Creating users...');
  const platformAdmin = await prisma.user.create({
    data: {
      name: 'Aditya Sharma',
      email: 'admin@jansetu.org',
      password: hashedPassword,
      role: 'platform_admin',
      language: 'en',
      badges: ['management', 'strategy', 'technology'],
    },
  });

  const ngoAdmin1 = await prisma.user.create({
    data: {
      name: 'Priya Deshmukh',
      email: 'priya@helpindia.org',
      password: hashedPassword,
      role: 'ngo_admin',
      language: 'hi',
      badges: ['project_management', 'fundraising', 'community_outreach'],
    },
  });

  const ngoAdmin2 = await prisma.user.create({
    data: {
      name: 'Kavitha Ramachandran',
      email: 'kavitha@sahayatrust.org',
      password: hashedPassword,
      role: 'ngo_admin',
      language: 'ta',
      badges: ['healthcare', 'education', 'women_empowerment'],
    },
  });

  const volunteer1 = await prisma.user.create({
    data: {
      name: 'Rohit Kumar',
      email: 'rohit@gmail.com',
      password: hashedPassword,
      role: 'volunteer',
      language: 'en',
      badges: ['first_task', 'team_player', 'early_bird'],
      points: 450,
      reputationScore: 75,
    },
  });

  const volunteer2 = await prisma.user.create({
    data: {
      name: 'Sneha Patel',
      email: 'sneha@gmail.com',
      password: hashedPassword,
      role: 'volunteer',
      language: 'hi',
      badges: ['first_task', 'team_player', 'healthcare_hero', 'mentor'],
      points: 780,
      reputationScore: 90,
    },
  });

  const volunteer3 = await prisma.user.create({
    data: {
      name: 'Arjun Mehta',
      email: 'arjun@gmail.com',
      password: hashedPassword,
      role: 'volunteer',
      language: 'en',
      badges: ['first_task', 'tech_guru'],
      points: 320,
      reputationScore: 65,
    },
  });

  const donor1 = await prisma.user.create({
    data: {
      name: 'Vikram Singhania',
      email: 'vikram@gmail.com',
      password: hashedPassword,
      role: 'donor',
      language: 'en',
    },
  });

  const donor2 = await prisma.user.create({
    data: {
      name: 'Meera Agarwal',
      email: 'meera@gmail.com',
      password: hashedPassword,
      role: 'donor',
      language: 'hi',
    },
  });

  // Create volunteer profiles
  await prisma.volunteerProfile.createMany({
    data: [
      { userId: volunteer1.id, skills: ['teaching', 'data_entry', 'first_aid', 'driving'], location: 'Pune, Maharashtra', availability: 'weekends', impactScore: 45 },
      { userId: volunteer2.id, skills: ['healthcare', 'counseling', 'cooking'], location: 'Pune, Maharashtra', availability: 'part-time', impactScore: 78 },
      { userId: volunteer3.id, skills: ['technology', 'web_dev', 'photography'], location: 'Chennai, Tamil Nadu', availability: 'evenings', impactScore: 32 },
    ],
  });

  // ─────────────────────────────────────────
  // ORGANIZATIONS
  // ─────────────────────────────────────────
  console.log('🏢 Creating organizations...');
  const org1 = await prisma.organization.create({
    data: {
      name: 'HelpIndia Foundation',
      slug: 'helpindia',
      type: 'ngo',
      description: 'Empowering rural communities through education, healthcare, and sustainable livelihoods. Active across 5 states since 2015.',
      region: 'Maharashtra',
      address: '42 Community Lane, Pune 411038',
      email: 'contact@helpindia.org',
      phone: '+91 20 2567 8901',
      website: 'https://helpindia.org',
      createdById: ngoAdmin1.id,
      verified: true,
      trustScore: 87,
      trustTier: 'gold',
      mode: 'public',
      statsTotalCampaigns: 4,
      statsActiveCampaigns: 2,
      statsTotalVolunteers: 35,
      statsTotalDonationsReceived: 285000,
      statsPeopleHelped: 12500,
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: 'Sahaya Trust',
      slug: 'sahaya-trust',
      type: 'ngo',
      description: 'Providing healthcare, women empowerment, and disaster relief across Tamil Nadu. Registered under FCRA with transparent operations.',
      region: 'Tamil Nadu',
      address: '15 Anna Nagar, Chennai 600040',
      email: 'info@sahayatrust.org',
      phone: '+91 44 2345 6789',
      website: 'https://sahayatrust.org',
      createdById: ngoAdmin2.id,
      verified: true,
      trustScore: 92,
      trustTier: 'platinum',
      mode: 'public',
      statsTotalCampaigns: 3,
      statsActiveCampaigns: 2,
      statsTotalVolunteers: 48,
      statsTotalDonationsReceived: 420000,
      statsPeopleHelped: 18000,
    },
  });

  // Update users with org IDs
  await prisma.user.updateMany({
    where: { id: { in: [ngoAdmin1.id, volunteer1.id, volunteer2.id] } },
    data: { organizationId: org1.id },
  });
  await prisma.user.updateMany({
    where: { id: { in: [ngoAdmin2.id, volunteer3.id] } },
    data: { organizationId: org2.id },
  });

  // ─────────────────────────────────────────
  // CAMPAIGNS
  // ─────────────────────────────────────────
  console.log('🎯 Creating campaigns...');
  const campaign1 = await prisma.campaign.create({
    data: {
      title: 'Clean Water for Dharavi 2026',
      description: 'Installing 50 water purification units across Dharavi slum settlements. Each unit provides clean water for 200+ families. Includes community training, maintenance kits, and water quality monitoring for 2 years.',
      category: 'water_sanitation',
      organizationId: org1.id,
      createdById: ngoAdmin1.id,
      status: 'active',
      visibility: 'public',
      region: 'Maharashtra',
      location: 'Dharavi, Mumbai',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      goalsVolunteersNeeded: 20,
      goalsVolunteersJoined: 12,
      goalsFundingGoal: 500000,
      goalsFundingRaised: 285000,
      goalsPeopleToHelp: 10000,
      goalsPeopleHelped: 4200,
      milestones: [
        { title: 'Site assessment complete', completed: true, completedAt: '2026-03-15' },
        { title: '25 units installed', completed: true, completedAt: '2026-04-01' },
        { title: '50 units installed', completed: false },
        { title: 'Community training', completed: false },
      ],
      featured: true,
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      title: 'Digital Literacy for Rural Schools',
      description: 'Bringing tablet-based education to 30 village schools in Marathwada. Includes teacher training, offline learning apps, solar charging stations, and 3 years of content updates.',
      category: 'education',
      organizationId: org1.id,
      createdById: ngoAdmin1.id,
      status: 'active',
      visibility: 'public',
      region: 'Maharashtra',
      location: 'Marathwada Region',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2027-02-01'),
      goalsVolunteersNeeded: 15,
      goalsVolunteersJoined: 6,
      goalsFundingGoal: 800000,
      goalsFundingRaised: 120000,
      goalsPeopleToHelp: 3000,
      goalsPeopleHelped: 400,
      milestones: [
        { title: 'School selection finalized', completed: true, completedAt: '2026-03-20' },
        { title: 'Tablets procured', completed: false },
        { title: 'Teacher training sessions', completed: false },
      ],
    },
  });

  const campaign3 = await prisma.campaign.create({
    data: {
      title: 'Women Health Camps — Chennai',
      description: 'Monthly health screening camps for women in underprivileged areas of Chennai. Free mammograms, blood tests, nutrition counseling, and referral to partner hospitals.',
      category: 'healthcare',
      organizationId: org2.id,
      createdById: ngoAdmin2.id,
      status: 'active',
      visibility: 'public',
      region: 'Tamil Nadu',
      location: 'North Chennai',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      goalsVolunteersNeeded: 30,
      goalsVolunteersJoined: 22,
      goalsFundingGoal: 300000,
      goalsFundingRaised: 220000,
      goalsPeopleToHelp: 5000,
      goalsPeopleHelped: 3200,
      milestones: [
        { title: 'Partner hospitals onboarded', completed: true, completedAt: '2026-02-10' },
        { title: '4 camps completed', completed: true, completedAt: '2026-04-05' },
        { title: '8 camps completed', completed: false },
      ],
      featured: true,
    },
  });

  const campaign4 = await prisma.campaign.create({
    data: {
      title: 'Cyclone Preparedness — Coastal TN',
      description: 'Building disaster-resilient shelters and training 500 community first responders in coastal Tamil Nadu villages. Includes early warning system setup.',
      category: 'disaster_relief',
      organizationId: org2.id,
      createdById: ngoAdmin2.id,
      status: 'active',
      visibility: 'public',
      region: 'Tamil Nadu',
      location: 'Nagapattinam District',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-06-30'),
      goalsVolunteersNeeded: 40,
      goalsVolunteersJoined: 18,
      goalsFundingGoal: 1200000,
      goalsFundingRaised: 340000,
      goalsPeopleToHelp: 25000,
      goalsPeopleHelped: 5000,
      milestones: [
        { title: 'Village assessment', completed: true, completedAt: '2026-03-01' },
        { title: 'First responder training — batch 1', completed: true, completedAt: '2026-04-10' },
        { title: 'Shelter construction begins', completed: false },
      ],
    },
  });

  // ─────────────────────────────────────────
  // COMMUNITY NEEDS
  // ─────────────────────────────────────────
  console.log('📋 Creating community needs...');
  await prisma.communityNeed.createMany({
    data: [
      { ngoId: ngoAdmin1.id, title: 'Water supply disrupted in Kothrud slum', description: 'Municipal water not reaching 200 households for 3 weeks.', category: 'water_sanitation', urgencyLevel: 'critical', priorityScore: 95, status: 'in_progress', location: 'Kothrud, Pune', region: 'Maharashtra', affectedPopulation: 800, sourceType: 'community_report' },
      { ngoId: ngoAdmin1.id, title: 'School needs blackboard repairs', description: '4 classrooms have damaged blackboards affecting 120 students.', category: 'education', urgencyLevel: 'medium', priorityScore: 55, status: 'reported', location: 'Hadapsar, Pune', region: 'Maharashtra', affectedPopulation: 120, sourceType: 'field_report' },
      { ngoId: ngoAdmin2.id, title: 'Elderly care needed in Mylapore', description: '15 elderly residents need weekly health checkups and medication.', category: 'healthcare', urgencyLevel: 'high', priorityScore: 78, status: 'in_progress', location: 'Mylapore, Chennai', region: 'Tamil Nadu', affectedPopulation: 15, sourceType: 'field_report' },
      { ngoId: ngoAdmin2.id, title: 'Flood damage to fishing village', description: 'Recent flooding damaged 30 houses and a community center.', category: 'shelter', urgencyLevel: 'critical', priorityScore: 92, status: 'reported', location: 'Nagapattinam, Tamil Nadu', region: 'Tamil Nadu', affectedPopulation: 250, sourceType: 'community_report' },
      { ngoId: ngoAdmin1.id, title: 'Malnutrition among children under 5', description: 'Survey reveals 40% malnutrition rate in Yavatmal district villages.', category: 'food_nutrition', urgencyLevel: 'high', priorityScore: 85, status: 'reported', location: 'Yavatmal, Maharashtra', region: 'Maharashtra', affectedPopulation: 3000, sourceType: 'survey' },
    ],
  });

  // ─────────────────────────────────────────
  // DONATIONS
  // ─────────────────────────────────────────
  console.log('💰 Creating donations...');
  await prisma.donation.createMany({
    data: [
      { donorId: donor1.id, organizationId: org1.id, campaignId: campaign1.id, amount: 25000, type: 'one_time', paymentStatus: 'completed', razorpayOrderId: `order_${crypto.randomBytes(8).toString('hex')}`, razorpayPaymentId: `pay_${crypto.randomBytes(8).toString('hex')}`, message: 'Clean water changes lives!' },
      { donorId: donor1.id, organizationId: org2.id, campaignId: campaign3.id, amount: 15000, type: 'one_time', paymentStatus: 'completed', razorpayOrderId: `order_${crypto.randomBytes(8).toString('hex')}`, razorpayPaymentId: `pay_${crypto.randomBytes(8).toString('hex')}`, message: 'Women health is a priority.' },
      { donorId: donor2.id, organizationId: org1.id, campaignId: campaign1.id, amount: 50000, type: 'one_time', paymentStatus: 'completed', razorpayOrderId: `order_${crypto.randomBytes(8).toString('hex')}`, razorpayPaymentId: `pay_${crypto.randomBytes(8).toString('hex')}`, message: 'CSR contribution from TechIndia.' },
      { donorId: donor2.id, organizationId: org2.id, campaignId: campaign4.id, amount: 100000, type: 'one_time', paymentStatus: 'completed', razorpayOrderId: `order_${crypto.randomBytes(8).toString('hex')}`, razorpayPaymentId: `pay_${crypto.randomBytes(8).toString('hex')}`, message: 'Cyclone preparedness is critical for coastal communities.' },
      { donorId: donor1.id, organizationId: org1.id, campaignId: campaign2.id, amount: 10000, type: 'recurring', paymentStatus: 'completed', razorpayOrderId: `order_${crypto.randomBytes(8).toString('hex')}`, razorpayPaymentId: `pay_${crypto.randomBytes(8).toString('hex')}`, message: 'Monthly support for digital education.' },
    ],
  });

  // ─────────────────────────────────────────
  // EMERGENCY
  // ─────────────────────────────────────────
  console.log('🚨 Creating active emergency...');
  await prisma.emergencyEvent.create({
    data: {
      organizationId: org2.id,
      declarationType: 'flood',
      title: 'Chennai Coastal Flooding — April 2026',
      description: 'Heavy unseasonal rains have caused flooding in 3 coastal districts of Tamil Nadu. Over 2,000 families displaced. Immediate need for food, shelter, and medical supplies.',
      severity: 'level_2',
      affectedAreaName: 'North Chennai Coast',
      affectedAreaCoordinates: [80.2707, 13.0827],
      affectedAreaRadiusKm: 25,
      status: 'active',
      activatedById: ngoAdmin2.id,
      estimatedAffectedPeople: 12000,
      autoActionBroadcastSent: true,
      autoActionTasksCreated: 3,
      autoActionResourcesLocked: 5,
      autoActionNeedsCreated: 2,
    },
  });

  // ─────────────────────────────────────────
  // FRAUD CASES
  // ─────────────────────────────────────────
  console.log('🔍 Creating fraud cases...');
  const fraud1 = await prisma.fraudCase.create({
    data: {
      caseNumber: 'FRAUD-2026-0001',
      source: 'ai_detection',
      entityType: 'campaign',
      entityId: campaign2.id,
      entityTitle: 'Suspicious donation velocity pattern',
      severity: 'medium',
      status: 'investigating',
      assignedToId: platformAdmin.id,
      reportedById: platformAdmin.id,
      aiAnalysis: { riskScore: 62, flags: ['3x normal donation rate in 24hrs', 'Multiple donations from same IP', 'New donor accounts created in burst'], recommendation: 'Manual review — likely promotional campaign, not fraud' },
    },
  });

  await prisma.fraudCaseNote.create({
    data: {
      fraudCaseId: fraud1.id,
      authorId: platformAdmin.id,
      authorName: 'Aditya Sharma',
      content: 'Investigating — appears to be a social media viral moment, not fraud.',
    },
  });

  await prisma.fraudCase.create({
    data: {
      caseNumber: 'FRAUD-2026-0002',
      source: 'community_flag',
      entityType: 'user',
      entityId: volunteer3.id,
      entityTitle: 'Reported fake volunteer hours',
      severity: 'low',
      status: 'dismissed',
      reportedById: ngoAdmin1.id,
      resolutionAction: 'dismiss',
      resolutionDetails: 'Community reporter confirmed hours were legitimate but logged under wrong task.',
      resolutionById: platformAdmin.id,
      resolutionAt: new Date(),
    },
  });

  // ─────────────────────────────────────────
  // AUDIT LOGS
  // ─────────────────────────────────────────
  console.log('📋 Creating audit logs...');
  const auditEvents = [
    { action: 'create', entity: 'organization', actorId: ngoAdmin1.id, actorName: 'Priya Deshmukh', organizationId: org1.id, description: 'Organization created: HelpIndia Foundation' },
    { action: 'create', entity: 'campaign', actorId: ngoAdmin1.id, actorName: 'Priya Deshmukh', organizationId: org1.id, description: 'Campaign created: Clean Water for Dharavi 2026' },
    { action: 'donation', entity: 'donation', actorId: donor1.id, actorName: 'Vikram Singhania', description: 'Donation: ₹25,000 to Clean Water for Dharavi' },
    { action: 'create', entity: 'campaign', actorId: ngoAdmin2.id, actorName: 'Kavitha Ramachandran', organizationId: org2.id, description: 'Campaign created: Women Health Camps — Chennai' },
    { action: 'donation', entity: 'donation', actorId: donor2.id, actorName: 'Meera Agarwal', description: 'Donation: ₹100,000 to Cyclone Preparedness' },
    { action: 'emergency_activate', entity: 'emergency', actorId: ngoAdmin2.id, actorName: 'Kavitha Ramachandran', organizationId: org2.id, description: 'Emergency declared: Chennai Coastal Flooding' },
    { action: 'fraud_flag', entity: 'fraud_case', actorId: platformAdmin.id, actorName: 'Aditya Sharma', description: 'Fraud case FRAUD-2026-0001 opened: Suspicious donation velocity' },
    { action: 'login', entity: 'user', actorId: platformAdmin.id, actorName: 'Aditya Sharma', description: 'Admin login from Mumbai IP' },
  ];

  for (const event of auditEvents) {
    await prisma.auditLog.create({
      data: {
        ...event,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        ip: `103.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      },
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

  await prisma.$disconnect();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error('❌ Seed failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
