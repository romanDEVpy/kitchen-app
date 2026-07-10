import { successResponse } from '@/lib/apiResponse';

export async function POST() {
  const response = successResponse({ loggedOut: true });
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/'
  });
  return response;
}
