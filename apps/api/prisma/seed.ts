import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.activityLog.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.eventRegistration.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.membershipCard.deleteMany({});
  await prisma.achievement.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.notice.deleteMany({});
  await prisma.resource.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding testing data...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Users
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@csc.diu',
      role: 'SUPER_ADMIN',
      isActive: true,
      passwordHash,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@csc.diu',
      role: 'ADMIN',
      isActive: true,
      passwordHash,
    },
  });

  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@csc.diu',
      role: 'TEACHER',
      isActive: true,
      passwordHash,
    },
  });

  const student = await prisma.user.create({
    data: {
      email: 'student@csc.diu',
      role: 'STUDENT',
      isActive: true,
      passwordHash,
    },
  });

  const shafim = await prisma.user.create({
    data: {
      email: 'shafim@diu.edu.bd',
      phone: '+8801711111111',
      role: 'STUDENT',
      isActive: true,
      passwordHash,
    },
  });

  const sajid = await prisma.user.create({
    data: {
      email: 'sajid@diu.edu.bd',
      role: 'STUDENT',
      isActive: true,
      passwordHash,
    },
  });

  const tasnim = await prisma.user.create({
    data: {
      email: 'tasnim@diu.edu.bd',
      role: 'STUDENT',
      isActive: true,
      passwordHash,
    },
  });

  const rifat = await prisma.user.create({
    data: {
      email: 'rifat@diu.edu.bd',
      role: 'STUDENT',
      isActive: true,
      passwordHash,
    },
  });

  const anika = await prisma.user.create({
    data: {
      email: 'anika@diu.edu.bd',
      role: 'STUDENT',
      isActive: true,
      passwordHash,
    },
  });

  // 2. Profiles
  await prisma.profile.create({
    data: {
      userId: superAdmin.id,
      fullName: 'Super Root Administrator',
      bio: 'Primary platform system auditor and security administrator.',
      skills: 'IAM, Audit Trail, Cloud Security',
      totalScore: 1000,
    },
  });

  await prisma.profile.create({
    data: {
      userId: admin.id,
      fullName: 'DIU CSC Admin',
      bio: 'Administrative lead for Daffodil International University Cyber Security Center.',
      skills: 'Operations, Event Management, Public Relations',
      totalScore: 800,
    },
  });

  await prisma.profile.create({
    data: {
      userId: teacher.id,
      fullName: 'Dr. Imran Mahmud',
      designation: 'Advisor & Professor',
      expertise: 'Information Security, AI-driven Threat Detection, Governance',
      bio: 'Advising professor of Daffodil International University Department of Software Engineering.',
      skills: 'Research, Cyber Governance, Threat Modeling',
      totalScore: 500,
    },
  });

  await prisma.profile.create({
    data: {
      userId: student.id,
      fullName: 'Demo Student Analyst',
      studentId: '221-15-000',
      batch: '58',
      department: 'CSE',
      bio: 'Cyber security analyst student trainee at DIU.',
      skills: 'Linux, Networking, Wireshark',
      totalScore: 120,
      ctfScore: 50,
      thmPoints: 50,
      htbPoints: 20,
    },
  });

  await prisma.profile.create({
    data: {
      userId: shafim.id,
      fullName: 'Shafiur Rahman Shafim',
      studentId: '221-15-472',
      batch: '58',
      department: 'CSE',
      bio: 'Active Bug Bounty Hunter, CTF Player and Software Engineer. Focused on Web Exploits.',
      skills: 'Web Exploitation, Reverse Engineering, Python Scripting',
      github: 'https://github.com/shafim',
      linkedin: 'https://linkedin.com/in/shafim',
      tryHackMe: 'https://tryhackme.com/p/shafim',
      hackTheBox: 'https://hackthebox.com/u/shafim',
      ctfScore: 400,
      thmPoints: 120,
      htbPoints: 80,
      totalScore: 600,
      isAlumni: false,
    },
  });

  await prisma.profile.create({
    data: {
      userId: sajid.id,
      fullName: 'Sajid Al Hasan',
      studentId: '221-15-111',
      batch: '58',
      department: 'Software Engineering',
      bio: 'Cyber security researcher focusing on Cryptography and Network Audits.',
      skills: 'Cryptography, Wireless Auditing, Forensics',
      totalScore: 550,
      ctfScore: 350,
      thmPoints: 150,
      htbPoints: 50,
    },
  });

  await prisma.profile.create({
    data: {
      userId: tasnim.id,
      fullName: 'Tasnim Hasan',
      studentId: '221-15-222',
      batch: '57',
      department: 'CSE',
      bio: 'DIU cyber alumnus. Working as an Associate Penetration Tester.',
      skills: 'Active Directory, Pentesting, Social Engineering',
      totalScore: 950,
      ctfScore: 500,
      thmPoints: 250,
      htbPoints: 200,
      isAlumni: true,
      graduationBatch: '57',
      currentCompany: 'TechSecurity Ltd',
      currentPosition: 'Security Consultant',
    },
  });

  await prisma.profile.create({
    data: {
      userId: rifat.id,
      fullName: 'Rifat Chowdhury',
      studentId: '221-15-333',
      batch: '59',
      department: 'Computer Science',
      bio: 'Student pentester and OSINT practitioner.',
      skills: 'OSINT, Social Engineering, Phishing Lab Auditing',
      totalScore: 480,
      ctfScore: 300,
      thmPoints: 100,
      htbPoints: 80,
    },
  });

  await prisma.profile.create({
    data: {
      userId: anika.id,
      fullName: 'Anika Rahman',
      studentId: '221-15-444',
      batch: '60',
      department: 'Software Engineering',
      bio: 'Enthusiastic beginner in cyber defense labs.',
      skills: 'Network Defense, Wireshark, Bash Scripting',
      totalScore: 230,
      ctfScore: 100,
      thmPoints: 100,
      htbPoints: 30,
    },
  });

  // 3. Achievements
  await prisma.achievement.create({
    data: {
      userId: shafim.id,
      title: 'Certified Ethical Hacker v12',
      type: 'certification',
      platform: 'EC-Council',
      issuer: 'EC-Council',
      description: 'Acquired professional certification in ethical hacking methodologies.',
      points: 50,
      status: 'APPROVED',
      badgeTier: 'GOLD',
      isFeatured: true,
    },
  });

  await prisma.achievement.create({
    data: {
      userId: shafim.id,
      title: 'PortSwigger Web Security Academy Graduate',
      type: 'certification',
      platform: 'PortSwigger',
      issuer: 'PortSwigger',
      description: 'Completed all Web Security Academy laboratories containing active exploits.',
      points: 30,
      status: 'PENDING',
      badgeTier: 'SILVER',
      isFeatured: false,
    },
  });

  await prisma.achievement.create({
    data: {
      userId: sajid.id,
      title: 'CompTIA Security+',
      type: 'certification',
      platform: 'CompTIA',
      issuer: 'CompTIA',
      description: 'Validated baseline security skills and compliance principles.',
      points: 40,
      status: 'APPROVED',
      badgeTier: 'SILVER',
      isFeatured: true,
    },
  });

  await prisma.achievement.create({
    data: {
      userId: tasnim.id,
      title: 'Offensive Security Certified Professional (OSCP)',
      type: 'certification',
      platform: 'OffSec',
      issuer: 'OffSec',
      description: 'Completed 24-hour hands-on active directory hacking exam.',
      points: 100,
      status: 'APPROVED',
      badgeTier: 'PLATINUM',
      isFeatured: true,
    },
  });

  // 4. Events
  const workshop = await prisma.event.create({
    data: {
      title: 'Active Directory Hacking & Security',
      slug: 'active-directory-hacking-security',
      description: 'Hands-on lab detailing Active Directory structure, vulnerabilities, Kerberoasting, and domain dominance exploits.',
      type: 'WORKSHOP',
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      venue: 'DIU Lab 703, Daffodil Smart City',
      isOnline: false,
      maxParticipants: 50,
      isPublished: true,
      isFeatured: true,
      creatorId: admin.id,
      tags: 'Active Directory, Windows Exploits, Lab',
    },
  });

  const ctf = await prisma.event.create({
    data: {
      title: 'DIU CSC Cyber Shield CTF 2026',
      slug: 'diu-csc-cyber-shield-ctf-2026',
      description: 'Jeopardy-style CTF containing Web Exploitation, Reverse Engineering, Cryptography, and Forensics challenges.',
      type: 'CTF',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      endDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      venue: 'Online Platform',
      isOnline: true,
      meetingLink: 'https://ctf.csc-diu.org',
      maxParticipants: 500,
      isPublished: true,
      isFeatured: true,
      creatorId: admin.id,
      tags: 'CTF, Competition, Jeopardy',
    },
  });

  // 5. Event Registrations
  await prisma.eventRegistration.create({
    data: {
      userId: shafim.id,
      eventId: workshop.id,
      attended: true,
    },
  });

  await prisma.eventRegistration.create({
    data: {
      userId: sajid.id,
      eventId: workshop.id,
      attended: false,
    },
  });

  await prisma.eventRegistration.create({
    data: {
      userId: shafim.id,
      eventId: ctf.id,
      attended: true,
    },
  });

  // 6. Certificates
  await prisma.certificate.create({
    data: {
      userId: shafim.id,
      eventId: ctf.id,
      title: 'Cyber Shield CTF Winner Certificate',
      type: 'achievement',
      verificationCode: 'DIU-CSC-CTF-2026-0001',
    },
  });

  // 7. Notices
  await prisma.notice.create({
    data: {
      title: 'Recruitment Open for DIU CSC Trainee Analyst Team',
      slug: 'recruitment-open-trainee-analyst',
      content: 'We are recruiting new student trainees to join the DIU Cyber Security Center labs. Candidates will undergo a baseline networking and Linux security audit test.',
      category: 'GENERAL',
      isPublished: true,
      isPinned: true,
      isUrgent: true,
      authorId: admin.id,
      publishedAt: new Date(),
    },
  });

  await prisma.notice.create({
    data: {
      title: 'Active Directory Workshop Slots Fully Booked',
      slug: 'active-directory-slots-full',
      content: 'All registration slots for the upcoming Active Directory Lab are fully booked. An online Zoom broadcast link will be shared for spectators.',
      category: 'EVENT',
      isPublished: true,
      isPinned: false,
      isUrgent: false,
      authorId: admin.id,
      publishedAt: new Date(),
    },
  });

  // 8. Resources
  await prisma.resource.create({
    data: {
      title: 'Web Exploitation Starter Guide',
      description: 'An introductory learning path for Daffodil International University students targeting OWASP Top 10 vulnerabilities.',
      type: 'learning_path',
      url: 'https://portswigger.net/web-security',
      isPublished: true,
      isFeatured: true,
      authorId: teacher.id,
      tags: 'Web Security, OWASP, Penetration Testing',
    },
  });

  await prisma.resource.create({
    data: {
      title: 'Wireshark Packet Analysis Masterclass',
      description: 'A comprehensive collection of packet analysis guides to inspect network threat signatures.',
      type: 'video',
      url: 'https://www.wireshark.org/docs/',
      isPublished: true,
      isFeatured: false,
      authorId: teacher.id,
      tags: 'Network Audit, Packet Analysis, Wireshark',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
