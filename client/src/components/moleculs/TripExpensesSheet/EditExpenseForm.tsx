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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Weighbridge } from "@/types";
import { PaginatedResponse } from "@/types/api";
import { expenseCategories, expenseCategoriesFrText } from "@/utils/vehicles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { EditWeighbridge } from "./EditWeighbridge";

const expenseSchema = z.object({
  amount: z.coerce.number().min(1),
  description: z.string().optional(),
  tripId: z.string().uuid(),
  weighbridgeId: z.string().optional().nullable(),
  category: z.enum(expenseCategories).default("FUEL"),
});

const updateExpenseSchema = expenseSchema.partial();
export type ExpensePayload = z.infer<typeof updateExpenseSchema>;

interface IProps {
  payload?: ExpensePayload & { id?: string };
}
export const EditExpenseForm = ({ payload }: IProps) => {
  const id = payload?.id;
  const form = useForm({
    resolver: zodResolver(!!id ? updateExpenseSchema : expenseSchema),
    defaultValues: {
      amount: payload?.amount,
      description: payload?.description || undefined,
      tripId: payload?.tripId,
      category: payload?.category,
      weighbridgeId: payload?.weighbridgeId,
    },
    values: {
      amount: payload?.amount,
      description: payload?.description || undefined,
      tripId: payload?.tripId,
      category: payload?.category,
      weighbridgeId: payload?.weighbridgeId,
    },
  });
  const weighbridgesQuery = useQuery({
    queryKey: ["weighbridges", "all"],
    queryFn: () =>
      apiClient
        .get<PaginatedResponse<Weighbridge>>(`/weighbridges?limit=-1`)
        .then((res) => res.data),
  });
  const client = useQueryClient();
  const selectecCategory = form.watch("category");
  const mutation = useMutation({
    mutationFn: (data: ExpensePayload) => {
      if (!!id) return apiClient.patch(`/expenses/${id}`, data);
      return apiClient.post("/expenses", data);
    },
    onSuccess: async () => {
      form.reset();
      await client.invalidateQueries({ queryKey: ["expenses"] });
      await client.invalidateQueries({ queryKey: ["trips"] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/expenses/${id}`),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["expenses"] });
      await client.invalidateQueries({ queryKey: ["trips"] });
    },
  });
  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selectionner un type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {expenseCategoriesFrText[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {selectecCategory === "WEIGHBRIDGE" && (
            <div className="flex items-center gap-3">
              <FormField
                control={form.control}
                name="weighbridgeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pont bascule</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selectionner un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {weighbridgesQuery.data?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-5">
                <FormLabel> </FormLabel>
                <EditWeighbridge />
              </div>
            </div>
          )}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center gap-3">
            {!!id && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => deleteMutation.mutate(id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "En cours..." : "Supprimer"}
              </Button>
            )}
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "En cours..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
