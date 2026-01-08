// Facebook OAuth response types
// These are external API response types, not database types

export interface FacebookProfile {
  id: string;
  name: string;
  email?: string;
}

export interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
