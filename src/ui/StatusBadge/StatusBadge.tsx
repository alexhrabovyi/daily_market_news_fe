import clsx from 'clsx';
import { UserStatus } from '@/api/api';

const STATUS_TEXT: Record<UserStatus, string> = {
  active: 'Активний',
  pending: 'Запрошено',
  deleted: 'Видалений',
  blocked: 'Заблокований',
};

const STATUS_STYLES: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-blue-100 text-blue-800',
  deleted: 'bg-gray-100 text-gray-800',
  blocked: 'bg-red-100 text-red-800',
};

interface BadgeProps {
  status: UserStatus,
}

export default function Badge({ status }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-[10px] py-[2px] text-[12px] font-inter font-medium',
        STATUS_STYLES[status],
      )}
    >
      {STATUS_TEXT[status]}
    </span>
  );
}
