import { useState, useEffect, useCallback } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import { useResendEmailConfirmationMutation, ResendEmailConfirmationFailedResponse } from '@/api/api';
import Button from '@/ui/Button/Button';
import SITE_LINKS from '@/utils/SITE_LINKS';

interface VerifyEmailProps {
  email: string;
  userId: number | null;
  anotherEmailBtnOnClick: () => void,
}

export default function VerifyEmail({ email, userId, anotherEmailBtnOnClick }: VerifyEmailProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const [countDown, setCountDown] = useState(60);

  const [
    resendEmailConfirmation,
    { isLoading: isResendEmailConfirmationLoading },
  ] = useResendEmailConfirmationMutation();

  useEffect(() => {
    const countdownFinish = Number(JSON.parse(localStorage.getItem('resend_email_countdown_finish') || '0'));

    if (countdownFinish) {
      const secDiff = Math.floor((Date.now() - countdownFinish) / 1000);

      if (secDiff >= 0) {
        setCountDown(0);
      } else {
        setCountDown(Math.abs(secDiff));
      }
    } else {
      localStorage.setItem('resend_email_countdown_finish', JSON.stringify(Date.now() + 60 * 1000));
    }
  }, []);

  useEffect(() => {
    if (countDown === 0) return;

    const timerId = setTimeout(() => {
      setCountDown((prevCountDown) => prevCountDown - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [countDown]);

  const resendBtnOnClick = useCallback(async () => {
    if (
      isResendEmailConfirmationLoading
      || !userId
    ) return;

    let newCountDown: number | null = null;

    try {
      const resendEmailResp = await resendEmailConfirmation({ user_id: userId }).unwrap();

      newCountDown = resendEmailResp.retry_after;
    } catch (err) {
      const e = err as ResendEmailConfirmationFailedResponse;

      if (e.status === 429) {
        newCountDown = e.data.retry_after;
      } else if (e.status === 404) {
        setErrors(['An unknown error occurred. Please try again later.']);
        newCountDown = 60;
      }
    } finally {
      if (newCountDown !== null) {
        setCountDown(newCountDown);
        localStorage.setItem('resend_email_countdown_finish', JSON.stringify(Date.now() + newCountDown * 1000));
      }
    }
  }, [isResendEmailConfirmationLoading, resendEmailConfirmation, userId]);

  return (
    <div
      className="flex flex-col items-center"
    >
      <span
        className="mb-[24px] w-[96px] h-[96px] rounded-full bg-blue-100 flex items-center justify-center"
      >
        <Mail className="h-[48px] w-[48px] text-blue-500" />
      </span>
      <h2
        className="font-inter text-black text-[30px] font-bold mb-[16px] text-center leading-[36px]"
      >
        Confirm your email address
      </h2>
      <p
        className="font-inter text-gray-600 mb-[8px] text-center"
      >
        We have sent an email with a confirmation link to:
      </p>
      <p
        className="font-inter text-[18px] text-gray-600 font-semibold mb-[32px] text-center"
      >
        {email}
      </p>
      <div
        className="w-full flex flex-col items-stretch gap-[24px]"
      >
        <Button
          linkMode={false}
          isBlue={false}
          className="w-full"
          isDisabled={countDown > 0 || isResendEmailConfirmationLoading}
          onClick={resendBtnOnClick}
        >
          {isResendEmailConfirmationLoading ? (
            <>
              <RefreshCw
                className="animate-spin h-[20px] w-[29px] mr-[8px]"
              />
              Sending...
            </>
          ) : countDown > 0 ? `Resend (${countDown}s)` : 'Resend'}
        </Button>
        <Button
          linkMode
          href={SITE_LINKS.login}
          className="w-full"
        >
          Go to login
        </Button>
      </div>
      <ul
        className="font-inter text-red-500 text-[14px] flex-col items-stretch gap-[8px] mt-[8px]"
      >
        {errors.map((error) => (
          <li
            key={error}
          >
            {error}
          </li>
        ))}
      </ul>
      <p
        className="font-inter text-gray-500 text-center text-[14px] leading-[20px] mt-[24px]"
      >
        Didn&apos;t receive the email? Check your &quot;Spam&quot; folder or&nbsp;
        <button
          type="button"
          className="text-blue-500 transition-standart hover:underline"
          onClick={anotherEmailBtnOnClick}
        >
          try another email
        </button>
      </p>
    </div>
  );
}
