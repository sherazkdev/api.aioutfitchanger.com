import { lookup } from "dns/promises";
import { isIP } from "net";

const DEFAULT_MAX_BYTES = 12 * 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 30_000;

export type SafeFetchOptions = {
  maxBytes?: number;
  timeoutMs?: number;
  allowHttp?: boolean;
};

function ipv4ToInt(ip: string): number {
  return ip.split(".").reduce((acc, o) => (acc << 8) + Number(o), 0) >>> 0;
}

function isPrivateOrBlockedIpv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  const ranges: Array<[number, number]> = [
    [ipv4ToInt("0.0.0.0"), ipv4ToInt("0.255.255.255")],
    [ipv4ToInt("10.0.0.0"), ipv4ToInt("10.255.255.255")],
    [ipv4ToInt("127.0.0.0"), ipv4ToInt("127.255.255.255")],
    [ipv4ToInt("169.254.0.0"), ipv4ToInt("169.254.255.255")],
    [ipv4ToInt("172.16.0.0"), ipv4ToInt("172.31.255.255")],
    [ipv4ToInt("192.168.0.0"), ipv4ToInt("192.168.255.255")],
    [ipv4ToInt("100.64.0.0"), ipv4ToInt("100.127.255.255")],
  ];
  return ranges.some(([a, b]) => n >= a && n <= b);
}

function isBlockedHostname(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/\.$/, "");
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local")) return true;
  if (h === "metadata.google.internal") return true;
  if (h === "metadata" || h.endsWith(".metadata.google.internal")) return true;
  return false;
}

function isBlockedIp(ip: string): boolean {
  if (ip === "::1" || ip === "0:0:0:0:0:0:0:1") return true;
  if (ip.startsWith("fe80:") || ip.startsWith("fc") || ip.startsWith("fd")) return true;
  if (ip === "169.254.169.254") return true;
  if (isIP(ip) === 4) return isPrivateOrBlockedIpv4(ip);
  if (isIP(ip) === 6) {
    const lower = ip.toLowerCase();
    if (lower.startsWith("::ffff:")) {
      return isPrivateOrBlockedIpv4(lower.slice("::ffff:".length));
    }
  }
  return false;
}

export async function assertSafeRemoteUrl(
  rawUrl: string,
  opts: SafeFetchOptions = {}
): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("INVALID_URL");
  }

  if (url.protocol !== "https:" && !(opts.allowHttp && url.protocol === "http:")) {
    throw new Error("PROTOCOL_NOT_ALLOWED");
  }
  if (url.username || url.password) throw new Error("USERINFO_NOT_ALLOWED");
  if (isBlockedHostname(url.hostname)) throw new Error("HOST_BLOCKED");

  const hostIpType = isIP(url.hostname);
  if (hostIpType) {
    if (isBlockedIp(url.hostname)) throw new Error("IP_BLOCKED");
    return url;
  }

  const records = await lookup(url.hostname, { all: true });
  if (!records.length) throw new Error("DNS_FAILED");
  for (const r of records) {
    if (isBlockedIp(r.address)) throw new Error("IP_BLOCKED");
  }
  return url;
}

/**
 * Fetch remote bytes with SSRF protections, size limit, timeout, and no redirects.
 */
export async function safeFetchRemoteBytes(
  rawUrl: string,
  opts: SafeFetchOptions = {}
): Promise<{ buffer: Buffer; contentType: string }> {
  const maxBytes = opts.maxBytes ?? DEFAULT_MAX_BYTES;
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const url = await assertSafeRemoteUrl(rawUrl, opts);

  const res = await fetch(url.toString(), {
    method: "GET",
    redirect: "error",
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) throw new Error(`FETCH_FAILED_${res.status}`);

  const contentType = (res.headers.get("content-type") ?? "").toLowerCase();
  if (contentType && !contentType.startsWith("image/") && !contentType.includes("octet-stream")) {
    throw new Error("CONTENT_TYPE_NOT_ALLOWED");
  }

  const lenHeader = res.headers.get("content-length");
  if (lenHeader) {
    const n = Number(lenHeader);
    if (Number.isFinite(n) && n > maxBytes) throw new Error("RESPONSE_TOO_LARGE");
  }

  const ab = await res.arrayBuffer();
  if (ab.byteLength > maxBytes) throw new Error("RESPONSE_TOO_LARGE");
  if (ab.byteLength === 0) throw new Error("EMPTY_IMAGE");

  return { buffer: Buffer.from(ab), contentType };
}

export { isBlockedIp, isBlockedHostname };
