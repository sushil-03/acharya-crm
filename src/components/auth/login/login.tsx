import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import CryptoJS from "crypto-js";
import { useLogin } from "../hook/query/use-login";
import { useUserStore } from "@/store/use-user-store";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/form-fields/input-field";
import { PasswordField } from "@/components/ui/form-fields/password-field";
import { LoginFormValues, loginSchema } from "@/zod/user-schema";
import { Button } from "@/components/ui/button";
import { setAuthData } from "@/lib/auth-utils";
import Axios from "@/lib/axios-config";
import { CRM_ENCRYPT_KEY } from "@/lib/constant";

export const LoginForm = () => {
  const router = useRouter();
  const { signin, isPending } = useLogin();
  const setUser = useUserStore((state) => state.setUser);
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");

    if (tokenParam) {
      const handleAutoLogin = async () => {
        setIsAutoLoggingIn(true);
        const toastId = toast.loading("Authenticating automatically...");
        try {
          // Decrypt the token
          const bytes = CryptoJS.AES.decrypt(tokenParam, CRM_ENCRYPT_KEY);
          const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
          if (!decryptedText) {
            throw new Error("Invalid decryption key or corrupted token");
          }
          const accessToken = JSON.parse(decryptedText);

          // Fetch user details from /api/v1/auth/me using the decrypted accessToken
          const response = await Axios.get("/api/v1/auth/me", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          const user = response.data;
          if (user && user.id) {
            const loginResponse = {
              accessToken,
              expiresIn: "3600",
              user: {
                id: user.id,
                email: user.email || user.username,
                role: user.role,
                campusId: user.campusId || null,
              },
            };

            setAuthData(loginResponse);
            setUser(loginResponse.user);
            toast.success("Login successful!", { id: toastId });
            router.navigate({ to: "/dashboard" });
          } else {
            throw new Error("Invalid user details returned from server");
          }
        } catch (error: any) {
          console.error("Auto login failed:", error);
          toast.error(
            error.message || "Auto login failed. Please sign in manually.",
            { id: toastId }
          );
          setIsAutoLoggingIn(false);
        }
      };

      handleAutoLogin();
    }
  }, [router, setUser]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    signin(data, {
      onSuccess: (response) => {
        console.log("res", response);
        if (response.user) {
          setAuthData(response);
          setUser(response.user);
          toast.success("Login successful!");
          router.navigate({ to: "/dashboard" });
        } else {
          toast.error("Invalid response from server");
        }
      },
      onError: (error) => {
        toast.error(error.message || "Failed to login. Please check your credentials.");
      },
    });
  };

  if (isAutoLoggingIn) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Authenticating you automatically, please wait...
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
        <InputField
          control={form.control}
          name="username"
          label="Email Address"
          placeholder="you@acharya.edu"
          type="email"
          disabled={isPending}
        />
        <PasswordField
          control={form.control}
          name="password"
          label="Password"
          placeholder="Enter your password"
        />
        <Button type="submit" disabled={isPending} loading={isPending} className="w-full">
          Sign in <ArrowRight className="size-4" />
        </Button>
      </form>
    </Form>
  );
};
