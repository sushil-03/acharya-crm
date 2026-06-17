import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateUser } from "@/components/user/hook/mutation/use-create-user";
import { PasswordStrengthField } from "@/components/ui/form-fields/password-strength-field";
import { USER_ROLES } from "@/lib/constant";
import { useGetCampuses } from "@/components/global/hooks/use-get-campuses";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Role is required"),
  campusId: z.string().min(1, "Campus is required"),
});

export const Route = createFileRoute("/users/new")({
  component: NewUserPage,
});

function NewUserPage() {
  const navigate = useNavigate();
  const { mutate: createUser, isPending } = useCreateUser();
  const { data: campuses, isLoading: isCampusesLoading } = useGetCampuses({ isActive: true });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "",
      campusId: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createUser(values, {
      onSuccess: () => {
        form.reset();
        // You can redirect to users list here if desired:
        // navigate({ to: "/" });
      },
    });
  }

  return (
    <AppShell>
      <PageHeader title="Create New User" breadcrumb="Settings · Users · New" />

      <div className="max-w-3xl mt-6">
        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="counsellor@acharyainstitutions.com"
                        type="email"
                        autoComplete="new-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <PasswordStrengthField
                control={form.control}
                name="password"
                label="Password"
                placeholder="Enter password"
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>System Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {USER_ROLES.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="campusId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campus</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isCampusesLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isCampusesLoading ? "Loading campuses..." : "Select a campus"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {campuses?.map((campus) => (
                            <SelectItem key={campus.id} value={campus.id}>
                              {campus.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => navigate({ to: "/dashboard" })}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </AppShell>
  );
}
