"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" />
      </Button>
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold">Hearth</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <SidebarNav onNavClick={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
