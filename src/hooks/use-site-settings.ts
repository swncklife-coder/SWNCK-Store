import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { SiteSetting } from "@/types/commerce";

export function useSiteSettings() {
  const settingsQuery = useQuery({
    queryKey: ["site-settings-global"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_setting").select("*");
      if (error) throw error;
      return (data || []) as SiteSetting[];
    },
  });

  const settings = new Map((settingsQuery.data || []).map((item) => [item.key, item.value]));

  return { settings, settingsQuery };
}
