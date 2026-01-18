import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-secondary/30 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                P
              </div>
              <span className="font-display font-bold text-2xl tracking-tight">Prolance</span>
            </Link>
            <p className="text-muted-foreground max-w-sm mb-6">
              The premium marketplace for top-tier freelance talent. Connect, collaborate, and get work done.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/gigs?category=tech" className="hover:text-primary">Technology</Link></li>
              <li><Link href="/gigs?category=design" className="hover:text-primary">Design</Link></li>
              <li><Link href="/gigs?category=writing" className="hover:text-primary">Writing</Link></li>
              <li><Link href="/gigs?category=business" className="hover:text-primary">Business</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Events</a></li>
              <li><a href="#" className="hover:text-primary">Blog</a></li>
              <li><a href="#" className="hover:text-primary">Forum</a></li>
              <li><a href="#" className="hover:text-primary">Podcast</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Help & Support</a></li>
              <li><a href="#" className="hover:text-primary">Trust & Safety</a></li>
              <li><a href="#" className="hover:text-primary">Selling</a></li>
              <li><a href="#" className="hover:text-primary">Buying</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-sm text-muted-foreground">© 2024 Prolance Inc. All rights reserved.</span>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
