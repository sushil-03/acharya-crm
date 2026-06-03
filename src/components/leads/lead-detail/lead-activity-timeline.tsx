import {
  Search,
  Filter,
  Calendar,
  LayoutGrid,
  Plus,
  Download,
  List,
  UserPlus,
  Phone,
  Mail,
  FileText,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useGetCommunications } from "@/components/communications/hook/query/use-get-communications";
import { useSendCommunication } from "@/components/communications/hook/mutation/use-send-communication";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";
import { LeadDetail } from "@/types/lead";
import { TEMPLATE_OPTIONS } from "@/lib/constant";

export function LeadActivityTimeline({ lead }: { lead: LeadDetail }) {
  const { data: communications, isLoading } = useGetCommunications({ leadId: lead.id });
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<{ value: string; label: string } | null>(
    null,
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { mutate: sendCommunication, isPending: isSending } = useSendCommunication();

  const handleSelectTemplate = (channel: string, template: { value: string; label: string }) => {
    setSelectedChannel(channel);
    setSelectedTemplate(template);
    setIsConfirmOpen(true);
  };

  const handleConfirmSend = () => {
    if (!selectedChannel || !selectedTemplate) return;

    let to = lead.email;
    if (["whatsapp", "sms"].includes(selectedChannel)) {
      to = lead.mobile;
    }

    sendCommunication(
      {
        channel: selectedChannel,
        templateKey: selectedTemplate.value,
        to,
        leadId: lead.id,
        studentId: lead.student?.id || null,
      },
      {
        onSuccess: () => {
          setIsConfirmOpen(false);
        },
      },
    );
  };

  const getIconForChannel = (channel: string, customClass?: string) => {
    const className = customClass || "size-3.5 text-muted-foreground";
    switch (channel?.toLowerCase()) {
      case "email":
        return <Mail className={className} />;
      case "call":
        return <Phone className={className} />;
      case "message":
      case "sms":
      case "whatsapp":
      case "push":
        return <MessageSquare className={className} />;
      case "task":
        return <CheckCircle className={className} />;
      default:
        return <List className={className} />;
    }
  };

  const activities =
    communications?.map((comm) => ({
      title: `Sent ${comm.channel} message`,
      desc: comm.renderedMessage || comm.templateKey || "Communication logged",
      time: comm.createdAt
        ? formatDistanceToNow(new Date(comm.createdAt), { addSuffix: true })
        : "Unknown",
      date: comm.createdAt ? format(new Date(comm.createdAt), "MMM d, yyyy") : "Unknown",
      icon: getIconForChannel(comm.channel),
    })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Activity Timeline</h3>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 ">
                <Plus className="size-3.5 mr-1" /> Log Activity
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal text-muted-foreground text-xs">
                Select activity type
              </DropdownMenuLabel>
              {["whatsapp", "email", "sms", "push"].map((channel) => (
                <DropdownMenuSub key={channel}>
                  <DropdownMenuSubTrigger className="text-sm cursor-pointer capitalize">
                    {getIconForChannel(channel, "size-4 mr-2")} Log {channel}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {TEMPLATE_OPTIONS.map((template) => (
                        <DropdownMenuItem
                          key={template.value}
                          onClick={() => handleSelectTemplate(channel, template)}
                          className="text-sm cursor-pointer"
                        >
                          {template.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              ))}
              {/* <DropdownMenuItem className="text-sm cursor-pointer">
                <Phone className="size-4 mr-2" /> Log a Call
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm cursor-pointer">
                <FileText className="size-4 mr-2" /> Add a Note
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm cursor-pointer">
                <CheckCircle className="size-4 mr-2" /> Log a Task
              </DropdownMenuItem>*/}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Communication</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send the <strong>{selectedTemplate?.label}</strong> template
              via <strong>{selectedChannel}</strong> to this lead?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSend} disabled={isSending}>
              {isSending ? "Sending..." : "Send"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="pt-2">
        {!isLoading && activities.length > 0 && (
          <div className="flex items-center gap-4 mb-6">
            <span className="text-xs font-semibold text-foreground">{activities[0].date}</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        )}

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border" />

          <div className="space-y-6">
            {isLoading ? (
              <div className="text-[13px] text-muted-foreground">Loading activities...</div>
            ) : activities.length > 0 ? (
              activities.map((activity, i) => (
                <div key={i} className="relative flex items-start gap-4">
                  <div className="size-8 rounded-full border border-border bg-background grid place-items-center shrink-0 z-10">
                    {activity.icon}
                  </div>
                  <div className="flex-1 mt-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[13px] font-semibold text-foreground capitalize">
                        {activity.title}
                      </h4>
                      <span className="text-[11px] text-muted-foreground">{activity.time}</span>
                    </div>
                    <p className="text-[13px] text-muted-foreground mt-0.5 line-clamp-2">
                      {activity.desc}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[13px] text-muted-foreground">No activities logged yet.</div>
            )}
          </div>
        </div>

        <div className="mt-8 text-xs text-muted-foreground">
          Showing {activities.length} activities
        </div>
      </div>
    </div>
  );
}
