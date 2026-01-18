import { Navbar } from "@/components/Navbar";
import { useOrder, useSendMessage, useUpdateOrderStatus } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { useParams } from "wouter";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Send, CheckCircle, Package } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function OrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: order, isLoading } = useOrder(Number(id));
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();
  
  const [messageInput, setMessageInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [order?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !order) return;
    sendMessage({ orderId: order.id, content: messageInput });
    setMessageInput("");
  };

  const isSeller = order?.gig?.sellerId === user?.id;

  if (isLoading || !order) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col h-screen">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-80px)]">
        
        {/* Left: Order Info */}
        <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2">
          <Card className="p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-bold text-xl">Order #{order.id}</h2>
              <Badge variant="outline" className="uppercase">{order.status.replace('_', ' ')}</Badge>
            </div>
            
            <div className="flex gap-4 mb-6 p-4 bg-secondary/30 rounded-xl">
              <img src={order.gig.coverImage} className="w-16 h-16 rounded-lg object-cover" />
              <div>
                <h3 className="font-semibold line-clamp-1">{order.gig.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">Price: ${(order.price / 100).toFixed(2)}</p>
              </div>
            </div>

            {isSeller && (
               <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
                 <h4 className="font-semibold text-sm mb-2 text-primary">Manage Order</h4>
                 <Select 
                   defaultValue={order.status} 
                   onValueChange={(val: any) => updateStatus({ id: order.id, status: val })}
                   disabled={isUpdating}
                 >
                   <SelectTrigger className="w-full bg-background">
                     <SelectValue placeholder="Status" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="pending">Pending</SelectItem>
                     <SelectItem value="in_progress">In Progress</SelectItem>
                     <SelectItem value="delivered">Delivered</SelectItem>
                     <SelectItem value="completed">Completed</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
            )}

            <div className="space-y-4 text-sm">
               <div className="flex justify-between">
                 <span className="text-muted-foreground">Order Date</span>
                 <span className="font-medium">{order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy') : 'N/A'}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-muted-foreground">Buyer</span>
                 <span className="font-medium">{order.buyerId === user?.id ? "You" : "Client"}</span>
               </div>
               {order.requirements && (
                 <div className="pt-4 border-t border-border">
                   <p className="text-muted-foreground mb-1">Requirements:</p>
                   <p className="bg-secondary/20 p-3 rounded-lg">{order.requirements}</p>
                 </div>
               )}
            </div>
          </Card>
        </div>

        {/* Right: Chat */}
        <div className="lg:col-span-8 flex flex-col bg-card border border-border rounded-2xl shadow-sm overflow-hidden h-[600px] lg:h-auto">
          <div className="p-4 border-b border-border bg-secondary/10 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
               Messages
            </h3>
          </div>

          <ScrollArea className="flex-grow p-4 bg-secondary/5">
             <div className="space-y-6">
                {order.messages?.length === 0 && (
                   <div className="text-center text-muted-foreground py-10">
                     No messages yet. Start the conversation!
                   </div>
                )}
                
                {order.messages?.map((msg: any) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="w-8 h-8 mt-1">
                        <AvatarFallback>{isMe ? 'Me' : 'U'}</AvatarFallback>
                      </Avatar>
                      <div className={`max-w-[70%] rounded-2xl p-4 text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-secondary text-foreground rounded-tl-none'}`}>
                        {msg.content}
                        <div className={`text-[10px] mt-1 opacity-70 text-right`}>
                          {msg.createdAt ? format(new Date(msg.createdAt), 'h:mm a') : 'N/A'}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
             </div>
          </ScrollArea>

          <div className="p-4 bg-background border-t border-border">
            <form onSubmit={handleSend} className="flex gap-2">
               <input
                 className="flex-grow rounded-xl border border-border bg-secondary/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                 placeholder="Type your message..."
                 value={messageInput}
                 onChange={(e) => setMessageInput(e.target.value)}
                 disabled={isSending}
               />
               <Button type="submit" size="icon" className="rounded-xl h-auto w-12 bg-primary hover:bg-primary/90 shadow-md" disabled={isSending}>
                 <Send className="w-4 h-4" />
               </Button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
