import { mainApi } from "./clients";

interface NewronAuthResponse {
  is_new: boolean;
  user_id: number;
  access_token: string;
  email: string;
  name: string;
}

export async function loginWithGoogle(idToken: string, fcmToken?: string) {
  const res = await mainApi.post<{ status: string; data: NewronAuthResponse }>("/auth/google", {
    id_token: idToken,
    ...(fcmToken && { fcm_token: fcmToken }),
  });
  return res.data.data;
}

export async function verifyToken(accessToken: string) {
  const res = await mainApi.post<{ status: string; data: NewronAuthResponse }>(
    "/auth/verify",
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return res.data.data;
}
