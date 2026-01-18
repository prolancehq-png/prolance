import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useGigs, useCategories } from "@/hooks/use-gigs";
import { GigCard } from "@/components/GigCard";
import { Search, ArrowRight, Code, PenTool, BarChart, Smartphone } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: gigs, isLoading: loadingGigs } = useGigs();
  const { data: categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/gigs?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden bg-secondary/30">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl tracking-tight text-foreground mb-6"
              >
                Find the perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">freelance</span> services for your business
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
              >
                Connect with talented professionals to get your projects done. High quality, safe payments, and 24/7 support.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-2xl mx-auto"
              >
                <form onSubmit={handleSearch} className="relative group">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex items-center bg-background rounded-full shadow-xl border border-border p-2 pr-2">
                    <Search className="ml-4 w-5 h-5 text-muted-foreground" />
                    <input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Try 'logo design' or 'wordpress'"
                      className="flex-1 px-4 py-3 bg-transparent border-none focus:ring-0 text-base placeholder:text-muted-foreground outline-none"
                    />
                    <Button size="lg" className="rounded-full px-8 font-semibold shadow-lg shadow-primary/20">
                      Search
                    </Button>
                  </div>
                </form>
                
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
                  <span>Popular:</span>
                  {['Web Design', 'Logo', 'WordPress', 'SEO'].map(tag => (
                    <Link key={tag} href={`/gigs?search=${tag}`}>
                      <span className="px-3 py-1 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 hover:text-primary cursor-pointer transition-colors">
                        {tag}
                      </span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-2">Explore Categories</h2>
                <p className="text-muted-foreground">Browse talent by category</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {categories?.map((cat: any) => (
                 <Link key={cat.id} href={`/gigs?categoryId=${cat.id}`}>
                   <div className="group p-6 rounded-2xl bg-secondary/30 border border-border/50 hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-1 transition-all cursor-pointer text-center">
                     <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-background shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform text-primary">
                       {/* Simplified icons logic */}
                       {cat.slug.includes('tech') ? <Code className="w-6 h-6" /> :
                        cat.slug.includes('design') ? <PenTool className="w-6 h-6" /> :
                        cat.slug.includes('marketing') ? <BarChart className="w-6 h-6" /> :
                        <Smartphone className="w-6 h-6" />}
                     </div>
                     <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
                   </div>
                 </Link>
              )) || (
                 // Loading Skeletons
                 Array.from({ length: 5 }).map((_, i) => (
                   <div key={i} className="h-40 rounded-2xl bg-secondary/50 animate-pulse" />
                 ))
              )}
            </div>
          </div>
        </section>

        {/* Featured Gigs */}
        <section className="py-24 bg-secondary/20 border-y border-border/50">
          <div className="container mx-auto px-4 sm:px-6">
             <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-2">Popular Professional Services</h2>
                <p className="text-muted-foreground">Most ordered gigs this week</p>
              </div>
              <Link href="/gigs">
                <Button variant="ghost" className="gap-2 group">
                  View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {loadingGigs ? (
                Array.from({ length: 4 }).map((_, i) => (
                   <div key={i} className="h-[400px] rounded-2xl bg-card border border-border shadow-sm animate-pulse" />
                ))
              ) : (
                gigs?.slice(0, 4).map((gig: any) => (
                  <GigCard key={gig.id} gig={gig} />
                ))
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay" />
          {/* Business meeting photo for texture */}
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h2 className="font-display font-bold text-4xl sm:text-5xl mb-6">Find the talent needed to <br/> get your business growing.</h2>
            <p className="text-primary-foreground/80 text-lg mb-10 max-w-2xl mx-auto">
              Advertise your skills to thousands of daily visitors or hire the perfect professional for your next project.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/gigs">
                 <Button size="lg" variant="secondary" className="font-bold px-8 h-14 rounded-full text-primary hover:bg-white">
                   Get Started
                 </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
