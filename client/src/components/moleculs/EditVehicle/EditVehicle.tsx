import apiClient from "@/api/request";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Vehicle } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface EditVehicleProps {
  payload?: Partial<Vehicle>;
}
export const EditVehicle = ({ payload }: EditVehicleProps) => {
  const id = payload?.id;
  const form = useForm({
    defaultValues: {
      model: payload?.model,
      status: payload?.status,
      brand: payload?.brand,
      type: payload?.type,
      trailerPlateNumber: payload?.trailerPlateNumber,
      tractorPlateNumber: payload?.tractorPlateNumber,
    },
  });
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => {
      if (!!id) return apiClient.patch(`/vehicles/${id}`, form.getValues());
      return apiClient.post("/vehicles", form.getValues());
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["vehicles"] });
      form.reset();
      setOpen(false);
    },
  });
  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger>
          <Button variant="outline">
            {!!id ? "Editer" : "Créer un véhicule"}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {!!id ? "Editer un véhicule" : "Créer un véhicule"}
            </SheetTitle>
          </SheetHeader>
          <div className="px-3 space-y-4 py-2 pb-4">
            <Form {...form}>
              <form
                className="space-y-8"
                onSubmit={form.handleSubmit(() => mutation.mutate())}
              >
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de véhicule</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Type de véhicule" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FLATBED">Camion</SelectItem>
                          <SelectItem value="LOG_TRUCK">
                            camion à grumes
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modèle</FormLabel>
                      <Input placeholder="Modèle" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marque</FormLabel>
                      <Input placeholder="Marque" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trailerPlateNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Immatriculation du remorque</FormLabel>
                      <Input  {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tractorPlateNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Immatriculation du tracteur</FormLabel>
                      <Input  {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button disabled={mutation.isPending} type="submit">
                  {mutation.isPending ? "En cours..." : "Enregistrer"}
                </Button>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
