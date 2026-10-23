"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "./sheet";

type PanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  trigger: React.ReactElement;
  children: React.ReactNode;
  dismissible?: boolean;
  className?: string;
};

export function MobileDrawer({ open, onOpenChange, title, description, trigger, children, dismissible = true, className }: PanelProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => { if (dismissible) onOpenChange(next); }}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className={cn("mobile-editor-drawer mx-auto max-h-[85dvh] w-full max-w-xl gap-0 overflow-hidden rounded-t-2xl pb-[env(safe-area-inset-bottom)] outline-none motion-reduce:animate-none", className)}
        onPointerDownOutside={dismissible ? undefined : (event) => event.preventDefault()}
        onEscapeKeyDown={dismissible ? undefined : (event) => event.preventDefault()}
      >
        <div aria-hidden className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-foreground/15" />
        <div className="flex shrink-0 items-center justify-between gap-4 px-5 py-4">
          <div className="min-w-0 space-y-1">
            <SheetTitle className="text-base">{title}</SheetTitle>
            <SheetDescription className="text-xs leading-5">{description}</SheetDescription>
          </div>
          <SheetClose asChild>
            <Button variant="secondary" disabled={!dismissible} className="h-11 shrink-0 rounded-lg px-4">Done</Button>
          </SheetClose>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

export function ResponsivePopover(props: PanelProps) {
  const isMobile = useIsMobile();
  if (isMobile) return <MobileDrawer {...props} className={undefined} />;

  return (
    <Popover open={props.open} onOpenChange={props.dismissible === false ? undefined : props.onOpenChange}>
      <PopoverTrigger asChild>{props.trigger}</PopoverTrigger>
      <PopoverContent
        aria-label={props.title}
        className={props.className}
        align="center"
        sideOffset={8}
        collisionPadding={16}
        onPointerDownOutside={props.dismissible === false ? (event) => event.preventDefault() : undefined}
        onEscapeKeyDown={props.dismissible === false ? (event) => event.preventDefault() : undefined}
      >
        {props.children}
      </PopoverContent>
    </Popover>
  );
}
