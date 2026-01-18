import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useGigs, useCategories } from "@/hooks/use-gigs";
import { GigCard } from "@/components/GigCard";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Filter, SlidersHorizontal } from "lucide-react";

export default function GigsList() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const search = searchParams.get("search") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;

  const { data: gigs, isLoading } = useGigs({ search, categoryId });
  const { data: categories } = useCategories();

  const activeCategory = categories?.find(c => String(c.id) === categoryId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-10">
        <header className="mb-10">
          {search ? (
            <h1 className="text-3xl font-bold font-display mb-2">Results for "{search}"</h1>
          ) : activeCategory ? (
            <h1 className="text-3xl font-bold font-display mb-2">{activeCategory.name}</h1>
          ) : (
            <h1 className="text-3xl font-bold font-display mb-2">All Gigs</h1>
          )}
          <p className="text-muted-foreground">
            {gigs?.length || 0} services available
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Categories
              </h3>
              <div className="space-y-2">
                <Button 
                   variant={!categoryId ? "secondary" : "ghost"} 
                   className="w-full justify-start font-normal"
                   onClick={() => window.location.href = '/gigs'}
                >
                  All Categories
                </Button>
                {categories?.map((cat: any) => (
                  <Button 
                    key={cat.id}
                    variant={categoryId === String(cat.id) ? "secondary" : "ghost"} 
                    className="w-full justify-start font-normal"
                    onClick={() => window.location.href = `/gigs?categoryId=${cat.id}`}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-secondary/30 rounded-xl border border-border/50">
               <h3 className="font-semibold mb-3 text-sm">Budget</h3>
               <div className="flex gap-2 items-center">
                 <input className="w-full p-2 rounded-md border text-sm" placeholder="Min" />
                 <span className="text-muted-foreground">-</span>
                 <input className="w-full p-2 rounded-md border text-sm" placeholder="Max" />
               </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1">
             {isLoading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {Array.from({ length: 6 }).map((_, i) => (
                   <div key={i} className="h-[350px] rounded-2xl bg-secondary/20 animate-pulse" />
                 ))}
               </div>
             ) : gigs && gigs.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {gigs.map((gig: any) => (
                   <GigCard key={gig.id} gig={gig} />
                 ))}
               </div>
             ) : (
               <div className="text-center py-20 bg-secondary/10 rounded-2xl border border-dashed border-border">
                 <h3 className="text-lg font-semibold mb-2">No gigs found</h3>
                 <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
               </div>
             )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
