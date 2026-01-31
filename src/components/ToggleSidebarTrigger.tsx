import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { PanelLeftIcon } from "lucide-react";
import React from "react";
import { useSidebar } from "./ui/sidebar";
import { Toggle } from "./ui/toggle";

const ToggleSidebarTrigger = ({
  className,
  ...props
}: React.ComponentProps<typeof Toggle>) => {
  const { toggleSidebar, state, isMobile } = useSidebar();
  // サイドバー展開時はsidebar-width分右へ、閉じている/モバイル時は左余白
  const leftClass =
    !isMobile && state === "expanded"
      ? "left-[calc(var(--sidebar-width)+0.5rem)]"
      : "left-4";
  return (
    <Toggle
      className={cn(
        `bg-background fixed top-4 z-50 transition-[left,right,width] duration-200 ease-linear`,
        leftClass,
        className,
      )}
      variant="outline"
      onClick={toggleSidebar}
      pressed={state === "expanded"}
      {...props}
    >
      <PanelLeftIcon className="size-5" />
      <VisuallyHidden>Toggle Sidebar</VisuallyHidden>
    </Toggle>
  );
};

export default ToggleSidebarTrigger;
