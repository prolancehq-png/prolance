import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

export function useCategories() {
  return useQuery({
    queryKey: [api.categories.list.path],
    queryFn: async () => {
      const res = await fetch(api.categories.list.path);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return api.categories.list.responses[200].parse(await res.json());
    },
  });
}

export function useGigs(filters?: { search?: string; categoryId?: string }) {
  const queryKey = [api.gigs.list.path, filters];
  return useQuery({
    queryKey,
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters?.search) params.search = filters.search;
      if (filters?.categoryId) params.categoryId = filters.categoryId;
      
      const url = buildUrl(api.gigs.list.path);
      const queryString = new URLSearchParams(params).toString();
      const fullUrl = queryString ? `${url}?${queryString}` : url;

      const res = await fetch(fullUrl);
      if (!res.ok) throw new Error("Failed to fetch gigs");
      return api.gigs.list.responses[200].parse(await res.json());
    },
  });
}

export function useGig(id: number) {
  return useQuery({
    queryKey: [api.gigs.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.gigs.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch gig");
      return api.gigs.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateGig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: z.infer<typeof api.gigs.create.input>) => {
      const res = await fetch(api.gigs.create.path, {
        method: api.gigs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.gigs.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create gig");
      }
      return api.gigs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.gigs.list.path] });
      toast({
        title: "Gig Published!",
        description: "Your gig is now live on the marketplace.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
