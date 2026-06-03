import React, { useEffect, useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateLead } from "@/components/leads/hook/mutation/use-create-lead";
import { InputField } from "@/components/ui/form-fields/input-field";
import SelectField from "@/components/ui/form-fields/select-field";
import { TextareaField } from "@/components/ui/form-fields/textarea-field";
import { DatePickerWithYearField } from "@/components/ui/form-fields/date-picker-with-year-field";
import { format } from "date-fns";
import { PhoneField } from "@/components/ui/form-fields/phone-field";
import { LANGUAGE_OPTIONS } from "@/lib/constant";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { CheckCircle2, ArrowRight, Phone, Mail, Globe, MapPin, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/global/theme-toggle";
import { toast } from "sonner";
import { useGetCampuses } from "@/components/global/hooks/use-get-campuses";
import { AutocompleteField } from "@/components/ui/form-fields/autocomplete-field";

const GENDERS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const CAMPUSES = [
  { label: "Acharya Bangalore Main Campus", value: "f4ab6e99-0d6a-47aa-9d75-161721687437" },
];

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobile: z.string().min(10, "Mobile number is required"),
  email: z.string().email("Invalid email address"),
  dob: z.date({ required_error: "Date of birth is required" }),
  gender: z.string().min(1, "Gender is required"),
  courseInterest: z.string().optional(),
  campusInterest: z.string().optional(),
  campusId: z.string().min(1, "Campus is required"),
  sourceChannel: z.string().min(1, "Source channel is required"),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  languagePreference: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const Route = createFileRoute("/acharyawebsite")({
  component: AcharyaWebsitePage,
  head: () => ({
    meta: [
      { title: "Student Inquiry | Acharya Bangalore Main Campus" },
      {
        name: "description",
        content:
          "Submit your details to inquire about courses and admissions at Acharya Bangalore Main Campus.",
      },
    ],
  }),
});

function AcharyaWebsitePage() {
  // Call auth guard in non-protected mode to prevent redirecting to login
  useAuthGuard({ isProtectedRoute: false });

  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    email: string;
    mobile: string;
  } | null>(null);

  const { mutate: createLead, isPending } = useCreateLead();
  const { data: campusesData, isLoading: isCampusesLoading } = useGetCampuses({ isActive: true });

  const campusOptions = useMemo(() => {
    return (campusesData || []).map((c) => ({
      label: c.name,
      value: c.id,
    }));
  }, [campusesData]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
      dob: undefined as unknown as Date,
      gender: "",
      courseInterest: "",
      campusInterest: "",
      campusId: "f4ab6e99-0d6a-47aa-9d75-161721687437", // Default to Acharya Bangalore Main Campus
      sourceChannel: "website", // Direct direct student inquiry from web
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      utmContent: "",
      country: "",
      state: "",
      city: "",
      languagePreference: "",
      notes: "",
    },
  });

  // Extract UTM params from the URL search string automatically on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get("utm_source") || params.get("utmSource");
      const utmMedium = params.get("utm_medium") || params.get("utmMedium");
      const utmCampaign = params.get("utm_campaign") || params.get("utmCampaign");
      const utmContent = params.get("utm_content") || params.get("utmContent");

      if (utmSource) form.setValue("utmSource", utmSource);
      if (utmMedium) form.setValue("utmMedium", utmMedium);
      if (utmCampaign) form.setValue("utmCampaign", utmCampaign);
      if (utmContent) form.setValue("utmContent", utmContent);
    }
  }, [form]);

  function onSubmit(values: FormValues) {
    const selectedCampus = campusOptions.find((c) => String(c.value) === String(values.campusId));
    const campusLabel = selectedCampus ? String(selectedCampus.label) : "";

    const payload = {
      ...values,
      dob: format(values.dob, "yyyy-MM-dd"),
      courseInterest: values.courseInterest || "",
      campusInterest: campusLabel || "",
      campusId: values.campusId || "f4ab6e99-0d6a-47aa-9d75-161721687437",
      sourceChannel: values.sourceChannel || "website",
      country: values.country || "",
      state: values.state || "",
      city: values.city || "",
      utmSource: values.utmSource || "",
      utmMedium: values.utmMedium || "",
      utmCampaign: values.utmCampaign || "",
      utmContent: values.utmContent || "",
      languagePreference: values.languagePreference || "",
      notes: values.notes || "",
    };

    createLead(payload, {
      onSuccess: () => {
        setSubmittedData({
          name: values.name,
          email: values.email,
          mobile: values.mobile,
        });
        setSubmitted(true);
        form.reset();
      },
    });
  }

  if (submitted && submittedData) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 dark:bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-[0%] right-[0%] w-[60%] h-[60%] rounded-full bg-primary/5 dark:bg-primary/10 blur-[100px]" />
        </div>

        <div className="w-full max-w-xl relative z-10 bg-white border border-slate-200 shadow-xl dark:bg-slate-900/60 dark:border-slate-800/80 p-8 md:p-10 rounded-2xl backdrop-blur-xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="inline-flex items-center justify-center size-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-400 mb-2">
            <CheckCircle2 className="size-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-display font-extrabold tracking-tight">
              Inquiry Submitted!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
              Thank you,{" "}
              <span className="text-slate-900 dark:text-white font-semibold">
                {submittedData.name}
              </span>
              . Your details have been recorded successfully.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 dark:bg-slate-950/50 dark:border-slate-800/50 rounded-xl p-5 text-left text-sm text-slate-600 dark:text-slate-300 space-y-3">
            <div className="font-semibold text-slate-800 border-b border-slate-200/80 pb-2 mb-2 flex items-center gap-2 dark:text-slate-200 dark:border-slate-800/80">
              <Sparkles className="size-4 text-primary" /> What happens next?
            </div>
            <div className="flex gap-3">
              <span className="text-primary font-bold">1.</span>
              <p>
                Our admissions counselling team will review your course preference and eligibility.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-primary font-bold">2.</span>
              <p>
                An advisor will contact you within 24 hours at{" "}
                <span className="text-slate-900 dark:text-white font-medium">
                  {submittedData.mobile}
                </span>{" "}
                or via email at{" "}
                <span className="text-slate-900 dark:text-white font-medium">
                  {submittedData.email}
                </span>
                .
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-primary font-bold">3.</span>
              <p>
                We will guide you through application form steps, scholarships, and campus
                facilities.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 shadow-md hover:shadow-primary/20"
              onClick={() => setSubmitted(false)}
            >
              Submit Another Inquiry
            </Button>
            <Button
              variant="outline"
              className="border-slate-200 hover:bg-slate-50 text-slate-700 font-medium dark:border-slate-800 dark:hover:bg-slate-900 dark:text-slate-300"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "https://www.acharya.ac.in";
                }
              }}
            >
              Visit Official Website <ArrowRight className="size-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white relative overflow-hidden flex flex-col transition-colors duration-300">
      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[75%] h-[75%] rounded-full bg-primary/5 dark:bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[0%] right-[0%] w-[65%] h-[65%] rounded-full bg-primary/5 dark:bg-primary/10 blur-[100px]" />
        <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-400/5 dark:bg-blue-500/5 blur-[80px]" />
      </div>

      {/* Branded Header */}
      <header className="relative z-10 border-b border-slate-100 bg-white/60 dark:border-slate-900 dark:bg-slate-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/brand/logo.png"
            alt="Acharya Logo"
            className="size-9 shrink-0 rounded-sm object-contain"
          />
          <div>
            <div className="font-display font-bold text-lg tracking-tight text-slate-900 dark:text-white">
              ACHARYA <span className="text-primary font-extrabold">UNIVERSITY</span>
            </div>
            <div className="text-[9px] tracking-[0.2em] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5">
              Bangalore Main Campus
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            <a
              href="tel:+918023722222"
              className="hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <Phone className="size-4" /> +91 80 237 22222
            </a>
            <a
              href="mailto:admissions@acharya.ac.in"
              className="hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <Mail className="size-4" /> admissions@acharya.ac.in
            </a>
          </div>
          <div className="border-l border-slate-200 dark:border-slate-800 h-6 hidden md:block" />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 py-12 md:py-16">
        <div className="w-full max-w-4xl space-y-8">
          {/* Title & Introduction */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] uppercase tracking-widest font-semibold">
              <Sparkles className="size-3" /> Admissions Open 2026-27
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-400">
              Start Your Journey Today
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
              Acharya Bangalore Main Campus is home to over 15,000+ students from 75+ countries.
              Fill out the quick details below and our admissions council will help you select the
              ideal academic path.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-slate-200/80 shadow-xl dark:bg-slate-900/40 dark:border-slate-800/80 rounded-2xl dark:shadow-2xl backdrop-blur-md overflow-hidden animate-in fade-in duration-300">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, (errors) => {
                  console.error("Form validation failed:", errors);
                  toast.error("Please fill in all required fields and correct any errors.");
                })}
                className="divide-y divide-slate-100 dark:divide-slate-800/60"
              >
                {/* Personal Information Section */}
                <div className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/50">
                    <div className="size-2.5 rounded-full bg-primary" />
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                      Personal Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <InputField
                        control={form.control}
                        name="name"
                        label="Full Name"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div className="space-y-1">
                      <PhoneField
                        control={form.control}
                        name="mobile"
                        label="Mobile Number"
                        placeholder="e.g. 9876543210"
                      />
                    </div>
                    <div className="space-y-1">
                      <InputField
                        control={form.control}
                        name="email"
                        label="Email Address"
                        type="email"
                        placeholder="e.g. john@example.com"
                      />
                    </div>
                    <div className="space-y-1">
                      <DatePickerWithYearField
                        control={form.control}
                        name="dob"
                        label="Date of Birth"
                        placeholder="Select DOB"
                      />
                    </div>
                    <div className="space-y-1">
                      <SelectField
                        control={form.control}
                        name="gender"
                        label="Gender"
                        options={GENDERS}
                        placeholder="Select gender"
                      />
                    </div>
                    <div className="space-y-1">
                      <SelectField
                        control={form.control}
                        name="languagePreference"
                        label="Preferred Language"
                        options={LANGUAGE_OPTIONS}
                        placeholder="Select language"
                      />
                    </div>
                  </div>
                </div>

                {/* Academic & Campus Interest Section */}
                <div className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/50">
                    <div className="size-2.5 rounded-full bg-primary" />
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                      Academic & Campus Interest
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <InputField
                        control={form.control}
                        name="courseInterest"
                        label="Course of Interest"
                        placeholder="e.g. B.Tech Computer Science, MBA"
                      />
                    </div>
                    <div className="space-y-1">
                      <AutocompleteField
                        control={form.control}
                        name="campusId"
                        label="Campus Selection"
                        options={campusOptions}
                        placeholder="Select campus"
                        isLoading={isCampusesLoading}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Address details Section */}
                <div className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/50">
                    <div className="size-2.5 rounded-full bg-primary" />
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                      Location Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <InputField
                        control={form.control}
                        name="country"
                        label="Country"
                        placeholder="e.g. India"
                      />
                    </div>
                    <div className="space-y-1">
                      <InputField
                        control={form.control}
                        name="state"
                        label="State"
                        placeholder="e.g. Karnataka"
                      />
                    </div>
                    <div className="space-y-1">
                      <InputField
                        control={form.control}
                        name="city"
                        label="City"
                        placeholder="e.g. Bangalore"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Notes Section */}
                <div className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/50">
                    <div className="size-2.5 rounded-full bg-primary" />
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                      Tell Us More
                    </h3>
                  </div>

                  <div className="space-y-1">
                    <TextareaField
                      control={form.control}
                      name="notes"
                      label="Additional Details or Questions"
                      placeholder="Let us know your goals, academic backgrounds, or any specific query you have..."
                    />
                  </div>
                </div>

                {/* Submit button bar */}
                <div className="p-6 md:p-8 flex justify-end items-center gap-4 bg-slate-50/50 dark:bg-slate-900/10">
                  <p className="text-xs text-slate-500 hidden sm:block">
                    By clicking submit you agree to be contacted by our team.
                  </p>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-2 h-11 text-sm rounded-lg shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    {isPending ? "Submitting Inquiry..." : "Submit Inquiry"}
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-slate-50 dark:border-slate-950 dark:bg-slate-950 py-6 px-6 text-center text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>© 2026 Acharya Group of Institutions. All rights reserved.</div>
        <div className="flex items-center gap-6">
          <a
            href="https://www.acharya.ac.in"
            className="text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors flex items-center gap-1"
          >
            <Globe className="size-3.5" /> www.acharya.ac.in
          </a>
        </div>
      </footer>
    </div>
  );
}
