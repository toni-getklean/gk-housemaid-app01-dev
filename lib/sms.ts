import axios from 'axios';

export interface SMSConfig {
  apiUrl: string;
  apiId: string;
  apiPassword: string;
  senderId: string;
}

export interface SendSMSParams {
  phoneNumber: string;
  message: string;
  uid?: string;
}

export class CYNSMSService {
  private apiUrl: string;
  private apiId: string;
  private apiPassword: string;
  private senderId: string;

  constructor(config?: SMSConfig) {
    this.apiUrl = config?.apiUrl || process.env.CYN_API_URL || '';
    this.apiId = config?.apiId || process.env.CYN_API_ID || '';
    this.apiPassword = config?.apiPassword || process.env.CYN_API_PASSWORD || '';
    this.senderId = config?.senderId || process.env.CYN_SENDER_ID || '';

    if (!this.apiUrl || !this.apiId || !this.apiPassword || !this.senderId) {
      console.warn('CYN SMS API credentials are not fully configured');
    }
  }

  private cleanPhoneNumber(phoneNumber: string): string {
    let cleaned = phoneNumber.replace(/\D/g, '');

    if (cleaned.startsWith('0')) {
      cleaned = '63' + cleaned.substring(1);
    } else if (!cleaned.startsWith('63')) {
      cleaned = '63' + cleaned;
    }

    return cleaned;
  }

  async sendSMS({ phoneNumber, message, uid }: SendSMSParams): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const cleanPhoneNumber = this.cleanPhoneNumber(phoneNumber);

      console.log(`Sending SMS to ${cleanPhoneNumber}`);

      const payload = {
        api_id: this.apiId,
        api_password: this.apiPassword,
        sms_type: 'P',
        encoding: 'T',
        sender_id: this.senderId,
        phonenumber: cleanPhoneNumber,
        textmessage: message,
        ValidityPeriodInSeconds: 120,
        ...(uid && { uid })
      };

      const response = await axios.post(`${this.apiUrl}/api/SendSMS`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      console.log('CYN SMS API response:', response.data);

      if (response.data && response.data.status === 'S') {
        return { success: true, message: 'SMS sent successfully' };
      }

      return {
        success: false,
        error: response.data?.ErrorMessage || 'Failed to send SMS'
      };
    } catch (error) {
      console.error('Error sending SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async sendOTP(phoneNumber: string, otpCode: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const message = `Your GetKlean verification code is: ${otpCode}. Valid for 10 minutes. Do not share this code with anyone.`;

    return this.sendSMS({
      phoneNumber,
      message,
      uid: `OTP_${otpCode}_${Date.now()}`
    });
  }
}

export const cynSMS = new CYNSMSService();
