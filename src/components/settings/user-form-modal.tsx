import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_ROLES } from "@/lib/constant";
import { useGetCampuses } from "@/components/global/hooks/use-get-campuses";
import { PasswordStrengthField } from "@/components/ui/form-fields/password-strength-field";
import type { PaginatedUser } from "./hook/query/use-get-users-paginated";

const createSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Role is required"),
  campusId: z.string().optional(),
  isActive: z.boolean(),
});

const editSchema = z.object({
  email: z.string(),
  password: z.string(),
  role: z.string().min(1, "Role is required"),
  campusId: z.string().optional(),
  isActive: z.boolean(),
});

export type UserFormValues = z.infer<typeof createSchema>;

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
  editingUser: PaginatedUser | null;
  isPending: boolean;
}

export function UserFormModal({
  open,
  onOpenChange,
  onSubmit,
  editingUser,
  isPending,
}: UserFormModalProps) {
  const isEditing = !!editingUser;
  const { data: campuses, isLoading: isCampusesLoading } = useGetCampuses({ isActive: true });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(isEditing ? editSchema : createSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "",
      campusId: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (editingUser) {
        reset({
          email: editingUser.email,
          password: "",
          role: editingUser.role,
          campusId: editingUser.campusId ?? "",
          isActive: editingUser.isActive,
        });
      } else {
        reset({ email: "", password: "", role: "", campusId: "", isActive: true });
      }
    }
  }, [open, editingUser, reset]);

  const roleValue = watch("role");
  const campusIdValue = watch("campusId");
  const isActiveValue = watch("isActive");

  const onFormSubmit = async (data: UserFormValues) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4" autoComplete="off">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit User" : "Create User"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@acharya.ac.in"
                {...register("email")}
                autoComplete="new-email"
                readOnly={isEditing}
                className={isEditing ? "bg-muted cursor-not-allowed opacity-70" : ""}
              />
              {errors.email && (
                <p className="text-xs font-semibold text-danger">{errors.email.message}</p>
              )}
            </div>

            {!isEditing && (
              <PasswordStrengthField
                control={control}
                name="password"
                label="Password"
                placeholder="Min. 6 characters"
              />
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={roleValue} onValueChange={(v) => setValue("role", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-xs font-semibold text-danger">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="campusId">Campus (optional)</Label>
              <Select
                value={campusIdValue || "none"}
                onValueChange={(v) => setValue("campusId", v === "none" ? "" : v)}
                disabled={isCampusesLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={isCampusesLoading ? "Loading campuses..." : "Select Campus"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Optional)</SelectItem>
                  {campuses?.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isEditing && (
              <div className="flex items-center space-x-3 rounded-lg border p-3 shadow-xs">
                <div className="flex-1 space-y-0.5">
                  <Label htmlFor="isActive" className="text-sm font-medium">
                    Active Status
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Inactive users cannot log in to the CRM.
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={isActiveValue}
                  onCheckedChange={(v) => setValue("isActive", v)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              {isEditing ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
