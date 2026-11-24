/**
 * Optional external integration connector for ONLYOFFICE Docs or Collabora Online (WOPI).
 * Used only if the user configures a self-hosted Document Server URL in Settings.
 */
export interface ExternalDocServerConfig {
  provider: 'onlyoffice' | 'collabora';
  serverUrl: string;
}

export function validateExternalServerUrl(url: string): boolean {
  if (!url.trim()) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export async function checkServerReachability(url: string): Promise<boolean> {
  if (!validateExternalServerUrl(url)) return false;
  try {
    const res = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return res.type === 'opaque' || res.ok;
  } catch {
    return false;
  }
}
