import { env } from '../config/env';
import { notifyAuthSessionExpired } from './authSessionEvents';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

type PreparedRequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit;
};

type RefreshResult = 'refreshed' | 'rejected' | 'unavailable';

let refreshRequest: Promise<RefreshResult> | null = null;

function fetchApi(path: string, options: PreparedRequestOptions) {
  return fetch(`${env.apiBaseUrl}${path}`, {
    ...options,
    credentials: 'include',
  });
}

function canRefreshSession(path: string) {
  return !path.startsWith('/auth/');
}

function refreshSession() {
  if (refreshRequest) {
    return refreshRequest;
  }

  refreshRequest = fetchApi('/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response): RefreshResult => {
      if (response.ok) return 'refreshed';
      if (response.status === 401) return 'rejected';
      return 'unavailable';
    })
    .catch((): RefreshResult => 'unavailable')
    .finally(() => {
      refreshRequest = null;
    });

  return refreshRequest;
}

async function requestPrepared<T>(
  path: string,
  options: PreparedRequestOptions,
): Promise<T> {
  let response = await fetchApi(path, options);

  if (response.status === 401 && canRefreshSession(path)) {
    const refreshResult = await refreshSession();

    response = await fetchApi(path, options);

    if (response.status === 401 && refreshResult === 'rejected') {
      notifyAuthSessionExpired();
    }
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

function request<T>(path: string, options: RequestOptions = {}) {
  return requestPrepared<T>(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

function requestForm<T>(path: string, body: FormData) {
  return requestPrepared<T>(path, {
    method: 'POST',
    body,
  });
}

export const httpClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  postForm: <T>(path: string, body: FormData) => requestForm<T>(path, body),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
