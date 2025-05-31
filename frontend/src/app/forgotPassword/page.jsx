import { ForgotPasswordGetOtpForm } from "./_components/forgot-password-get-otp-form";

const ForgotPasswordPage = () => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordGetOtpForm />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
