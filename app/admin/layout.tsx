"use client";

import { useCallback, useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import AdminLogin from "@/components/admin/AdminLogin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/cryptohost/transfers?limit=1", { credentials: "include" });
      setAuthed(res.ok);
    } catch {
      setAuthed(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (authed === null) {
    return <div style={{ minHeight: "100vh", background: "#0D0D0D" }} />;
  }

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return <AdminShell>{children}</AdminShell>;
}
