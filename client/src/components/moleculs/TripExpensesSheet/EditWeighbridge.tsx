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
import { Weighbridge } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createWeighbridgeSchema = z.object({
  name: z.string().min(3),
});

const updateWeighbridgeSchema = createWeighbridgeSchema.partial();

interface EditWeighbridgeProps {
  payload?: Partial<Weighbridge>;
}
export const EditWeighbridge = ({ payload }: EditWeighbridgeProps) => {
  const id = payload?.id;

  const form = useForm<z.infer<typeof updateWeighbridgeSchema>>({
    resolver: zodResolver(
      !!id ? updateWeighbridgeSchema : createWeighbridgeSchema
    ),
    defaultValues: {
      name: payload?.name,
    },
  });

  const [open, setOpen] = useState(false);

  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof updateWeighbridgeSchema>) => {
      if (!!id) {
        return apiClient.patch(`/weighbridges/${id}`, data);
      }
      return apiClient.post(`/weighbridges`, data);
    },
    onSuccess: () => {
      toast.success("Operation reussie");
      form.reset();
      client.invalidateQueries({
        queryKey: ["weighbridges"],
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
        <Button variant="outline" type="button" size={"sm"}>
          {!!id ? "Modifier" : "Créer"}
        </Button>
      </SheetTrigger>
      <SheetContent className="px-3 h-[100vh] overflow-y-auto pb-8">
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.stopPropagation();
              return form.handleSubmit((data) => mutation.mutate(data))(e);
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
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "En cours..." : "Enregistrer"}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
