import { Navbar } from "@/components/Navbar";
import { useCreateGig, useCategories } from "@/hooks/use-gigs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  price: z.coerce.number().min(5, "Minimum price is $5"),
  deliveryTime: z.coerce.number().min(1, "Minimum 1 day"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  coverImage: z.string().url("Must be a valid URL"),
});

export default function CreateGig() {
  const { mutate: createGig, isPending } = useCreateGig();
  const { data: categories } = useCategories();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      price: 5,
      deliveryTime: 3,
      description: "",
      coverImage: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createGig({
      ...values,
      categoryId: parseInt(values.categoryId),
      price: values.price * 100, // Convert to cents
      sellerId: "auto-filled-by-backend", // Backend handles this
    }, {
      onSuccess: () => setLocation('/dashboard')
    });
  };

  return (
    <div className="min-h-screen bg-secondary/10 pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-display font-bold mb-8 text-center">Create a New Gig</h1>
        
        <Card className="rounded-2xl shadow-sm border-border">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Gig Title</FormLabel>
                      <FormControl>
                        <Input placeholder="I will do something amazing..." className="h-12 text-lg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((cat: any) => (
                              <SelectItem key={cat.id} value={String(cat.id)}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deliveryTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Time (Days)</FormLabel>
                        <FormControl>
                          <Input type="number" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your service in detail..." 
                          className="min-h-[150px] resize-none p-4" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/25"
                  disabled={isPending}
                >
                  {isPending ? "Creating..." : "Publish Gig"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
