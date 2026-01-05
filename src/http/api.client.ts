import axios from "axios";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiOk<T> = T;
type ApiError = { ok: false; status: number; data: unknown };
type ApiResult<T> = ApiOk<T> | ApiError;

type ApiRequestOptions = {
  headers?: Record<string, string>;
  auth?: AuthCtx;
};

type AuthCtx = {
  authToken?: string;
  organizationToken?: string;
  cookie?: string;
  organizationId?: string;
};

function buildAuthHeadersFromContext(ctx?: AuthCtx): Record<string, string> {
  const authToken = ctx?.authToken?.trim() || process.env.API_TOKEN?.trim();
  const orgToken =
    ctx?.organizationToken?.trim() || process.env.ORGANIZATION_TOKEN?.trim();

  if (!authToken || !orgToken) {
    throw new Error("Auth ausente: authToken/organizationToken não informados");
  }

  const organizationId =
    ctx?.organizationId ||
    (() => {
      const payload = decodeJwtPayload(orgToken) as {
        organizationId?: unknown;
      } | null;
      return payload && typeof payload.organizationId === "string"
        ? payload.organizationId
        : undefined;
    })();

  const cookie =
    ctx?.cookie?.trim() ||
    [
      `auth_token=${authToken}`,
      `organization=${orgToken}`,
      `organization_token=${orgToken}`,
    ].join("; ");

  return {
    Accept: "application/json",
    Cookie: cookie,

    Authorization: `Bearer ${authToken}`,
    ...(organizationId ? { "x-organization-id": organizationId } : {}),
    "x-organization-token": orgToken,
  };
}

function mustEnv(name: string): string {
  const v = process.env[name];
  if (typeof v !== "string" || v.trim().length === 0) {
    throw new Error(`${name} não definido no ambiente`);
  }
  return v.trim();
}

function decodeJwtPayload(token: string): unknown | null {
  try {
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return null;
    const json = Buffer.from(payloadB64, "base64url").toString("utf8");
    return JSON.parse(json) as unknown;
  } catch {
    return null;
  }
}

type FormDataLike = { getHeaders: () => Record<string, string> };

function isFormDataLike(body: unknown): body is FormDataLike {
  return (
    typeof body === "object" &&
    body !== null &&
    typeof (body as FormDataLike).getHeaders === "function"
  );
}

async function apiRequest<T = unknown>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options?: ApiRequestOptions
): Promise<ApiResult<T>> {
  const base = mustEnv("API_BASE_URL");
  const url = `${base}${path}`;

  const headers: Record<string, string> = {
    ...buildAuthHeadersFromContext(options?.auth),
    ...(options?.headers ?? {}),
  };

  if (body !== undefined && method !== "GET" && isFormDataLike(body)) {
    const multipartHeaders = body.getHeaders();
    const mergedHeaders = { ...headers, ...multipartHeaders };

    try {
      const res = await axios.request({
        url,
        method,
        headers: mergedHeaders,
        data: body,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        validateStatus: () => true,
      });

      if (res.status < 200 || res.status >= 300) {
        return { ok: false, status: res.status, data: res.data };
      }

      return res.data as T;
    } catch (err: unknown) {
      return { ok: false, status: 500, data: err };
    }
  }

  let fetchBody: string | undefined;

  if (body !== undefined && method !== "GET") {
    headers["Content-Type"] = "application/json";
    fetchBody = JSON.stringify(body);
  }

  const res = await fetch(url, {
    method,
    headers,
    body: fetchBody,
  });

  const text = await res.text();
  let data: unknown;
  try {
    data = text ? (JSON.parse(text) as unknown) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    return { ok: false, status: res.status, data };
  }

  return data as T;
}

export const api = {
  get: <T = unknown>(path: string, options?: ApiRequestOptions) =>
    apiRequest<T>("GET", path, undefined, options),

  post: <T = unknown>(
    path: string,
    body?: unknown,
    options?: ApiRequestOptions
  ) => apiRequest<T>("POST", path, body, options),

  put: <T = unknown>(
    path: string,
    body?: unknown,
    options?: ApiRequestOptions
  ) => apiRequest<T>("PUT", path, body, options),

  patch: <T = unknown>(
    path: string,
    body?: unknown,
    options?: ApiRequestOptions
  ) => apiRequest<T>("PATCH", path, body, options),

  del: <T = unknown>(path: string, options?: ApiRequestOptions) =>
    apiRequest<T>("DELETE", path, undefined, options),
};
