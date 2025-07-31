import fetch from 'node-fetch';

// African countries and their operators supported by Reloadly
export const AFRICAN_COUNTRIES = {
  'NG': { // Nigeria
    name: 'Nigeria',
    code: '+234',
    currency: 'NGN',
    defaultAmount: 500,
    operators: ['MTN Nigeria', 'Airtel Nigeria', 'Glo Nigeria', '9mobile Nigeria']
  },
  'KE': { // Kenya
    name: 'Kenya', 
    code: '+254',
    currency: 'KES',
    defaultAmount: 50,
    operators: ['Safaricom Kenya', 'Airtel Kenya']
  },
  'GH': { // Ghana
    name: 'Ghana',
    code: '+233', 
    currency: 'GHS',
    defaultAmount: 5,
    operators: ['MTN Ghana', 'Vodafone Ghana', 'AirtelTigo Ghana']
  },
  'ZA': { // South Africa
    name: 'South Africa',
    code: '+27',
    currency: 'ZAR',
    defaultAmount: 15,
    operators: ['Vodacom South Africa', 'MTN South Africa', 'Cell C']
  },
  'UG': { // Uganda
    name: 'Uganda',
    code: '+256',
    currency: 'UGX', 
    defaultAmount: 2000,
    operators: ['MTN Uganda', 'Airtel Uganda']
  },
  'TZ': { // Tanzania
    name: 'Tanzania',
    code: '+255',
    currency: 'TZS',
    defaultAmount: 2000,
    operators: ['Vodacom Tanzania', 'Airtel Tanzania', 'Tigo Tanzania']
  },
  'RW': { // Rwanda
    name: 'Rwanda',
    code: '+250',
    currency: 'RWF',
    defaultAmount: 1000,
    operators: ['MTN Rwanda', 'Airtel Rwanda']
  },
  'ET': { // Ethiopia
    name: 'Ethiopia',
    code: '+251',
    currency: 'ETB',
    defaultAmount: 50,
    operators: ['Ethio Telecom']
  }
};

export class ReloadlyService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private baseUrl = 'https://topups.reloadly.com';
  private authUrl = 'https://auth.reloadly.com';

  constructor(
    private clientId: string,
    private clientSecret: string,
    private sandbox: boolean = false
  ) {
    if (sandbox) {
      this.baseUrl = 'https://topups-sandbox.reloadly.com';
      this.authUrl = 'https://auth-sandbox.reloadly.com';
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${this.authUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials',
          audience: 'https://topups.reloadly.com'
        })
      });

      const data = await response.json() as any;
      
      if (!response.ok) {
        throw new Error(`Authentication failed: ${data.error_description || data.error}`);
      }

      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 minute buffer

      return this.accessToken;
    } catch (error) {
      throw new Error(`Failed to get access token: ${error}`);
    }
  }

  public detectCountryFromPhone(phoneNumber: string): string | null {
    // Remove any non-numeric characters except +
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    
    for (const [countryCode, config] of Object.entries(AFRICAN_COUNTRIES)) {
      if (cleanPhone.startsWith(config.code)) {
        return countryCode;
      }
    }
    
    return null;
  }

  public async getOperators(countryCode: string): Promise<any[]> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/operators/countries/${countryCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get operators: ${response.statusText}`);
      }

      return await response.json() as any[];
    } catch (error) {
      throw new Error(`Error fetching operators: ${error}`);
    }
  }

  public async getOperatorByPhone(phoneNumber: string): Promise<any> {
    const countryCode = this.detectCountryFromPhone(phoneNumber);
    if (!countryCode) {
      throw new Error('Unsupported country for airtime rewards');
    }

    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/operators/auto-detect/phone/${phoneNumber}/countries/${countryCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to detect operator: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      // Fallback: get the first operator for the country
      const operators = await this.getOperators(countryCode);
      return operators[0] || null;
    }
  }

  public async sendAirtime(phoneNumber: string, customAmount?: number): Promise<any> {
    const countryCode = this.detectCountryFromPhone(phoneNumber);
    if (!countryCode) {
      throw new Error('Phone number from unsupported country');
    }

    const countryConfig = AFRICAN_COUNTRIES[countryCode as keyof typeof AFRICAN_COUNTRIES];
    const amount = customAmount || countryConfig.defaultAmount;

    try {
      const operator = await this.getOperatorByPhone(phoneNumber);
      if (!operator) {
        throw new Error('Could not detect mobile operator');
      }

      const token = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/topups`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operatorId: operator.operatorId,
          amount: amount,
          useLocalAmount: true,
          customIdentifier: `boomquotes_${Date.now()}`,
          recipientPhone: {
            countryCode: countryConfig.code.replace('+', ''),
            number: phoneNumber.replace(countryConfig.code, '')
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Airtime transfer failed');
      }

      return {
        success: true,
        transactionId: result.transactionId,
        amount: amount,
        currency: countryConfig.currency,
        country: countryConfig.name,
        operator: operator.name,
        phone: phoneNumber,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`Airtime transfer failed: ${error}`);
    }
  }

  public async getAccountBalance(): Promise<any> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/accounts/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get balance: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Error fetching balance: ${error}`);
    }
  }

  public async getTransactionHistory(page = 1, size = 20): Promise<any> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/topups/reports/transactions?page=${page}&size=${size}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get transactions: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Error fetching transactions: ${error}`);
    }
  }

  // Utility method to check if phone number is eligible for rewards
  public isEligibleForRewards(phoneNumber: string): boolean {
    return this.detectCountryFromPhone(phoneNumber) !== null;
  }

  // Get reward amount for country
  public getRewardAmount(phoneNumber: string): number {
    const countryCode = this.detectCountryFromPhone(phoneNumber);
    if (!countryCode) return 0;
    
    const config = AFRICAN_COUNTRIES[countryCode as keyof typeof AFRICAN_COUNTRIES];
    return config.defaultAmount;
  }

  // Get country info from phone
  public getCountryInfo(phoneNumber: string) {
    const countryCode = this.detectCountryFromPhone(phoneNumber);
    if (!countryCode) return null;
    
    return {
      code: countryCode,
      ...AFRICAN_COUNTRIES[countryCode as keyof typeof AFRICAN_COUNTRIES]
    };
  }
}

// Initialize service (will be configured with environment variables)
export function createReloadlyService(): ReloadlyService {
  const clientId = process.env.RELOADLY_CLIENT_ID;
  const clientSecret = process.env.RELOADLY_CLIENT_SECRET;
  const sandbox = process.env.NODE_ENV !== 'production';

  if (!clientId || !clientSecret) {
    throw new Error('Reloadly credentials not configured. Please set RELOADLY_CLIENT_ID and RELOADLY_CLIENT_SECRET');
  }

  return new ReloadlyService(clientId, clientSecret, sandbox);
}