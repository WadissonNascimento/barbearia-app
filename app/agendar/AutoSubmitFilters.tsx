"use client";

import { useEffect } from "react";

export function AutoSubmitFilters() {
  useEffect(() => {
    const handleChange = (event: Event) => {
      const target = event.target as HTMLInputElement | HTMLSelectElement | null;
      if (!target) return;

      const form = target.closest('form[data-auto-submit="true"]') as HTMLFormElement | null;
      if (!form) return;

      form.requestSubmit();
    };

    document.addEventListener("change", handleChange);

    return () => {
      document.removeEventListener("change", handleChange);
    };
  }, []);

  return null;
}