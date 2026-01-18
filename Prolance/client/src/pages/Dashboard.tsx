import { Navbar } from "@/components/Navbar";
import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { format, subDays, startOfDay } from "date-fns";
import { Package, Briefcase, Clock, CheckCircle, XCircle, MousePointer2, Eye, DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Gig } from "@shared/schema";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { user } = useAuth();
  const [location] = useLocation();
  
  const { data: gigs, isLoading: gigsLoading } = useQuery<Gig[]>({
    queryKey: ['/api/gigs'],
    enabled: !!user,
  });

  const isSellingTab = location.includes("selling");

  const buyingOrders = orders?.filter((o: any) => o.buyerId === user?.id) || [];
  const sellingOrders = orders?.filter((o: any) => o.gig?.sellerId === user?.id) || [];
  const myGigs = gigs?.filter(g => g.sellerId === user?.id) || [];

  const totalEarnings = sellingOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + (o.price - o.commissionFee), 0);

  const totalClicks = myGigs.reduce((sum, g) => sum + (g.clicks || 0), 0);
  const totalImpressions = myGigs.reduce((sum, g) => sum + (g.impressions || 0), 0);

  // Generate chart data for last 7 days
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'MMM dd');
    const dayStart = startOfDay(date);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const dayOrders = sellingOrders.filter(o => {
      const orderDate = o.createdAt ? new Date(o.createdAt) : null;
      return orderDate && orderDate >= dayStart && orderDate < dayEnd;
    });

    return {
      name: dateStr,
      orders: dayOrders.length,
      earnings: dayOrders.reduce((sum, o) => sum + (o.price - o.commissionFee) / 100, 0)
    };
  });

  const isLoading = ordersLoading || gigsLoading;

  return (
    <div className="min-h-screen bg-secondary/10 flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your orders and track performance</p>
        </header>

        {isSellingTab && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    Total Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(totalEarnings / 100).toFixed(0)}</div>
                  <p className="text-xs text-muted-foreground mt-1">From completed orders</p>
                </CardContent>
              </Card>
              <Card className="bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MousePointer2 className="w-4 h-4 text-blue-500" />
                    Total Clicks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalClicks}</div>
                  <p className="text-xs text-muted-foreground mt-1">Clicks on your gigs</p>
                </CardContent>
              </Card>
              <Card className="bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Eye className="w-4 h-4 text-purple-500" />
                    Impressions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalImpressions}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total gig views</p>
                </CardContent>
              </Card>
              <Card className="bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    Conversion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalClicks > 0 ? ((sellingOrders.length / totalClicks) * 100).toFixed(1) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Orders per click</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Sales Performance (Last 7 Days)
                </CardTitle>
                <CardDescription>Daily earnings from your services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="name" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        itemStyle={{ color: 'hsl(var(--primary))' }}
                      />
                      <Bar 
                        dataKey="earnings" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]} 
                        name="Earnings ($)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Tabs defaultValue={isSellingTab ? "selling" : "buying"} className="w-full">
          <TabsList className="mb-8 w-full sm:w-auto h-auto p-1 bg-background border border-border rounded-xl">
             <TabsTrigger value="buying" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-base">
                Buying ({buyingOrders.length})
             </TabsTrigger>
             <TabsTrigger value="selling" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-base">
                Selling ({sellingOrders.length})
             </TabsTrigger>
          </TabsList>

          <TabsContent value="buying">
            <OrdersList orders={buyingOrders} type="buying" isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="selling">
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" /> Active Orders
                </h2>
                <OrdersList orders={sellingOrders} type="selling" isLoading={isLoading} />
              </section>

              <section>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Briefcase className="w-5 h-5" /> Your Gigs
                  </h2>
                  <Link href="/gigs/create">
                    <Button size="sm">Create New Gig</Button>
                  </Link>
                </div>
                {myGigs.length === 0 ? (
                  <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border">
                    <p className="text-muted-foreground">You haven't created any gigs yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {myGigs.map(gig => (
                      <Card key={gig.id} className="overflow-hidden">
                        <img src={gig.coverImage} className="w-full h-32 object-cover" />
                        <CardContent className="p-4">
                          <h3 className="font-bold line-clamp-1 mb-2">{gig.title}</h3>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {gig.impressions}</span>
                            <span className="flex items-center gap-1"><MousePointer2 className="w-3 h-3" /> {gig.clicks}</span>
                            <span className="font-bold text-foreground">${(gig.price / 100).toFixed(0)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";

function OrdersList({ orders, type, isLoading }: { orders: any[], type: 'buying' | 'selling', isLoading: boolean }) {
  if (isLoading) return <div className="text-center py-20">Loading...</div>;
  
  if (orders.length === 0) {
    return (
      <div className="text-center py-24 bg-card rounded-2xl border border-dashed border-border">
         <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
           {type === 'buying' ? <Package className="w-8 h-8" /> : <Briefcase className="w-8 h-8" />}
         </div>
         <h3 className="text-xl font-bold mb-2">No orders found</h3>
         <p className="text-muted-foreground mb-6">
           {type === 'buying' ? "You haven't purchased any gigs yet." : "You haven't received any orders yet."}
         </p>
         {type === 'buying' && (
           <Link href="/gigs">
             <span className="inline-flex px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-semibold cursor-pointer shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
               Explore Gigs
             </span>
           </Link>
         )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Link key={order.id} href={`/orders/${order.id}`}>
          <Card className="hover:border-primary/50 transition-all cursor-pointer hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                
                {/* Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                  <img src={order.gig.coverImage} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-grow">
                   <div className="flex items-center gap-2 mb-1">
                     <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
                       {order.gig.title}
                     </h3>
                   </div>
                   <p className="text-sm text-muted-foreground">
                     Order #{order.id} • {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                   </p>
                </div>

                {/* Status & Price */}
                <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-2 w-full md:w-auto justify-between md:justify-end">
                   <span className="font-bold text-lg">${(order.price / 100).toFixed(0)}</span>
                   <StatusBadge status={order.status} />
                </div>

              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20",
    in_progress: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
    delivered: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20",
    completed: "bg-green-500/10 text-green-600 hover:bg-green-500/20",
    cancelled: "bg-red-500/10 text-red-600 hover:bg-red-500/20",
  };

  const icons = {
    pending: Clock,
    in_progress: Package,
    delivered: CheckCircle,
    completed: CheckCircle,
    cancelled: XCircle
  };

  const Icon = icons[status as keyof typeof icons] || Clock;
  const label = status.replace('_', ' ');

  return (
    <Badge variant="secondary" className={`capitalize px-3 py-1 gap-1.5 ${styles[status as keyof typeof styles] || ""}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </Badge>
  );
}
