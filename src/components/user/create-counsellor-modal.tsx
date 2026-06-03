import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/form-fields/input-field";
import { MultiSelectTagsField } from "@/components/ui/form-fields/multi-select-tags-field";
import { useCreateCounsellor } from "./hook/mutation/use-create-councellor";
import { User } from "./hook/query/use-get-users";
import { LANGUAGE_OPTIONS } from "@/lib/constant";

const formSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  campusId: z.string().min(1, "Campus ID is required"),
  mobile: z.string().min(10, "Mobile number is required"),
  specialization: z.array(z.string()).min(1, "Select at least one specialization"),
  languageProficiency: z.array(z.string()).min(1, "Select at least one language"),
  dailyCallTarget: z.coerce.number().min(1, "Target must be at least 1"),
});

type FormValues = z.infer<typeof formSchema>;

const SPECIALIZATION_OPTIONS = [
  { value: "MBA", label: "MBA" },
  { value: "BBA", label: "BBA" },
  { value: "B.Tech", label: "B.Tech" },
  { value: "B.Arch", label: "B.Arch" },
  { value: "Pharm.D", label: "Pharm.D" },
  { value: "MBBS", label: "MBBS" },
];


interface CreateCounsellorModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCounsellorModal({ user, open, onOpenChange }: CreateCounsellorModalProps) {
  const { mutate: createCounsellor, isPending } = useCreateCounsellor();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: user?.id || "",
      name: user?.username || user?.email.split("@")[0] || "",
      email: user?.email || "",
      campusId: user?.campusId || "",
      mobile: "",
      specialization: [],
      languageProficiency: [],
      dailyCallTarget: 30,
    },
  });

  // Update form when user changes
  React.useEffect(() => {
    if (user && open) {
      form.reset({
        userId: user.id,
        name: user.username || user.email.split("@")[0],
        email: user.email,
        campusId: user.campusId || "", // Default fallback if needed
        mobile: "",
        specialization: [],
        languageProficiency: [],
        dailyCallTarget: 30,
      });
    }
  }, [user, open, form]);

  const onSubmit = (data: FormValues) => {
    createCounsellor(data, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Counsellor</DialogTitle>
          <DialogDescription>Assign counsellor profile to this user.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField control={form.control} name="name" label="Name" disabled readOnly />
              <InputField control={form.control} name="email" label="Email" disabled readOnly />
            </div>

            {/* Hidden fields for userId and campusId since they are read-only and mapped from user */}
            <div className="hidden">
              <InputField control={form.control} name="userId" label="User ID" />
              <InputField control={form.control} name="campusId" label="Campus ID" />
            </div>

            <InputField
              control={form.control}
              name="mobile"
              label="Mobile Number"
              placeholder="Enter mobile number"
              type="tel"
            />

            <MultiSelectTagsField
              control={form.control}
              name="specialization"
              label="Specialization"
              options={SPECIALIZATION_OPTIONS}
              placeholder="Select specializations"
            />
            <MultiSelectTagsField
              control={form.control}
              name="languageProficiency"
              label="Language Proficiency"
              options={LANGUAGE_OPTIONS}
              placeholder="Select languages"
            />

            <InputField
              control={form.control}
              name="dailyCallTarget"
              label="Daily Call Target"
              type="number"
              placeholder="e.g. 30"
              valueOverride={form.watch("dailyCallTarget")}
              // Note: since it's a number, we should intercept onChange or rely on zod coercion
              // Let's use coercion in the form submit or use the value as string internally.
              // We'll update the schema to coerce.
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
