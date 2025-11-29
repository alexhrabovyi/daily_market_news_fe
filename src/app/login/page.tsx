import { connection } from 'next/server';
import LoginContainer from '@/ui/LoginContainer/LoginContainer';

export default async function Page() {
  await connection();

  return <LoginContainer />;
}
