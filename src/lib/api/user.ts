import { User, UserTaxInfo } from '@/types/user';

export async function getUserTaxInfoApi(token: string, taxYear: number){
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/tax-info?taxYear=${taxYear}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed tp fetch tax info');
  }
  return res.json();
}

export async function updateUserTaxInfoApi(token: string,data: UserTaxInfo){
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/tax-info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
       Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update tax info');
  }
  console.log(res)
  return res.json();
}

export async function getUserApi(token: string, username: string){
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${username}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed tp fetch user info');
  }
  console.log(res)
  return res.json();
}