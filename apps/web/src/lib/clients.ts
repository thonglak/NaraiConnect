import { v1 } from './api';

export type ClientStatus = 'all' | 'active' | 'deleted';

export type ClientListItem = {
  clientId: string;
  clientName: string | null;
  redirectUri: string;
  scope: string | null;
  grantTypes: string | null;
  isActive: number;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  activeTokenCount: number;
};

export type ClientListResult = {
  items: ClientListItem[];
  page: number;
  pageSize: number;
  total: number;
};

export type ClientDetail = ClientListItem;

export type ClientWithSecret = ClientDetail & { clientSecret: string };

const unwrap = <T,>(res: { data: T | null; error: { value?: { error?: { message?: string } } } | null }): T => {
  if (res.error) {
    const msg = res.error.value?.error?.message ?? 'Request failed';
    throw new Error(msg);
  }
  if (res.data === null) throw new Error('Empty response');
  return res.data;
};

export const listClients = async (params: {
  q?: string;
  status?: ClientStatus;
  page?: number;
  pageSize?: number;
}): Promise<ClientListResult> => {
  const res = await v1.clients.get({ query: params });
  return unwrap(res) as ClientListResult;
};

export const getClient = async (clientId: string): Promise<ClientDetail> => {
  const res = await v1.clients({ clientId }).get();
  return unwrap(res) as ClientDetail;
};

export const createClient = async (input: {
  clientName: string;
  redirectUri: string;
  scope?: string | null;
  grantTypes?: string | null;
}): Promise<ClientWithSecret> => {
  const res = await v1.clients.post(input);
  return unwrap(res) as ClientWithSecret;
};

export const updateClient = async (
  clientId: string,
  input: {
    clientName?: string;
    redirectUri?: string;
    scope?: string | null;
    grantTypes?: string | null;
  },
): Promise<ClientDetail> => {
  const res = await v1.clients({ clientId }).patch(input);
  return unwrap(res) as ClientDetail;
};

export const regenerateSecret = async (clientId: string): Promise<ClientWithSecret> => {
  const res = await v1.clients({ clientId }).regenerate.post();
  return unwrap(res) as ClientWithSecret;
};

export const softDeleteClient = async (clientId: string): Promise<ClientDetail> => {
  const res = await v1.clients({ clientId }).delete();
  return unwrap(res) as ClientDetail;
};

export const restoreClient = async (clientId: string): Promise<ClientDetail> => {
  const res = await v1.clients({ clientId }).restore.post();
  return unwrap(res) as ClientDetail;
};
