import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { login, register as registerAccount } from "@/features/auth/services/authApi";
import {
  loginSchema,
  signupSchema,
  type LoginFormValues,
  type SignupFormValues,
} from "@/features/auth/schemas/authSchemas";
import { getApiErrorMessage } from "@/lib/axios";
import { isAdminRole, useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Login – SRFOOD" }] }),
  component: AuthPage,
});

function PasswordInput({
  field,
  autoFocus,
}: {
  field: UseFormRegisterReturn;
  autoFocus?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        className="pr-10"
        autoFocus={autoFocus}
        {...field}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

function AuthPage() {
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
            <SignupForm />
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
      const { tokens, user } = await login(values.mobile, values.password);
      setSession(user, tokens.accessToken, tokens.refreshToken);
      toast.success(`Welcome back, ${user.name}`);
      nav({ to: isAdminRole(user.role) ? "/admin" : "/" });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Invalid mobile number or password"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1.5">
        <Label>Mobile Number</Label>
        <Input inputMode="numeric" maxLength={10} placeholder="9876543210" {...field("mobile")} />
        {errors.mobile && <p className="text-xs text-destructive">{errors.mobile.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Password</Label>
        <PasswordInput field={field("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
        {isSubmitting ? "Logging in…" : "Login"}
      </Button>
    </form>
  );
}

function SignupForm() {
  const nav = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (values: SignupFormValues) => {
    try {
      const { tokens, user } = await registerAccount(values);
      setSession(user, tokens.accessToken, tokens.refreshToken);
      toast.success(`Welcome, ${user.name}`);
      nav({ to: "/" });
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
        <Label>Mobile Number</Label>
        <Input inputMode="numeric" maxLength={10} placeholder="9876543210" {...field("mobile")} />
        {errors.mobile && <p className="text-xs text-destructive">{errors.mobile.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Password</Label>
        <PasswordInput field={field("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create Account"}
      </Button>
    </form>
  );
}
