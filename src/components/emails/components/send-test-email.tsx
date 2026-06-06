import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { useSendCommunication } from "@/components/communications/hook/mutation/use-send-communication";
import { TestEmailVariablesDialog } from "./test-email-variables-dialog";

interface SendTestEmailProps {
  templateKey: string;
  subject: string;
  content?: string;
  getContent?: () => string;
  disabled?: boolean;
}

export function SendTestEmail({
  templateKey,
  subject,
  content = "",
  getContent,
  disabled = false,
}: SendTestEmailProps) {
  const [testEmails, setTestEmails] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { mutateAsync: sendCommunication } = useSendCommunication();

  const handleSendClick = () => {
    if (!testEmails.trim()) {
      toast.error("Please enter at least one email address");
      return;
    }
    setIsDialogOpen(true);
  };

  const handleActualSend = async (
    customizedSubject: string,
    customizedContent: string,
    params: Record<string, string>
  ) => {
    const emailList = testEmails
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    if (emailList.length === 0) {
      toast.error("Please enter at least one email address");
      return;
    }

    toast.loading("Sending test email...", { id: "send-test-email" });

    try {
      await Promise.all(
        emailList.map((email) =>
          sendCommunication({
            channel: "email",
            templateKey,
            to: email,
            params,
          })
        )
      );
      toast.success(`Test email successfully sent to ${testEmails}!`, { id: "send-test-email" });
      setTestEmails("");
      setIsDialogOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send test email";
      toast.error(msg, { id: "send-test-email" });
    }
  };

  const activeContent = getContent ? getContent() : content;

  return (
    <div className="p-4">
      <h3 className="font-semibold text-sm text-foreground mb-1.5 flex items-center gap-1.5">
        <Send className="size-3.5 text-success" /> Send Test Emails
      </h3>
      <p className="text-[11px] text-muted-foreground leading-normal mb-3">
        Send test emails to review layouts before publishing.
      </p>
      <div className="space-y-2">
        <textarea
          value={testEmails}
          onChange={(e) => setTestEmails(e.target.value)}
          placeholder="e.g. test@example.com, admin@acharya.ac.in"
          className="w-full text-xs bg-muted border border-border rounded p-2 focus:ring-1 focus:ring-primary outline-none min-h-[60px]"
          disabled={disabled}
        />
        <Button
          onClick={handleSendClick}
          disabled={disabled}
          className="w-full text-xs h-8 bg-success hover:bg-success/95 text-white flex items-center justify-center gap-1.5"
        >
          <Send className="size-3.5" /> Send Test Email
        </Button>
      </div>

      <TestEmailVariablesDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        subject={subject}
        content={activeContent}
        testEmails={testEmails}
        onSend={handleActualSend}
      />
    </div>
  );
}
