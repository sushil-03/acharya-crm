import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
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

export const LoginForm = () => {
  const router = useRouter();
  const { signin, isPending } = useLogin();
  const setUser = useUserStore((state) => state.setUser);

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
