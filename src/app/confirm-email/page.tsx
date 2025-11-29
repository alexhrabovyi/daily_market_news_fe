import { connection } from 'next/server';
import ConfirmEmailContainer from '@/ui/ConfirmEmailContainer/ConfirmEmailContainer';

export default async function Page() {
  await connection();

  return (
    <ConfirmEmailContainer />
  );
}
