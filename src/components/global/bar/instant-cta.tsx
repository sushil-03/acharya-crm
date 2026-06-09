import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useUserStore } from "@/store/use-user-store";
import { ChevronDown, Plus, UserPlus } from "lucide-react";

import { useNavigate } from "@tanstack/react-router";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function InstantCta({ collapsed }: { collapsed?: boolean }) {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  if (collapsed) {
    return (
      <div className="px-3 pt-4 pb-1 flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="icon"
              className="size-10 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/95 transition-all duration-200"
              onClick={() => navigate({ to: "/leads/new" })}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span>New Lead</span>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  if (user?.role === "super_admin") {
    return (
      <div className="px-3 pt-4 pb-1">
        <div className="flex items-stretch w-full shadow-sm rounded-md">
          <Button 
            variant="default" 
            className="flex-1 rounded-r-none justify-start font-normal "
            onClick={() => navigate({ to: "/leads/new" })}
          >
            <Plus className="h-4 w-4" />
            New Lead
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="rounded-l-none h-8 border-l border-white/50"
              >
                <ChevronDown className="h-4 w-4 opacity-80" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-58 p-0">
              <DropdownMenuItem 
                className="cursor-pointer rounded-sm pl-3"
                onClick={() => navigate({ to: "/leads/new" })}
              >
                <Plus className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>New Lead</span>
              </DropdownMenuItem>
              <Separator />
              <DropdownMenuItem 
                className="cursor-pointer rounded-sm pl-3"
                onClick={() => navigate({ to: "/users/new" })}
              >
                <UserPlus className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>New User</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 pt-4 pb-1">
      <Button
        variant="default"
        className="w-full justify-start font-medium shadow-sm hover:bg-primary/90"
        onClick={() => navigate({ to: "/leads/new" })}
      >
        <Plus className="mr-2 h-4 w-4" />
        New Lead
      </Button>
    </div>
  );
}
