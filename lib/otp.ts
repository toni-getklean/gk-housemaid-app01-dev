export class OTPService {
  generateOTP(length: number = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const otp = Math.floor(min + Math.random() * (max - min + 1));
    return otp.toString().padStart(length, '0');
  }

  getExpirationTime(minutes: number = 10): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return now.toISOString();
  }

  isExpired(expiresAt: string): boolean {
    const now = new Date();
    const expiration = new Date(expiresAt);
    return now > expiration;
  }
}

export const otpService = new OTPService();
