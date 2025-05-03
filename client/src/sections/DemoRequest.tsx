import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
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
import { Card } from "@/components/ui/card";

const formSchema = z.object({
  firstName: z.string().min(1, { message: "Nome é obrigatório" }),
  lastName: z.string().min(1, { message: "Sobrenome é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  company: z.string().min(1, { message: "Nome da empresa é obrigatório" }),
  interest: z.string().min(1, { message: "Selecione uma opção" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function DemoRequest() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, navigate] = useLocation();
  
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
          title: "Solicitação Enviada!",
          description: "Entraremos em contato em breve para agendar sua demonstração.",
          variant: "default",
        });
        
        form.reset();
        
        // Redirect to journey after successful form submission
        setTimeout(() => {
          // Choose journey based on interest
          let journeyType = "default";
          switch(data.interest) {
            case "ai": journeyType = "optimization"; break;
            case "wellness": journeyType = "wellness"; break;
            case "sustainability": journeyType = "sustainability"; break;
            case "blockchain": journeyType = "blockchain"; break;
          }
          
          navigate(`/journey/${journeyType}`);
        }, 1500);
      } else {
        throw new Error("Falha ao enviar formulário");
      }
    } catch (error) {
      toast({
        title: "Erro no Envio",
        description: "Ocorreu um erro ao enviar sua solicitação. Por favor, tente novamente.",
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
          <h2 className="text-3xl font-bold mb-6">Pronto para Transformar suas Viagens Corporativas?</h2>
          <p className="text-lg opacity-90 mb-8">
            Junte-se a centenas de empresas visionárias que revolucionaram sua abordagem de viagens corporativas com a plataforma inovadora TourChain.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <Card className="bg-blue-600 border-blue-500 text-white p-6 hover:bg-blue-700 transition-colors cursor-pointer"
                  onClick={() => navigate("/journey/wellness")}>
              <div className="mb-4 text-3xl">
                <i className="ri-mental-health-line"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Jornada de Bem-Estar</h3>
              <p className="text-sm">Descubra como melhorar a qualidade de vida dos seus viajantes</p>
            </Card>
            
            <Card className="bg-green-600 border-green-500 text-white p-6 hover:bg-green-700 transition-colors cursor-pointer"
                  onClick={() => navigate("/journey/sustainability")}>
              <div className="mb-4 text-3xl">
                <i className="ri-plant-line"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Jornada de Sustentabilidade</h3>
              <p className="text-sm">Veja como nossa solução ajuda a reduzir a pegada de carbono</p>
            </Card>
            
            <Card className="bg-amber-600 border-amber-500 text-white p-6 hover:bg-amber-700 transition-colors cursor-pointer"
                  onClick={() => navigate("/journey/optimization")}>
              <div className="mb-4 text-3xl">
                <i className="ri-funds-line"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Jornada de Economia</h3>
              <p className="text-sm">Conheça nossa IA para redução de custos em até 30%</p>
            </Card>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-primary text-2xl font-bold mb-6">Solicite uma Demonstração Personalizada</h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-700">Nome</FormLabel>
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
                      <FormLabel className="text-neutral-700">Sobrenome</FormLabel>
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
                      <FormLabel className="text-neutral-700">Email Corporativo</FormLabel>
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
                      <FormLabel className="text-neutral-700">Empresa</FormLabel>
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
                      <FormLabel className="text-neutral-700">O que mais lhe interessa?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full px-4 py-2 border border-neutral-300">
                            <SelectValue placeholder="Selecione uma opção" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="complete">Plataforma TourChain Completa</SelectItem>
                          <SelectItem value="ai">Otimização de Custos com IA</SelectItem>
                          <SelectItem value="wellness">Programa de Bem-Estar</SelectItem>
                          <SelectItem value="sustainability">Iniciativas de Sustentabilidade</SelectItem>
                          <SelectItem value="blockchain">Tecnologia Blockchain</SelectItem>
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
                    {isSubmitting ? "Enviando..." : "Agendar Minha Demonstração"}
                  </Button>
                  <p className="text-xs text-neutral-500 mt-2">
                    Ao enviar este formulário, você concorda com nossa <a href="#" className="underline">política de privacidade</a>.
                  </p>
                </div>
              </form>
            </Form>
          </div>
          
          <div className="mt-12">
            <Button 
              onClick={() => navigate("/crowdfunding")}
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white hover:text-primary"
            >
              Apoiar o Projeto
            </Button>
            <p className="text-sm mt-2 opacity-80">
              Contribua diretamente para o desenvolvimento do TourChain
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
