"use client";

import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/client";

interface UserNavProps {
  userName?: string | null;
  userEmail?: string | null;
}

export function UserNav({ userName, userEmail }: UserNavProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
      router.push("/");
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex sm:flex-col sm:items-end sm:text-sm">
        <span className="font-medium">{userName || "User"}</span>
        {userEmail && (
          <span className="text-xs text-muted-foreground">{userEmail}</span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" asChild className="sm:hidden">
          <Link href="/dashboard" aria-label="User profile">
            <User className="size-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          disabled={isPending}
          aria-label="Sign out"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </div>
  );
}
