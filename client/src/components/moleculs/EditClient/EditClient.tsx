import apiClient from "@/api/request";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Client } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createClientSchema = z.object({
  name: z.string().min(3),
  contact: z.string().optional(),
  address: z.string().optional(),
});

const updateClientSchema = createClientSchema.partial();

interface EditClientProps {
  payload?: Partial<Client>;
}
export const EditClient = ({ payload }: EditClientProps) => {
  const id = payload?.id;

  const form = useForm<z.infer<typeof updateClientSchema>>({
    resolver: zodResolver(!!id ? updateClientSchema : createClientSchema),
    defaultValues: {
      name: payload?.name,
      contact: payload?.contact,
      address: payload?.address,
    },
  });

  console.log(form.formState.errors);
  const [open, setOpen] = useState(false);

  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof updateClientSchema>) => {
      if (!!id) {
        return apiClient.patch(`/clients/${id}`, data);
      }
      return apiClient.post(`/clients`, data);
    },
    onSuccess: () => {
      toast.success("Operation reussie");
      form.reset();
      client.invalidateQueries({
        queryKey: ["clients"],
      });
      setOpen(false);
    },
    onError: (error: any) => {
      if (error.status === 422) {
        toast.error(error.errors.message);
        return;
      }
      toast.error("Une erreur est survenue");
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" type="button">
          {!!id ? "Modifier" : "Créer un client"}
        </Button>
      </SheetTrigger>
      <SheetContent className="px-3 h-[100vh] overflow-y-auto pb-8">
        <Form {...form}>
          <form
            onSubmit={(e)=>{
              e.stopPropagation()
              form.handleSubmit((data) => mutation.mutate(data))(e)
            }}
            className="space-y-8"
          >
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "En cours..." : "Enregistrer"}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
