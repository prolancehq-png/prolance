import { Link } from "wouter";
import { Star, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface GigCardProps {
  gig: {
    id: number;
    title: string;
    coverImage: string;
    price: number;
    description: string;
    seller?: {
      firstName: string | null;
      lastName: string | null;
      profileImageUrl: string | null;
    };
    category?: {
      name: string;
    };
  };
}

export function GigCard({ gig }: GigCardProps) {
  const sellerName = `${gig.seller?.firstName || "Unknown"} ${gig.seller?.lastName || ""}`;
  
  return (
    <div className="group flex flex-col h-full bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-border transition-all duration-300">
      <Link href={`/gigs/${gig.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden cursor-pointer">
          <img 
            src={gig.coverImage} 
            alt={gig.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-sm bg-white/90 hover:bg-white hover:text-red-500">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
          <div className="absolute bottom-3 left-3">
             <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
               {gig.category?.name || "Service"}
             </span>
          </div>
        </div>
      </Link>
      
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-6 w-6 ring-2 ring-background">
            <AvatarImage src={gig.seller?.profileImageUrl || undefined} />
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{sellerName[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-muted-foreground truncate">{sellerName}</span>
        </div>

        <Link href={`/gigs/${gig.id}`} className="block mb-2">
          <h3 className="font-display font-semibold text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {gig.title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1 mb-4">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="font-bold text-sm">5.0</span>
          <span className="text-muted-foreground text-sm">(24)</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Starting at</span>
          <span className="font-display font-bold text-xl text-foreground">
            ${(gig.price / 100).toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
}
