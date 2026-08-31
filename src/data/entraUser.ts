/**
 * Mocked Microsoft Entra ID / Graph profile for the MVP prototype.
 * Shape mirrors Graph `GET /me` + photo URL — no real auth or Graph calls.
 */
export interface EntraUserProfile {
  id: string;
  displayName: string;
  givenName: string;
  surname: string;
  jobTitle: string;
  mail: string;
  userPrincipalName: string;
  /** Mocked Graph photo URL; empty string falls back to initials. */
  photoUrl: string;
}

export const MOCK_ENTRA_USER: EntraUserProfile = {
  id: 'entra-mock-001',
  displayName: 'Aleksandra Mirkanovic',
  givenName: 'Aleksandra',
  surname: 'Mirkanovic',
  jobTitle: 'Lead Product Manager',
  mail: 'aleksandra.mirkanovic@example.com',
  userPrincipalName: 'aleksandra.mirkanovic@example.com',
  photoUrl: `${import.meta.env.BASE_URL}avatars/entra-user.svg`,
};

export function getEntraInitials(user: EntraUserProfile): string {
  const first = user.givenName?.charAt(0) ?? '';
  const last = user.surname?.charAt(0) ?? '';
  const initials = `${first}${last}`.toUpperCase();
  return initials || user.displayName.slice(0, 2).toUpperCase();
}

/** Simulated async profile fetch (prototype stand-in for Graph). */
export async function fetchMockEntraProfile(): Promise<EntraUserProfile> {
  await new Promise((r) => setTimeout(r, 120));
  return MOCK_ENTRA_USER;
}
