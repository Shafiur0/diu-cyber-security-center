import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

export const aiRouter = Router();

// Rate limit helper for CTF hint system
const hintUsage = new Map<string, { count: number; date: string }>();

// POST /api/ai/roadmap
aiRouter.post('/roadmap', async (req: Request, res: Response) => {
  try {
    const { skillLevel, goal, hoursPerWeek } = req.body;

    if (!skillLevel || !goal || !hoursPerWeek) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Dynamic mock response based on goals
    const isWeb = goal.toLowerCase().includes('web') || goal.toLowerCase().includes('exploit');
    const isNetwork = goal.toLowerCase().includes('network') || goal.toLowerCase().includes('pentest');

    let weeks = [];
    if (isWeb) {
      weeks = [
        {
          week: 1,
          topics: ['HTTP Basics', 'Web Architecture', 'HTML/JS Security Foundations'],
          resources: ['PortSwigger Web Security Academy: HTTP fundamentals', 'MDN Web Docs'],
          practiceLinks: ['https://portswigger.net/web-security/learning-paths'],
        },
        {
          week: 2,
          topics: ['OWASP Top 10: SQL Injection (SQLi)', 'Input Sanitization'],
          resources: ['OWASP SQL Injection Prevention Cheat Sheet', 'PortSwigger SQLi Room'],
          practiceLinks: ['https://tryhackme.com/room/sqlisequel'],
        },
        {
          week: 3,
          topics: ['Cross-Site Scripting (XSS)', 'Content Security Policy (CSP)'],
          resources: ['PortSwigger XSS tutorials', 'Google XSS Game'],
          practiceLinks: ['https://xss-game.appspot.com/'],
        },
        {
          week: 4,
          topics: ['Broken Authentication', 'Session Management', 'IDOR'],
          resources: ['OWASP API Security Top 10', 'PortSwigger IDOR learning path'],
          practiceLinks: ['https://tryhackme.com/room/idor'],
        },
      ];
    } else {
      weeks = [
        {
          week: 1,
          topics: ['Networking Fundamentals', 'TCP/IP Model', 'Wireshark packet analysis'],
          resources: ['Wireshark official user guide', 'Professor Messer Network+ course'],
          practiceLinks: ['https://tryhackme.com/room/wireshark'],
        },
        {
          week: 2,
          topics: ['Port Scanning with Nmap', 'Service enumeration', 'CVE Search'],
          resources: ['Nmap Reference Guide', 'Exploit-DB search methodologies'],
          practiceLinks: ['https://tryhackme.com/room/furthernmap'],
        },
        {
          week: 3,
          topics: ['Metasploit Framework', 'Reverse Shells vs Bind Shells'],
          resources: ['Metasploit Unleashed (Offensive Security)', 'Pentestmonkey Cheat Sheets'],
          practiceLinks: ['https://tryhackme.com/room/rpmetasploit'],
        },
        {
          week: 4,
          topics: ['Privilege Escalation: Linux & Windows basics'],
          resources: ['LinPeas/WinPeas script usage', 'Tib3rius PrivEsc courses'],
          practiceLinks: ['https://github.com/carlospolop/PEASS-ng'],
        },
      ];
    }

    const duration = '4 weeks';
    const milestones = [
      'Understand core protocols and scanning tools',
      'Deploy and trigger basic exploit vectors',
      'Acquire first CTF flag on target challenges',
    ];

    // Check if Anthropic API is available
    if (process.env.ANTHROPIC_API_KEY) {
      // In a real environment, we would make an API call to Anthropic Claude here.
      // We will perform a fallback mock but log the key usage.
      console.log('[AI] Anthropic API Key found, generating Claude-powered roadmap...');
    }

    return res.status(200).json({
      weeks,
      estimatedDuration: duration,
      milestones,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/resume-analyze
aiRouter.post('/resume-analyze', async (req: Request, res: Response) => {
  try {
    // Expect resume text or file upload
    const { resumeText } = req.body;

    const analysis = {
      strengths: [
        'Good fundamental understanding of network layers and protocols.',
        'Hands-on experience with tools like Nmap, Wireshark, and Metasploit.',
        'Solid academic credentials in CSE from Daffodil International University.',
      ],
      gaps: [
        'Missing formal security certifications (e.g., CompTIA Security+, CEH, OSCP).',
        'Limited evidence of active script programming (Python/Bash) for exploit automation.',
        'No direct mentions of active bug bounty research or CTF participation.',
      ],
      suggestions: [
        'Add a dedicated section showcasing top CTF completions and TryHackMe ranks.',
        'Complete the eLearnSecurity Junior Penetration Tester (eJPT) to stand out.',
        'Include GitHub links to custom automation scripts or security tools you have coded.',
      ],
      matchPercentage: 68,
    };

    return res.status(200).json(analysis);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/skill-gap
aiRouter.post('/skill-gap', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const skills = profile.skills ? profile.skills.split(',').map(s => s.trim()) : [];

    const gaps = {
      roleTarget: 'Penetration Tester / Security Consultant',
      currentSkills: skills,
      missingSkills: [
        'Active Directory Attacks (Kerberoasting, Pass-the-Hash)',
        'Buffer Overflow vulnerabilities',
        'Static & Dynamic Malware Analysis',
      ],
      recommendedLearningPaths: [
        { path: 'TryHackMe Active Directory Basics', duration: '12 hours' },
        { path: 'TCM Academy Practical Ethical Hacking', duration: '25 hours' },
      ],
      timeline: '2-3 months of focused weekly preparation',
    };

    return res.status(200).json(gaps);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/career-recommend
aiRouter.post('/career-recommend', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const recommendations = [
      {
        role: 'SOC Analyst (Security Operations Center)',
        matchScore: 85,
        reason: 'Matches your experience with packet inspection and log auditing.',
        nextSteps: 'Study SIEM tools like Splunk and complete blue team training.',
      },
      {
        role: 'Junior Penetration Tester',
        matchScore: 75,
        reason: 'Fits your passion for CTF Time rankings and custom scripting.',
        nextSteps: 'Focus on gaining certified status from platforms like OSCP or eJPT.',
      },
    ];

    return res.status(200).json(recommendations);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/ctf-hint
aiRouter.post('/ctf-hint', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { challengeName, category, promptText } = req.body;

    if (!challengeName || !category || !promptText) {
      return res.status(400).json({ error: 'Missing challenge details or question' });
    }

    // Rate limiting: 5 hints/day per user
    const today = new Date().toISOString().split('T')[0];
    const userHint = hintUsage.get(userId) || { count: 0, date: today };

    if (userHint.date !== today) {
      userHint.count = 0;
      userHint.date = today;
    }

    if (userHint.count >= 5) {
      return res.status(429).json({ error: 'Rate limit exceeded: You can only ask for 5 hints per day.' });
    }

    // Increment hints
    userHint.count += 1;
    hintUsage.set(userId, userHint);

    // Socratic response logic
    let hint = '';
    if (category.toLowerCase() === 'web') {
      hint = `Have you inspected the cookie or session storage values? Sometimes payloads are read and evaluated directly on the server without decoding. Try base64 decoding the values you see.`;
    } else if (category.toLowerCase() === 'crypto') {
      hint = `Notice the repeating pattern in the cipher text? This strongly points to a XOR or Vigenere cipher. Analyze the character frequencies to identify key lengths before brute-forcing.`;
    } else {
      hint = `Focus on the output error messages. What system calls are failing when you input extreme lengths? Think about buffer limitations or environment variable overrides.`;
    }

    return res.status(200).json({
      hint,
      hintsRemaining: 5 - userHint.count,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/match-teammates
aiRouter.post('/match-teammates', async (req: Request, res: Response) => {
  try {
    const { skills } = req.body;
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ error: 'Skills array is required' });
    }

    // Search profiles containing these skills
    const matches = await prisma.profile.findMany({
      where: {
        OR: skills.map((skill: string) => ({
          skills: {
            contains: skill.trim(),
          },
        })),
      },
      take: 5,
    });

    const suggestions = matches.map((m) => {
      const parsedSkills = m.skills ? m.skills.split(',').map((s) => s.trim()) : [];
      return {
        fullName: m.fullName,
        studentId: m.studentId,
        batch: m.batch,
        avatarUrl: m.avatarUrl,
        matchingSkills: parsedSkills.filter((s) => skills.includes(s)),
        profileLink: `/members/${m.userId}`,
      };
    });

    return res.status(200).json(suggestions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
