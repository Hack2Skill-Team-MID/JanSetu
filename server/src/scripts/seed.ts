// @ts-nocheck
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
      "SurveyResponse", "SurveyQuestion", "Survey",
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

  const ngoAdmin3 = await prisma.user.create({
    data: { name: 'Sanjay Gupta', email: 'sanjay@greenearth.org', password: hashedPassword, role: 'ngo_admin', language: 'hi', badges: ['environment', 'community_building'] },
  });

  const volunteer3 = await prisma.user.create({
    data: { name: 'Arjun Mehta', email: 'arjun@gmail.com', password: hashedPassword, role: 'volunteer', language: 'en', badges: ['first_task', 'tech_guru'], points: 320, reputationScore: 65 },
  });

  const volunteer4 = await prisma.user.create({
    data: { name: 'Ravi Verma', email: 'ravi@gmail.com', password: hashedPassword, role: 'volunteer', language: 'hi', badges: ['first_task', 'community_voice', 'early_bird'], points: 512, reputationScore: 82 },
  });

  const volunteer5 = await prisma.user.create({
    data: { name: 'Deepa Iyer', email: 'deepa@gmail.com', password: hashedPassword, role: 'volunteer', language: 'ta', badges: ['first_task', 'mentor'], points: 890, reputationScore: 94 },
  });

  const volunteer6 = await prisma.user.create({
    data: { name: 'Sunil Gavaskar', email: 'sunil@gmail.com', password: hashedPassword, role: 'volunteer', language: 'en', badges: ['first_task', 'logistics_expert'], points: 215, reputationScore: 68 },
  });

  const donor1 = await prisma.user.create({
    data: { name: 'Vikram Singhania', email: 'vikram@gmail.com', password: hashedPassword, role: 'donor', language: 'en'},
  });

  const donor2 = await prisma.user.create({
    data: { name: 'Meera Agarwal', email: 'meera@gmail.com', password: hashedPassword, role: 'donor', language: 'hi'},
  });

  const donor3 = await prisma.user.create({
    data: { name: 'Ananya Birla', email: 'ananya@gmail.com', password: hashedPassword, role: 'donor', language: 'en'},
  });

  const donor4 = await prisma.user.create({
    data: { name: 'Siddarth Mallya', email: 'siddarth@gmail.com', password: hashedPassword, role: 'donor', language: 'en'},
  });

  // Create volunteer profiles
  await prisma.volunteerProfile.createMany({
    data: [
      { userId: volunteer1.id, skills: ['teaching', 'data_entry', 'first_aid', 'driving'], location: 'Pune, Maharashtra', availability: 'weekends', impactScore: 45 },
      { userId: volunteer2.id, skills: ['healthcare', 'counseling', 'cooking'], location: 'Pune, Maharashtra', availability: 'part-time', impactScore: 78 },
      { userId: volunteer3.id, skills: ['technology', 'web_dev', 'photography'], location: 'Chennai, Tamil Nadu', availability: 'evenings', impactScore: 32 },
      { userId: volunteer4.id, skills: ['logistics', 'driving', 'construction'], location: 'Mumbai, Maharashtra', availability: 'full-time', impactScore: 55 },
      { userId: volunteer5.id, skills: ['healthcare', 'education', 'social_work'], location: 'Bangalore, Karnataka', availability: 'weekends', impactScore: 88 },
      { userId: volunteer6.id, skills: ['it_support', 'translation', 'data_entry'], location: 'Delhi NCR', availability: 'available', impactScore: 24 },
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

  const org3 = await prisma.organization.create({
    data: {
      name: 'GreenEarth India', slug: 'greenearth-india', type: 'ngo',
      description: 'Focused on reforestation, sustainable agriculture, and climate resilience.',
      region: 'Delhi NCR', address: '12 Green Avenue, New Delhi', email: 'admin@greenearth.org', phone: '+91 11 2345 6789',
      website: 'https://greenearth.org', createdById: ngoAdmin3.id, verified: true, trustScore: 95, trustTier: 'platinum', mode: 'public',
      statsTotalCampaigns: 5, statsActiveCampaigns: 3, statsTotalVolunteers: 60, statsTotalDonationsReceived: 550000, statsPeopleHelped: 15000,
    },
  });

  // Update users with org IDs
  await prisma.user.updateMany({
    where: { id: { in: [ngoAdmin1.id, volunteer1.id, volunteer4.id] } },
    data: { organizationId: org1.id },
  });
  await prisma.user.updateMany({
    where: { id: { in: [ngoAdmin2.id, volunteer2.id, volunteer5.id] } },
    data: { organizationId: org2.id },
  });
  await prisma.user.updateMany({
    where: { id: { in: [ngoAdmin3.id, volunteer3.id, volunteer6.id] } },
    data: { organizationId: org3.id },
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

  const campaign5 = await prisma.campaign.create({
    data: {
      title: 'Himalayan Reforestation Drive',
      description: 'Planting 50,000 native trees across deforested slopes in Uttarakhand to prevent mudslides and restore local ecology. Includes 5-year maintenance plans.',
      category: 'environment',
      organizationId: org3.id,
      createdById: ngoAdmin3.id,
      status: 'active',
      visibility: 'public',
      region: 'Uttarakhand',
      location: 'Dehradun & Surrounding',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2028-06-01'),
      goalsVolunteersNeeded: 100,
      goalsVolunteersJoined: 34,
      goalsFundingGoal: 450000,
      goalsFundingRaised: 120000,
      goalsPeopleToHelp: 0,
      goalsPeopleHelped: 0,
      milestones: [
        { title: 'Saplings procured', completed: true, completedAt: '2026-05-15' },
        { title: 'First 10,000 planted', completed: false },
        { title: 'Survival audit 1', completed: false },
      ],
    },
  });

  const campaign6 = await prisma.campaign.create({
    data: {
      title: 'Solar Panels for Rural Hospitals',
      description: 'Equipping 10 primary healthcare centers with 5kW solar setups & battery backups to ensure uninterrupted power for life-saving equipment.',
      category: 'healthcare',
      organizationId: org3.id,
      createdById: ngoAdmin3.id,
      status: 'active',
      visibility: 'public',
      region: 'Uttar Pradesh',
      location: 'Varanasi District',
      startDate: new Date('2026-03-15'),
      endDate: new Date('2026-10-15'),
      goalsVolunteersNeeded: 12,
      goalsVolunteersJoined: 5,
      goalsFundingGoal: 1500000,
      goalsFundingRaised: 890000,
      goalsPeopleToHelp: 50000,
      goalsPeopleHelped: 12000,
      milestones: [
        { title: 'Hospital selection', completed: true, completedAt: '2026-04-01' },
        { title: '3 installations completed', completed: true, completedAt: '2026-04-20' },
        { title: '5 installations completed', completed: false },
      ],
      featured: true,
    },
  });

  // ─────────────────────────────────────────
  // COMMUNITY NEEDS (15 geo-coded needs across India)
  // ─────────────────────────────────────────
  console.log('📋 Creating community needs...');
  await prisma.communityNeed.createMany({
    data: [
      // ── Delhi NCR ──
      {
        ngoId: ngoAdmin1.id, title: 'Dengue Outbreak — Old Delhi Slums',
        description: '300+ dengue cases reported in Walled City cluster. Urgent need for mosquito fogging, ORS packets and medical volunteers.',
        category: 'healthcare', urgencyLevel: 'critical', priorityScore: 97, status: 'reported',
        location: 'Old Delhi, Delhi', region: 'Delhi NCR',
        coordinates: [77.2310, 28.6562],
        affectedPopulation: 1800, sourceType: 'community_report',
      },
      {
        ngoId: ngoAdmin1.id, title: 'Flash Flood — Noida Sector 62',
        description: 'Severe waterlogging has displaced 400 families in low-lying sectors after heavy rain. Rescue boats and dry rations needed.',
        category: 'disaster_relief', urgencyLevel: 'critical', priorityScore: 95, status: 'reported',
        location: 'Sector 62, Noida', region: 'Delhi NCR',
        coordinates: [77.3910, 28.5355],
        affectedPopulation: 2000, sourceType: 'field_report',
      },
      {
        ngoId: ngoAdmin1.id, title: 'Food Scarcity — Gurgaon Labour Camp',
        description: '600 migrant construction workers in Sector 57 camp have had no food rations for 5 days after contractor defaulted.',
        category: 'food_nutrition', urgencyLevel: 'high', priorityScore: 86, status: 'reported',
        location: 'Sector 57, Gurgaon', region: 'Delhi NCR',
        coordinates: [77.0266, 28.4595],
        affectedPopulation: 600, sourceType: 'community_report',
      },
      {
        ngoId: ngoAdmin1.id, title: 'School Dropout Crisis — Faridabad',
        description: 'High school dropout rate (45%) among girls in Bata Chowk area due to child labour in industrial zone and lack of sanitation.',
        category: 'education', urgencyLevel: 'medium', priorityScore: 65, status: 'reported',
        location: 'Bata Chowk, Faridabad', region: 'Delhi NCR',
        coordinates: [77.3178, 28.4089],
        affectedPopulation: 800, sourceType: 'survey',
      },

      // ── Mumbai ──
      {
        ngoId: ngoAdmin1.id, title: 'Water Contamination — Dharavi Cluster',
        description: 'Lead and E. coli contamination detected in tap water serving 1200 households in Dharavi Block B. Children at acute risk.',
        category: 'water_sanitation', urgencyLevel: 'critical', priorityScore: 96, status: 'in_progress',
        location: 'Dharavi Block B, Mumbai', region: 'Mumbai',
        coordinates: [72.8540, 19.0444],
        affectedPopulation: 5000, sourceType: 'field_report',
      },
      {
        ngoId: ngoAdmin1.id, title: 'Child Malnutrition — Andheri East Resettlement',
        description: 'SAM (Severe Acute Malnutrition) detected in 38% of children under 5 in resettlement colony post-slum demolition.',
        category: 'food_nutrition', urgencyLevel: 'high', priorityScore: 88, status: 'reported',
        location: 'Andheri East, Mumbai', region: 'Mumbai',
        coordinates: [72.8697, 19.1136],
        affectedPopulation: 620, sourceType: 'survey',
      },
      {
        ngoId: ngoAdmin2.id, title: 'Cyclone Shelter Damage — Bandra Coastline',
        description: 'Pre-monsoon cyclone damaged 80 shanties along the Bandra coastline. Families are living without roofs ahead of monsoon season.',
        category: 'shelter', urgencyLevel: 'high', priorityScore: 82, status: 'reported',
        location: 'Bandra Reclamation, Mumbai', region: 'Mumbai',
        coordinates: [72.8295, 19.0596],
        affectedPopulation: 400, sourceType: 'community_report',
      },

      // ── Bangalore ──
      {
        ngoId: ngoAdmin2.id, title: 'Urban Heat — Whitefield Construction Workers',
        description: 'Heat index exceeding 47°C is causing heatstroke among 900+ construction workers with no shade or potable water at 3 major sites.',
        category: 'healthcare', urgencyLevel: 'high', priorityScore: 79, status: 'reported',
        location: 'Whitefield, Bangalore', region: 'Bangalore',
        coordinates: [77.7499, 12.9698],
        affectedPopulation: 950, sourceType: 'field_report',
      },
      {
        ngoId: ngoAdmin2.id, title: 'Digital Divide — Koramangala Slum Schools',
        description: '4 community schools in the Koramangala slum pocket have zero digital infrastructure. 1200 students unable to access online syllabi.',
        category: 'education', urgencyLevel: 'medium', priorityScore: 58, status: 'reported',
        location: 'Koramangala, Bangalore', region: 'Bangalore',
        coordinates: [77.6271, 12.9279],
        affectedPopulation: 1200, sourceType: 'survey',
      },

      // ── Chennai ──
      {
        ngoId: ngoAdmin2.id, title: 'Cyclone Refugees — Nagapattinam Fisher Village',
        description: 'Cyclone Mihir made landfall, displacing 3,000 fishing families. Temporary shelters are collapsing. Medical care and food packets critically needed.',
        category: 'disaster_relief', urgencyLevel: 'critical', priorityScore: 98, status: 'reported',
        location: 'Nagapattinam Coast, Tamil Nadu', region: 'Chennai',
        coordinates: [79.8447, 10.7672],
        affectedPopulation: 12000, sourceType: 'field_report',
      },
      {
        ngoId: ngoAdmin2.id, title: 'Elderly Care Crisis — Mylapore',
        description: '60+ elderly residents in Mylapore slum live alone with no family support. Weekly health checks, meals, and medication delivery needed.',
        category: 'healthcare', urgencyLevel: 'high', priorityScore: 76, status: 'in_progress',
        location: 'Mylapore, Chennai', region: 'Chennai',
        coordinates: [80.2707, 13.0382],
        affectedPopulation: 65, sourceType: 'community_report',
      },

      // ── Kolkata ──
      {
        ngoId: ngoAdmin2.id, title: 'Flood Damage — Howrah Riverside Colony',
        description: 'Monsoon backflow from the Hooghly river has inundated 500 homes in Howrah\'s low-lying belt. Sanitation collapsed; cholera risk is high.',
        category: 'disaster_relief', urgencyLevel: 'critical', priorityScore: 93, status: 'reported',
        location: 'Howrah Riverside, Kolkata', region: 'Kolkata',
        coordinates: [88.2636, 22.5958],
        affectedPopulation: 3000, sourceType: 'field_report',
      },
      {
        ngoId: ngoAdmin1.id, title: 'TB Outbreak — Salt Lake Sector 5',
        description: 'Cluster of 45 TB cases identified in a dense housing block. Contact tracing and medical supplies needed immediately.',
        category: 'healthcare', urgencyLevel: 'high', priorityScore: 84, status: 'reported',
        location: 'Salt Lake Sector 5, Kolkata', region: 'Kolkata',
        coordinates: [88.4136, 22.5829],
        affectedPopulation: 280, sourceType: 'field_report',
      },

      // ── Hyderabad ──
      {
        ngoId: ngoAdmin1.id, title: 'Water Supply Failure — Secunderabad Garrison',
        description: 'Municipal water supply disrupted for 3 weeks in Secunderabad low-income colony. 900 households relying on contaminated bore wells.',
        category: 'water_sanitation', urgencyLevel: 'high', priorityScore: 81, status: 'in_progress',
        location: 'Secunderabad, Hyderabad', region: 'Hyderabad',
        coordinates: [78.4983, 17.4399],
        affectedPopulation: 3600, sourceType: 'community_report',
      },
      {
        ngoId: ngoAdmin2.id, title: 'Girls\' Education Dropout — Hitech City Periphery',
        description: '200+ girls dropped out of schools near Hitech City labour colonies. Early marriage and domestic work cited as main reasons.',
        category: 'education', urgencyLevel: 'medium', priorityScore: 62, status: 'reported',
        location: 'Hitech City Periphery, Hyderabad', region: 'Hyderabad',
        coordinates: [78.3772, 17.4435],
        affectedPopulation: 210, sourceType: 'survey',
      },
    ],
  });

  // ─────────────────────────────────────────
  // TASKS (For AI Match)
  // ─────────────────────────────────────────
  console.log('📋 Creating tasks for AI match...');
  const allNeeds = await prisma.communityNeed.findMany({ take: 5 });
  
  if (allNeeds.length >= 4) {
    await prisma.task.createMany({
      data: [
        {
          needId: allNeeds[0].id,
          title: 'Fogging & Medication Distribution',
          description: 'Help distribute ORS packets and mosquito repellents in the affected slum areas. Medical volunteers needed for basic checkups.',
          requiredSkills: ['Medical', 'Healthcare', 'Community Outreach'],
          location: allNeeds[0].location,
          coordinates: allNeeds[0].coordinates,
          deadline: new Date(Date.now() + 5 * 86400000), // 5 days
          volunteersNeeded: 10,
          volunteersAssigned: 2,
          status: 'open',
          createdById: allNeeds[0].ngoId,
        },
        {
          needId: allNeeds[1].id,
          title: 'Rescue Boat Operations & Dry Ration',
          description: 'Assist in distributing dry rations using rescue boats to displaced families in waterlogged areas.',
          requiredSkills: ['Logistics', 'Driving', 'Social Work'],
          location: allNeeds[1].location,
          coordinates: allNeeds[1].coordinates,
          deadline: new Date(Date.now() + 2 * 86400000), // 2 days
          volunteersNeeded: 15,
          volunteersAssigned: 5,
          status: 'open',
          createdById: allNeeds[1].ngoId,
        },
        {
          needId: allNeeds[2].id,
          title: 'Food Distribution Camp',
          description: 'Distribute cooked meals and dry rations to migrant construction workers in the affected labor camps.',
          requiredSkills: ['Cooking', 'Logistics', 'Social Work'],
          location: allNeeds[2].location,
          coordinates: allNeeds[2].coordinates,
          deadline: new Date(Date.now() + 3 * 86400000), // 3 days
          volunteersNeeded: 20,
          volunteersAssigned: 8,
          status: 'open',
          createdById: allNeeds[2].ngoId,
        },
        {
          needId: allNeeds[3].id,
          title: 'Setup Temporary Classrooms',
          description: 'Help set up temporary learning centers and provide basic education support for out-of-school girls.',
          requiredSkills: ['Teaching', 'Education', 'Social Work', 'Mentoring'],
          location: allNeeds[3].location,
          coordinates: allNeeds[3].coordinates,
          deadline: new Date(Date.now() + 10 * 86400000), // 10 days
          volunteersNeeded: 8,
          volunteersAssigned: 1,
          status: 'open',
          createdById: allNeeds[3].ngoId,
        },
      ]
    });
  }
  // ─────────────────────────────────────────
  // TASK APPLICATIONS
  // ─────────────────────────────────────────
  console.log('📝 Creating task applications...');
  const allTasks = await prisma.task.findMany();
  if (allTasks.length >= 2) {
    await prisma.taskApplication.createMany({
      data: [
        { taskId: allTasks[0].id, volunteerId: volunteer1.id, volunteerName: volunteer1.name, matchScore: 88, matchReasons: ['Matched on Healthcare skill'], status: 'pending' },
        { taskId: allTasks[0].id, volunteerId: volunteer2.id, volunteerName: volunteer2.name, matchScore: 95, matchReasons: ['Matched on Medical skill', 'Location Match'], status: 'accepted' },
        { taskId: allTasks[1].id, volunteerId: volunteer4.id, volunteerName: volunteer4.name, matchScore: 92, matchReasons: ['Matched on Driving skill'], status: 'accepted' },
        { taskId: allTasks[2].id, volunteerId: volunteer2.id, volunteerName: volunteer2.name, matchScore: 85, matchReasons: ['Matched on Cooking skill'], status: 'pending' },
      ],
    });
  }

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
      { donorId: donor3.id, organizationId: org3.id, campaignId: campaign5.id, amount: 120000, type: 'one_time', paymentStatus: 'completed', razorpayOrderId: `order_${crypto.randomBytes(8).toString('hex')}`, razorpayPaymentId: `pay_${crypto.randomBytes(8).toString('hex')}`, message: 'For a greener future.' },
      { donorId: donor4.id, organizationId: org3.id, campaignId: campaign6.id, amount: 500000, type: 'one_time', paymentStatus: 'completed', razorpayOrderId: `order_${crypto.randomBytes(8).toString('hex')}`, razorpayPaymentId: `pay_${crypto.randomBytes(8).toString('hex')}`, message: 'Empowering rural healthcare.' },
      { donorId: donor2.id, organizationId: org3.id, campaignId: campaign5.id, amount: 25000, type: 'recurring', paymentStatus: 'completed', razorpayOrderId: `order_${crypto.randomBytes(8).toString('hex')}`, razorpayPaymentId: `pay_${crypto.randomBytes(8).toString('hex')}`, message: 'Monthly recurring for saplings.' },
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
  // SURVEYS
  // ─────────────────────────────────────────
  console.log('📋 Creating community surveys...');

  // Survey 1: Healthcare Access
  const survey1 = await prisma.survey.create({
    data: {
      createdById: ngoAdmin2.id,
      title: 'Healthcare Access in Your Community',
      description: 'Help us understand the healthcare challenges faced by your community. Your responses will directly shape our next medical camp locations.',
      coverEmoji: '🏥',
      category: 'healthcare',
      status: 'published',
      targetAudience: 'all',
      isAnonymous: false,
      questions: {
        create: [
          { order: 1, questionText: 'How far is the nearest government hospital from your home?', questionType: 'single_choice', options: ['Less than 1 km', '1–5 km', '5–15 km', 'More than 15 km'], isRequired: true },
          { order: 2, questionText: 'How would you rate the quality of healthcare in your area?', questionType: 'rating', options: [], isRequired: true },
          { order: 3, questionText: 'Which health services are most urgently needed in your community?', questionType: 'multiple_choice', options: ['Maternal & Child Health', 'Dental Care', 'Eye Care', 'Mental Health', 'General OPD', 'Emergency Services'], isRequired: true },
          { order: 4, questionText: 'Have you or your family skipped medical treatment due to cost?', questionType: 'yes_no', options: [], isRequired: true },
          { order: 5, questionText: 'Any specific health challenges you would like to highlight?', questionType: 'text', options: [], isRequired: false, helperText: 'Optional — describe any recurring illness or unmet need' },
        ],
      },
    },
  });

  // Survey 2: Education Quality
  const survey2 = await prisma.survey.create({
    data: {
      createdById: ngoAdmin1.id,
      title: 'Education Quality & Access Survey',
      description: 'Understanding barriers to quality education for children in underserved areas. Takes about 3 minutes.',
      coverEmoji: '📚',
      category: 'education',
      status: 'published',
      targetAudience: 'all',
      isAnonymous: false,
      questions: {
        create: [
          { order: 1, questionText: 'Are there enough schools within walkable distance in your area?', questionType: 'yes_no', options: [], isRequired: true },
          { order: 2, questionText: 'What is the biggest barrier to education for children in your community?', questionType: 'single_choice', options: ['Cost of fees', 'Distance to school', 'Lack of teachers', 'Child labour', 'Safety concerns', 'Language barrier'], isRequired: true },
          { order: 3, questionText: 'Rate the quality of teaching at local government schools (1 = Very Poor, 5 = Excellent)', questionType: 'rating', options: [], isRequired: true },
          { order: 4, questionText: 'Do children in your area have access to digital devices for learning?', questionType: 'single_choice', options: ['Yes, most do', 'Some do', 'Very few', 'None at all'], isRequired: true },
          { order: 5, questionText: 'Which age group is most at risk of dropping out?', questionType: 'multiple_choice', options: ['Under 10', '10–14 years', '14–18 years (Girls)', '14–18 years (Boys)'], isRequired: true },
          { order: 6, questionText: 'Suggestions to improve education access in your area?', questionType: 'text', options: [], isRequired: false },
        ],
      },
    },
  });

  // Survey 3: Environment & Water
  const survey3 = await prisma.survey.create({
    data: {
      createdById: ngoAdmin3.id,
      title: 'Water & Environment Impact Assessment',
      description: 'Assessing how environmental changes and water availability are affecting local communities across India.',
      coverEmoji: '🌿',
      category: 'environment',
      status: 'published',
      targetAudience: 'all',
      isAnonymous: false,
      questions: {
        create: [
          { order: 1, questionText: 'How is the quality of drinking water in your area?', questionType: 'single_choice', options: ['Excellent — clean piped water', 'Acceptable — some issues', 'Poor — often contaminated', 'Crisis — no safe water'], isRequired: true },
          { order: 2, questionText: 'Rate the overall environmental health of your locality (1 = Very Bad, 10 = Excellent)', questionType: 'scale', options: [], isRequired: true },
          { order: 3, questionText: 'Which environmental issues affect your community? (select all)', questionType: 'multiple_choice', options: ['Air pollution', 'Water pollution', 'Garbage disposal', 'Deforestation', 'Flooding / waterlogging', 'Drought', 'Soil degradation'], isRequired: true },
          { order: 4, questionText: 'Has your community experienced any natural disaster in the last 2 years?', questionType: 'yes_no', options: [], isRequired: true },
          { order: 5, questionText: 'What single environmental change would most improve your community?', questionType: 'text', options: [], isRequired: false },
        ],
      },
    },
  });

  // Survey 4: Volunteer Satisfaction (draft)
  const survey4 = await prisma.survey.create({
    data: {
      createdById: ngoAdmin1.id,
      title: 'Volunteer Experience & Satisfaction Survey',
      description: 'We value your experience as a JanSetu volunteer. Help us improve how we support and engage our volunteer community.',
      coverEmoji: '🤝',
      category: 'general',
      status: 'published',
      targetAudience: 'volunteer',
      isAnonymous: true,
      questions: {
        create: [
          { order: 1, questionText: 'How long have you been volunteering with JanSetu?', questionType: 'single_choice', options: ['Less than 1 month', '1–3 months', '3–6 months', '6–12 months', 'More than 1 year'], isRequired: true },
          { order: 2, questionText: 'How satisfied are you with the task matching system?', questionType: 'rating', options: [], isRequired: true },
          { order: 3, questionText: 'What motivates you to volunteer? (select all that apply)', questionType: 'multiple_choice', options: ['Social impact', 'Skill development', 'Community connection', 'Career building', 'Personal fulfilment', 'Team/friends'], isRequired: true },
          { order: 4, questionText: 'Have you received adequate training and support for tasks?', questionType: 'yes_no', options: [], isRequired: true },
          { order: 5, questionText: 'On a scale of 1–10, how likely are you to recommend JanSetu to a friend?', questionType: 'scale', options: [], isRequired: true },
          { order: 6, questionText: 'What one thing would make your volunteering experience better?', questionType: 'text', options: [], isRequired: false, helperText: 'Be as specific as you like — all feedback is read by the team' },
        ],
      },
    },
  });

  // Fetch created questions to map IDs
  const s1Qs = await prisma.surveyQuestion.findMany({ where: { surveyId: survey1.id }, orderBy: { order: 'asc' } });
  const s2Qs = await prisma.surveyQuestion.findMany({ where: { surveyId: survey2.id }, orderBy: { order: 'asc' } });
  const s3Qs = await prisma.surveyQuestion.findMany({ where: { surveyId: survey3.id }, orderBy: { order: 'asc' } });
  const s4Qs = await prisma.surveyQuestion.findMany({ where: { surveyId: survey4.id }, orderBy: { order: 'asc' } });

  // Responses for Survey 1 (Healthcare)
  const s1Respondents = [volunteer1, volunteer2, volunteer3, volunteer4, volunteer5, volunteer6, donor1, donor2];
  const s1AnswerSets = [
    { [s1Qs[0].id]: '1–5 km',      [s1Qs[1].id]: 3, [s1Qs[2].id]: ['Maternal & Child Health', 'Emergency Services'], [s1Qs[3].id]: 'Yes', [s1Qs[4].id]: 'Need more ambulances.' },
    { [s1Qs[0].id]: 'Less than 1 km', [s1Qs[1].id]: 4, [s1Qs[2].id]: ['Mental Health', 'Dental Care'],              [s1Qs[3].id]: 'No',  [s1Qs[4].id]: '' },
    { [s1Qs[0].id]: '5–15 km',     [s1Qs[1].id]: 2, [s1Qs[2].id]: ['General OPD', 'Eye Care'],                      [s1Qs[3].id]: 'Yes', [s1Qs[4].id]: 'No specialist doctors nearby.' },
    { [s1Qs[0].id]: 'More than 15 km', [s1Qs[1].id]: 1, [s1Qs[2].id]: ['Emergency Services', 'Maternal & Child Health'], [s1Qs[3].id]: 'Yes', [s1Qs[4].id]: '' },
    { [s1Qs[0].id]: '1–5 km',      [s1Qs[1].id]: 4, [s1Qs[2].id]: ['Dental Care'],                                  [s1Qs[3].id]: 'No',  [s1Qs[4].id]: 'Services are decent but crowded.' },
    { [s1Qs[0].id]: '5–15 km',     [s1Qs[1].id]: 2, [s1Qs[2].id]: ['General OPD', 'Maternal & Child Health'],       [s1Qs[3].id]: 'Yes', [s1Qs[4].id]: '' },
    { [s1Qs[0].id]: '1–5 km',      [s1Qs[1].id]: 5, [s1Qs[2].id]: ['Mental Health'],                                [s1Qs[3].id]: 'No',  [s1Qs[4].id]: '' },
    { [s1Qs[0].id]: 'Less than 1 km', [s1Qs[1].id]: 3, [s1Qs[2].id]: ['Eye Care', 'Dental Care'],                   [s1Qs[3].id]: 'No',  [s1Qs[4].id]: '' },
  ];
  for (let i = 0; i < s1Respondents.length; i++) {
    await prisma.surveyResponse.create({ data: { surveyId: survey1.id, respondentId: s1Respondents[i].id, answers: s1AnswerSets[i] as any } });
  }

  // Responses for Survey 2 (Education)
  const s2Respondents = [volunteer1, volunteer3, volunteer4, volunteer5, donor3, donor4];
  const s2AnswerSets = [
    { [s2Qs[0].id]: 'No',  [s2Qs[1].id]: 'Distance to school',  [s2Qs[2].id]: 3, [s2Qs[3].id]: 'Very few',    [s2Qs[4].id]: ['14–18 years (Girls)'],              [s2Qs[5].id]: 'More free bus routes needed.' },
    { [s2Qs[0].id]: 'Yes', [s2Qs[1].id]: 'Lack of teachers',    [s2Qs[2].id]: 2, [s2Qs[3].id]: 'None at all', [s2Qs[4].id]: ['10–14 years', '14–18 years (Girls)'], [s2Qs[5].id]: '' },
    { [s2Qs[0].id]: 'No',  [s2Qs[1].id]: 'Child labour',        [s2Qs[2].id]: 1, [s2Qs[3].id]: 'None at all', [s2Qs[4].id]: ['Under 10', '10–14 years'],          [s2Qs[5].id]: 'Midday meal scheme needs expansion.' },
    { [s2Qs[0].id]: 'Yes', [s2Qs[1].id]: 'Cost of fees',        [s2Qs[2].id]: 4, [s2Qs[3].id]: 'Some do',     [s2Qs[4].id]: ['14–18 years (Girls)'],              [s2Qs[5].id]: '' },
    { [s2Qs[0].id]: 'Yes', [s2Qs[1].id]: 'Safety concerns',     [s2Qs[2].id]: 3, [s2Qs[3].id]: 'Some do',     [s2Qs[4].id]: ['14–18 years (Boys)'],              [s2Qs[5].id]: 'Add streetlights on school routes.' },
    { [s2Qs[0].id]: 'No',  [s2Qs[1].id]: 'Language barrier',    [s2Qs[2].id]: 2, [s2Qs[3].id]: 'Very few',    [s2Qs[4].id]: ['Under 10'],                        [s2Qs[5].id]: '' },
  ];
  for (let i = 0; i < s2Respondents.length; i++) {
    await prisma.surveyResponse.create({ data: { surveyId: survey2.id, respondentId: s2Respondents[i].id, answers: s2AnswerSets[i] as any } });
  }

  // Responses for Survey 3 (Environment)
  const s3Respondents = [volunteer2, volunteer4, volunteer6, donor1, donor2];
  const s3AnswerSets = [
    { [s3Qs[0].id]: 'Poor — often contaminated',  [s3Qs[1].id]: 3,  [s3Qs[2].id]: ['Water pollution', 'Garbage disposal', 'Flooding / waterlogging'], [s3Qs[3].id]: 'Yes', [s3Qs[4].id]: 'More water treatment plants.' },
    { [s3Qs[0].id]: 'Crisis — no safe water',     [s3Qs[1].id]: 2,  [s3Qs[2].id]: ['Drought', 'Air pollution', 'Deforestation'],                      [s3Qs[3].id]: 'Yes', [s3Qs[4].id]: '' },
    { [s3Qs[0].id]: 'Acceptable — some issues',   [s3Qs[1].id]: 5,  [s3Qs[2].id]: ['Air pollution', 'Garbage disposal'],                              [s3Qs[3].id]: 'No',  [s3Qs[4].id]: 'Better waste segregation.' },
    { [s3Qs[0].id]: 'Excellent — clean piped water', [s3Qs[1].id]: 8, [s3Qs[2].id]: ['Garbage disposal'],                                             [s3Qs[3].id]: 'No',  [s3Qs[4].id]: '' },
    { [s3Qs[0].id]: 'Poor — often contaminated',  [s3Qs[1].id]: 4,  [s3Qs[2].id]: ['Water pollution', 'Soil degradation'],                            [s3Qs[3].id]: 'Yes', [s3Qs[4].id]: 'Ban industrial discharge into rivers.' },
  ];
  for (let i = 0; i < s3Respondents.length; i++) {
    await prisma.surveyResponse.create({ data: { surveyId: survey3.id, respondentId: s3Respondents[i].id, answers: s3AnswerSets[i] as any } });
  }

  // Responses for Survey 4 (Volunteer Satisfaction)
  const s4Respondents = [volunteer1, volunteer2, volunteer3, volunteer4, volunteer5];
  const s4AnswerSets = [
    { [s4Qs[0].id]: '1–3 months',       [s4Qs[1].id]: 4, [s4Qs[2].id]: ['Social impact', 'Community connection'],       [s4Qs[3].id]: 'Yes', [s4Qs[4].id]: 8,  [s4Qs[5].id]: 'More detailed task briefings please.' },
    { [s4Qs[0].id]: 'More than 1 year', [s4Qs[1].id]: 5, [s4Qs[2].id]: ['Social impact', 'Personal fulfilment', 'Team/friends'], [s4Qs[3].id]: 'Yes', [s4Qs[4].id]: 10, [s4Qs[5].id]: 'Keep it up!' },
    { [s4Qs[0].id]: '3–6 months',       [s4Qs[1].id]: 3, [s4Qs[2].id]: ['Skill development', 'Career building'],        [s4Qs[3].id]: 'No',  [s4Qs[4].id]: 6,  [s4Qs[5].id]: 'More orientation before first task.' },
    { [s4Qs[0].id]: '6–12 months',      [s4Qs[1].id]: 4, [s4Qs[2].id]: ['Community connection', 'Social impact'],       [s4Qs[3].id]: 'Yes', [s4Qs[4].id]: 9,  [s4Qs[5].id]: '' },
    { [s4Qs[0].id]: 'Less than 1 month',[s4Qs[1].id]: 5, [s4Qs[2].id]: ['Personal fulfilment'],                         [s4Qs[3].id]: 'Yes', [s4Qs[4].id]: 9,  [s4Qs[5].id]: 'Amazing platform, very intuitive.' },
  ];
  for (let i = 0; i < s4Respondents.length; i++) {
    await prisma.surveyResponse.create({ data: { surveyId: survey4.id, respondentId: s4Respondents[i].id, answers: s4AnswerSets[i] as any } });
  }

  console.log('✅ 4 surveys created with responses');

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
  console.log(`\n📊 Seeded: 14 users, 3 orgs, 6 campaigns, 15 needs, 8 donations, 1 emergency, 2 fraud cases, 4 surveys with responses\n`);

  await prisma.$disconnect();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error('❌ Seed failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
