import type { OauthClient } from '../../db/schema';

// Public-facing shape (never includes client_secret)
export type ClientPublic = Omit<OauthClient, 'clientSecret'>;

// Returned ONCE on create / regenerate — secret visible
export type ClientWithSecret = ClientPublic & { clientSecret: string };

export type ClientStatus = 'all' | 'active' | 'deleted';

export type ListClientsParams = {
  q?: string;
  status?: ClientStatus;
  page?: number;
  pageSize?: number;
};

export type ListClientsResult = {
  items: (ClientPublic & { activeTokenCount: number })[];
  page: number;
  pageSize: number;
  total: number;
};

export type CreateClientInput = {
  clientName: string;
  redirectUri: string;
  scope?: string | null;
  grantTypes?: string | null;
};

export type UpdateClientInput = Partial<CreateClientInput>;
