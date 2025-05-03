import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  company: z.string().min(1, { message: "Company name is required" }),
  interest: z.string().min(1, { message: "Please select an interest" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function DemoRequest() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      interest: "",
    }
  });
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", "/api/demo-request", data);
      
      if (response.ok) {
        toast({
          title: "Request Submitted!",
          description: "We'll be in touch with you shortly to schedule your demo.",
          variant: "default",
        });
        
        form.reset();
      } else {
        throw new Error("Failed to submit form");
      }
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="demo" className="py-20 bg-primary text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Corporate Travel Experience?</h2>
          <p className="text-lg opacity-90 mb-8">
            Join hundreds of forward-thinking companies that have revolutionized their approach to business travel with TourChain's innovative platform.
          </p>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-primary text-2xl font-bold mb-6">Request a Personalized Demo</h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-700">First Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="w-full px-4 py-2 border border-neutral-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-700">Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="w-full px-4 py-2 border border-neutral-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-700">Business Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" className="w-full px-4 py-2 border border-neutral-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-700">Company</FormLabel>
                      <FormControl>
                        <Input {...field} className="w-full px-4 py-2 border border-neutral-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="interest"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-neutral-700">What interests you most?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full px-4 py-2 border border-neutral-300">
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="complete">Complete TourChain Platform</SelectItem>
                          <SelectItem value="ai">AI Cost Optimization</SelectItem>
                          <SelectItem value="wellness">Wellness Program</SelectItem>
                          <SelectItem value="sustainability">Sustainability Initiatives</SelectItem>
                          <SelectItem value="safety">International Travel Safety</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="md:col-span-2">
                  <Button 
                    type="submit" 
                    className="w-full py-3 px-4 bg-primary text-white rounded-md hover:bg-primary-dark transition"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Schedule My Demo"}
                  </Button>
                  <p className="text-xs text-neutral-500 mt-2">
                    By submitting this form, you agree to our <a href="#" className="underline">privacy policy</a>.
                  </p>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
