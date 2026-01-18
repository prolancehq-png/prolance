import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useGig } from "@/hooks/use-gigs";
import { useCreateOrder } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, RefreshCcw, Check, Star, ShieldCheck, Heart, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GigDetails() {
  const { id } = useParams();
  const { data: gig, isLoading } = useGig(Number(id));
  const { mutate: createOrder, isPending: isOrdering } = useCreateOrder();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleOrder = () => {
    if (!isAuthenticated) {
      toast({
         title: "Sign in required",
         description: "Please sign in to place an order.",
         variant: "destructive"
      });
      return;
    }
    if (gig) {
      createOrder({ gigId: gig.id });
    }
  };

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  if (!gig) return <div className="min-h-screen bg-background flex items-center justify-center">Gig not found</div>;

  const sellerName = `${gig.seller?.firstName} ${gig.seller?.lastName}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-10">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                 <Link href={`/gigs?categoryId=${gig.categoryId}`} className="hover:text-primary transition-colors">
                   {gig.category?.name}
                 </Link>
                 <span>/</span>
                 <span className="text-foreground">Details</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6 leading-tight">
                {gig.title}
              </h1>
              
              <div className="flex items-center gap-6 pb-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                    <AvatarImage src={gig.seller?.profileImageUrl || undefined} />
                    <AvatarFallback>{sellerName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-sm">{sellerName}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                       <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                       <span className="font-semibold text-amber-500">5.0</span>
                       <span>(42 reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="h-8 w-px bg-border hidden sm:block" />
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Verified Professional</span>
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div className="rounded-2xl overflow-hidden border border-border bg-secondary/10">
              <img src={gig.coverImage} alt={gig.title} className="w-full object-cover max-h-[500px]" />
            </div>

            {/* Description */}
            <div className="prose prose-slate max-w-none">
              <h2 className="font-display text-2xl font-bold mb-4">About this Gig</h2>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed text-lg">
                {gig.description}
              </p>
            </div>

            {/* Seller Bio */}
            <div className="bg-secondary/20 rounded-2xl p-8">
              <h3 className="font-display font-bold text-xl mb-6">About the Seller</h3>
              <div className="flex gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={gig.seller?.profileImageUrl || undefined} />
                  <AvatarFallback className="text-xl">{sellerName[0]}</AvatarFallback>
                </Avatar>
                <div>
                   <h4 className="font-bold text-lg mb-1">{sellerName}</h4>
                   <p className="text-muted-foreground">Professional Freelancer since 2021</p>
                   <Button variant="outline" className="mt-4" size="sm">Contact Me</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-card border border-border rounded-2xl shadow-lg p-6 lg:p-8">
                <div className="flex justify-between items-baseline mb-6">
                   <span className="font-bold text-lg text-muted-foreground">Standard Package</span>
                   <span className="font-display font-bold text-3xl text-foreground">
                     ${(gig.price / 100).toFixed(0)}
                   </span>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                   A complete professional service package tailored to your needs.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{gig.deliveryTime} Days Delivery</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <RefreshCcw className="w-4 h-4 text-primary" />
                    <span>Unlimited Revisions</span>
                  </div>
                  <div className="space-y-2 pt-2">
                     {['Source File', 'High Resolution', 'Commercial Use'].map(feat => (
                       <div key={feat} className="flex items-center gap-3 text-sm text-muted-foreground">
                         <Check className="w-4 h-4 text-green-500" />
                         <span>{feat}</span>
                       </div>
                     ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25" 
                    onClick={handleOrder}
                    disabled={isOrdering}
                  >
                    {isOrdering ? "Processing..." : "Continue"} (<ArrowRight className="w-4 h-4 ml-1" />)
                  </Button>
                  <Button variant="outline" className="w-full h-12 text-base">
                    Contact Seller
                  </Button>
                </div>
              </div>
              
              <div className="bg-secondary/30 rounded-xl p-4 text-center">
                 <p className="text-sm font-medium text-muted-foreground">
                   <ShieldCheck className="w-4 h-4 inline mr-1 text-primary" />
                   100% Secure Payment
                 </p>
              </div>
            </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
