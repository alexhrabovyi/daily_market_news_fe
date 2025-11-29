import { connection } from 'next/server';
import ConfirmPasswordResetContainer from '@/ui/ConfirmPasswordResetContainer/ConfirmPasswordResetContainer';

export default async function Page() {
  await connection();

  return (
    <ConfirmPasswordResetContainer />
  );
}
