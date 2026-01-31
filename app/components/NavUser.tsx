import { Check, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

// Demo-only fallback identities used when no identities are provided via props.
// In production usage, prefer passing an explicit `identities` array to NavUser.
const DEFAULT_IDENTITIES = ["Guest", "Alice", "Bob", "Charlie"];

type Props = {
  name: string;
  onNameChange: (name: string) => void;
  identities?: string[];
};

export function NavUser({ name, onNameChange, identities }: Props) {
  const { isMobile } = useSidebar();
  const list = identities ?? DEFAULT_IDENTITIES;
  const initials = name
    .split(" ")
    .map((segment) => segment[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="gap-2">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback>{initials || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col text-sm">
                <span className="truncate font-medium">{name}</span>
                <span className="text-muted-foreground text-xs">
                  Switch identity
                </span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel>Pick who you are</DropdownMenuLabel>
            {list.map((candidate) => (
              <DropdownMenuItem
                key={candidate}
                className="flex items-center gap-2"
                onSelect={() => onNameChange(candidate)}
              >
                <UserCircle className="size-4" />
                <span className="flex-1 truncate text-sm">{candidate}</span>
                {candidate === name && (
                  <Check className="text-sidebar-accent-foreground size-4" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
