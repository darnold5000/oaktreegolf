"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";

export default function UsersClient({ profile }: { profile: Profile }) {
  const [users, setUsers] = useState<Profile[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase.from("profiles").select("*").order("created_at");
      if (error) {
        toast.error("Could not load users.");
        return;
      }
      setUsers((data as Profile[]) ?? []);
    }
    load();
  }, []);

  return (
    <AdminShell profile={profile}>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Staff Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Invite staff through Supabase Auth, then set their role here or in user metadata during signup.
          </p>
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{user.full_name ?? "Unnamed user"}</p>
                <p className="text-sm text-muted-foreground">{user.id}</p>
              </div>
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
