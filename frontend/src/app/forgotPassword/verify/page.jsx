import { redirect } from "next/navigation";
import { ForgotPasswordVerifyOtpForm } from "./_components/forgot-password-verify-form";
import { verifyForgotPasswordToken } from "@/actions/auth-action";

const ForgotPasswordVerifyPage = async ({ searchParams }) => {
  const { token } = await searchParams;
  if (!token) {
    redirect("/");
  }
  const { ok } = await verifyForgotPasswordToken(token);
  if (!ok) {
    redirect("/");
  }
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordVerifyOtpForm token={token} />
      </div>
    </div>
  );
};
export default ForgotPasswordVerifyPage;
