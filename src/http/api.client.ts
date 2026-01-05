import axios from "axios";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiOk<T> = T;
type ApiError = { ok: false; status: number; data: unknown };
type ApiResult<T> = ApiOk<T> | ApiError;

type ApiRequestOptions = {
  headers?: Record<string, string>;
};

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

function buildAuthHeaders(): Record<string, string> {
  const authToken = mustEnv("API_TOKEN");
  const orgToken = mustEnv("ORGANIZATION_TOKEN");

  const orgPayload = decodeJwtPayload(orgToken) as {
    organizationId?: unknown;
  } | null;

  const organizationId =
    orgPayload && typeof orgPayload.organizationId === "string"
      ? orgPayload.organizationId
      : undefined;

  return {
    Accept: "application/json",

    // Se o backend usa cookie como no browser, este é o ponto crítico:
    Cookie: [
      `auth_token=${authToken}`,
      // envie ambos para cobrir o nome real (um deles vai “bater”)
      `organization=${orgToken}`,
      `organization_token=${orgToken}`,
    ].join("; "),

    // Se quiser manter (não atrapalha), mas não conte com isso:
    Authorization: `Bearer ${authToken}`,
    ...(organizationId ? { "x-organization-id": organizationId } : {}),
    "x-organization-token": orgToken,
  };
}

// form-data (npm) expõe getHeaders()
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
    ...buildAuthHeaders(),
    ...(options?.headers ?? {}),
  };

  // 1) multipart -> axios (corrige Unexpected end of form)
  if (body !== undefined && method !== "GET" && isFormDataLike(body)) {
    const multipartHeaders = body.getHeaders();
    const mergedHeaders = { ...headers, ...multipartHeaders };

    try {
      const res = await axios.request({
        url,
        method,
        headers: mergedHeaders,
        data: body,
        // evita axios tentar transformar stream
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

  // 2) JSON -> fetch normal
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

// Helpers
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
