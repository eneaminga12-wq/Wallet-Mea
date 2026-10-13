/**
 * Authentication service (simulated).
 *
 * Replace the internals with real API calls (e.g. /auth/login, /auth/register,
 * /auth/verify-otp) when the backend is connected. The public surface is the
 * contract the rest of the app depends on.
 */
import type { User } from '../types';
import { DEMO_USER } from '../data/mock';
import { simulate } from './api';

export interface RegisterPayload {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  country: string;
}

export const authService = {
  /** Any credentials succeed in the demo. */
  async login(_payload: { identifier: string; password: string }): Promise<User> {
    return simulate(DEMO_USER);
  },

  async register(payload: RegisterPayload): Promise<{ user: User; otpSent: boolean }> {
    const user: User = {
      ...DEMO_USER,
      fullName: payload.fullName || DEMO_USER.fullName,
      phone: payload.phone || DEMO_USER.phone,
      email: payload.email || DEMO_USER.email,
    };
    return simulate({ user, otpSent: true });
  },

  /** Demo OTP is always 123456. */
  async verifyOtp(_phone: string, code: string): Promise<{ verified: boolean }> {
    return simulate({ verified: code === '123456' });
  },

  async resendOtp(_phone: string): Promise<{ sent: boolean }> {
    return simulate({ sent: true });
  },

  async requestPasswordReset(_identifier: string): Promise<{ sent: boolean }> {
    return simulate({ sent: true });
  },
};
