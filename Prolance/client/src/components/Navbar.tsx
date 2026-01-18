import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, LogOut, LayoutDashboard, User, Briefcase, PlusCircle } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/gigs?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Search */}
          <div className="flex items-center gap-8 flex-1">
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform">
                P
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-foreground">
                Prolance
              </span>
            </Link>

            <form onSubmit={handleSearch} className="hidden md:flex relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What service are you looking for?"
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-secondary/50 border border-transparent focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm font-medium"
              />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-6">
            <Link href="/gigs" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Explore
            </Link>
            
            {!isAuthenticated ? (
              <div className="flex items-center gap-3">
                <a href="/api/login">
                  <Button variant="ghost" className="font-medium">Sign In</Button>
                </a>
                <a href="/api/login">
                  <Button className="rounded-full px-6 shadow-lg shadow-primary/20">Join</Button>
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                 <Link href="/gigs/new" className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    <PlusCircle className="w-4 h-4" />
                    <span>Post a Gig</span>
                 </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-primary/20 p-0 overflow-hidden">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || 'User'} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {user?.firstName?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl border-border/50">
                    <DropdownMenuLabel className="font-normal px-2 py-1.5">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/dashboard">
                      <DropdownMenuItem className="cursor-pointer rounded-lg focus:bg-primary/10 focus:text-primary">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/dashboard?tab=selling">
                      <DropdownMenuItem className="cursor-pointer rounded-lg focus:bg-primary/10 focus:text-primary">
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>Selling</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/profile">
                       <DropdownMenuItem className="cursor-pointer rounded-lg focus:bg-primary/10 focus:text-primary">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg"
                      onClick={() => logout()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
