import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { prisma } from '../lib/prisma';
import { sendEmail, sendSMS } from '../utils/notification';

export const authRouter = Router();

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'super-secret-nextauth-shared-key-for-jwt-verification-12345';

// OTP memory store: email/phone -> { code, expires, pendingUser }
export const otpStore = new Map<string, { code: string; expires: number; userData: any }>();

// Register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, studentId, batch, department, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, phone ? { phone } : {}],
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or phone already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    const userData = {
      name,
      email,
      phone,
      studentId,
      batch,
      department,
      passwordHash,
    };

    otpStore.set(email, { code: otpCode, expires, userData });

    // Send OTP
    await sendEmail(
      email,
      'CSC DIU - Verify Your Account',
      `<h1>Welcome to Cyber Security Center DIU</h1><p>Your OTP for account registration is: <strong>${otpCode}</strong>. It will expire in 10 minutes.</p>`
    );

    if (phone) {
      await sendSMS(phone, `CSC DIU: Your verification OTP is ${otpCode}. Valid for 10m.`);
    }

    // For local convenience, print it to API logs as well
    console.log(`[AUTH] Registered. OTP for ${email} is ${otpCode}`);

    return res.status(200).json({
      message: 'OTP sent to email/phone. Please verify your OTP to complete registration.',
      email,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Verify OTP
authRouter.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const record = otpStore.get(email);
    if (!record) {
      return res.status(400).json({ error: 'No verification request found for this email' });
    }

    if (Date.now() > record.expires) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired. Please register again.' });
    }

    if (record.code !== otp) {
      return res.status(400).json({ error: 'Invalid OTP code' });
    }

    const { userData } = record;

    // Create user and profile in transaction
    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email: userData.email,
          phone: userData.phone,
          passwordHash: userData.passwordHash,
          isActive: true,
          emailVerified: new Date(),
        },
      });

      await tx.profile.create({
        data: {
          userId: u.id,
          fullName: userData.name,
          studentId: userData.studentId,
          batch: userData.batch,
          department: userData.department,
          skills: '',
          expertise: '',
        },
      });

      return u;
    });

    otpStore.delete(email);

    // Create custom JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Account verified successfully!',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body; // email or phone number

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/Phone and password are required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });

    if (!user || !user.passwordHash) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'Your account has been banned.' });
    }

    if (!user.isActive) {
      return res.status(400).json({ error: 'Your account has not been activated. Please verify OTP.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check if 2FA enabled
    if (user.twoFactorEnabled) {
      return res.status(200).json({
        message: '2FA required',
        twoFactorRequired: true,
        userId: user.id,
      });
    }

    // Track Login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: req.ip || 'unknown',
      },
    });

    // Create Tokens
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Verify 2FA on login
authRouter.post('/2fa/verify-login', async (req: Request, res: Response) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) {
      return res.status(400).json({ error: 'User ID and 2FA code are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const verified = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid 2FA code' });
    }

    // Log user in
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Refresh Token
authRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.isBanned) {
      return res.status(401).json({ error: 'User not found or banned' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout
authRouter.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  return res.status(200).json({ message: 'Logged out successfully' });
});

// Enable 2FA Setup
authRouter.post('/2fa/enable', async (req: any, res: Response) => {
  // Normally this requires auth, but for easy integration we support parsing req.user
  try {
    const userId = req.body.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(user.email, 'CSC DIU Cyber Security Center', secret);
    const qrCodeDataUrl = await qrcode.toDataURL(otpAuthUrl);

    // Save temporary secret to verify
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    return res.status(200).json({
      secret,
      qrCode: qrCodeDataUrl,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Verify and Activate 2FA
authRouter.post('/2fa/verify', async (req: any, res: Response) => {
  try {
    const userId = req.body.userId || req.user?.id;
    const { code } = req.body;
    if (!userId || !code) {
      return res.status(400).json({ error: 'User ID and 2FA code are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ error: '2FA Setup not initiated' });
    }

    const verified = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid code. Verification failed.' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return res.status(200).json({ message: '2FA Enabled successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Forgot password
authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000;

    otpStore.set(email + '_reset', { code: otpCode, expires, userData: { email } });

    await sendEmail(
      email,
      'CSC DIU - Reset Password Request',
      `<h1>Password Reset Request</h1><p>Use the following OTP to reset your password: <strong>${otpCode}</strong>. Valid for 10 minutes.</p>`
    );

    console.log(`[AUTH] Reset Password. OTP for ${email} is ${otpCode}`);

    return res.status(200).json({ message: 'Reset OTP sent to your email.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Reset password
authRouter.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const record = otpStore.get(email + '_reset');
    if (!record || record.code !== otp || Date.now() > record.expires) {
      return res.status(400).json({ error: 'Invalid or expired reset OTP code.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    otpStore.delete(email + '_reset');

    return res.status(200).json({ message: 'Password reset successfully. You can now login.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
