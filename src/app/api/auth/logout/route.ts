import { logoutResponse } from '@/lib/auth-api-helpers';

export async function POST() {
  return logoutResponse();
}
