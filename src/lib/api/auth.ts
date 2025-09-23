// lib/api/auth.ts
import { LoginDto,RegisterDto } from "@/types/user";

export async function loginApi(data: LoginDto): Promise<{ accessToken: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Login failed');
  }
  return res.json();
}

export async function registerApi(data: RegisterDto): Promise<{ accessToken: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Registration failed');
  }

  return res.json(); // Expected response: { accessToken: string }
}
