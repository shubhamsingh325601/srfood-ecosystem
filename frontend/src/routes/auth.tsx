import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  login,
  register as registerAccount,
  resendOtp,
  verifyRegisterOtp,
} from "@/features/auth/services/authApi";
import {
  loginSchema,
  otpSchema,
  signupSchema,
  type LoginFormValues,
  type OtpFormValues,
  type SignupFormValues,
} from "@/features/auth/schemas/authSchemas";
import { getApiErrorMessage } from "@/lib/axios";
import { isAdminRole, useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Login – SRFOOD" }] }),
  component: AuthPage,
});

function AuthPage() {
  const [pendingMobile, setPendingMobile] = useState<string | null>(null);

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-center mb-6">Welcome to SRFOOD</h1>
      <div className="bg-card border rounded-2xl p-5">
        <Tabs defaultValue="login">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="signup">
            {pendingMobile ? (
              <OtpForm mobile={pendingMobile} />
            ) : (
              <SignupForm onRegistered={setPendingMobile} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function LoginForm() {
  const nav = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const { tokens, user } = await login(values.identifier, values.password);
      setSession(user, tokens.accessToken, tokens.refreshToken);
      toast.success(`Welcome back, ${user.name}`);
      nav({ to: isAdminRole(user.role) ? "/admin" : "/" });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Invalid email/mobile or password"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1.5">
        <Label>Email or Mobile</Label>
        <Input {...field("identifier")} />
        {errors.identifier && (
          <p className="text-xs text-destructive">{errors.identifier.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label>Password</Label>
        <Input type="password" {...field("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
        {isSubmitting ? "Logging in…" : "Login"}
      </Button>
    </form>
  );
}

function SignupForm({ onRegistered }: { onRegistered: (mobile: string) => void }) {
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (values: SignupFormValues) => {
    try {
      await registerAccount(values);
      toast.success("Account created — enter the OTP sent to your mobile");
      onRegistered(values.mobile);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create account"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1.5">
        <Label>Full Name</Label>
        <Input {...field("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input type="email" {...field("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Mobile</Label>
        <Input {...field("mobile")} />
        {errors.mobile && <p className="text-xs text-destructive">{errors.mobile.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Password</Label>
        <Input type="password" {...field("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create Account"}
      </Button>
    </form>
  );
}

function OtpForm({ mobile }: { mobile: string }) {
  const nav = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpFormValues>({ resolver: zodResolver(otpSchema) });

  const onSubmit = async (values: OtpFormValues) => {
    try {
      const { tokens, user } = await verifyRegisterOtp(mobile, values.code);
      setSession(user, tokens.accessToken, tokens.refreshToken);
      toast.success("Account verified!");
      nav({ to: "/" });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Incorrect or expired OTP"));
    }
  };

  const handleResend = async () => {
    try {
      await resendOtp(mobile);
      toast.success("OTP resent");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not resend OTP"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to +91 {mobile}</p>
      <div className="space-y-1.5">
        <Label>OTP Code</Label>
        <Input inputMode="numeric" maxLength={6} {...field("code")} />
        {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
      </div>
      <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
        {isSubmitting ? "Verifying…" : "Verify & Continue"}
      </Button>
      <button
        type="button"
        onClick={handleResend}
        className="w-full text-center text-xs text-primary hover:underline"
      >
        Resend OTP
      </button>
    </form>
  );
}
