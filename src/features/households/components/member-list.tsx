"use client";

import { User } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Member {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface MemberListProps {
  members: Member[];
  currentUserId: string;
}

export function MemberList({ members, currentUserId }: MemberListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Household Members</CardTitle>
        <CardDescription>
          {members.length} {members.length === 1 ? "member" : "members"} in your
          household
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="size-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {member.name}
                  {member.id === currentUserId && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (you)
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {member.email}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
