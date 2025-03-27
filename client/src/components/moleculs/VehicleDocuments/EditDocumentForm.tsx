import apiClient from "@/api/request";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
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
import { useAuthStore } from "@/store";
import { Document } from "@/types";
import { docsTypesFrechText } from "@/utils/vehicles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { IsAdmin } from "../casl";

const docSchema = z.object({
  //   issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  //     message: "La date d'obtention doit être au format YYYY-MM-DD",
  //   }),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "La date d'expiration doit être au format YYYY-MM-DD",
  }),
  vehicleId: z.string(),
  documentType: z.enum([
    "ACF",
    "BLUE_CARD",
    "INSURANCE",
    "LICENSE",
    "TECHNICAL_VISIT",
    "GRAY_CARD",
  ]),
  status: z.enum(["VALID", "INVALID"]).default("VALID"),
});

interface IProps {
  data: Partial<Document> & {
    documentType: Document["documentType"];
    vehicleId: string;
  };
}
export const EditDocumentForm = ({ data }: IProps) => {
  const form = useForm<z.infer<typeof docSchema>>({
    defaultValues: {
      ...data,
      //   issueDate: data.issueDate ? data.issueDate.split("T")[0] : "",
      expiryDate: data.expiryDate ? data.expiryDate.split("T")[0] : "",
      status: data.status || "VALID",
    },
    resolver: zodResolver(docSchema),
  });
  const expiryDate = form.watch("expiryDate");
  useEffect(() => {
    if (expiryDate) {
      const expiryDateObj = new Date(expiryDate);
      const currentDate = new Date();
      if (expiryDateObj < currentDate) {
        form.setError("expiryDate", {
          type: "manual",
          message: "La date d'expiration est dépassée. Veuillez la modifier.",
        });
      }
    }
  }, [expiryDate, form]);
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (payload: z.infer<typeof docSchema>) => {
      if (!data.id) {
        return apiClient.post<Document>("/documents", payload);
      }
      return apiClient.patch<Document>(`/documents/${data.id}`, payload);
    },
    onSuccess: () => {
      client.refetchQueries({ queryKey: ["vehicles"] });
      client.refetchQueries({ queryKey: ["documents"] });
      toast.success(data.id ? "Document modifié" : "Document créé");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiClient.delete(`/documents/${data.id}`);
    },
    onSuccess: () => {
      client.refetchQueries({ queryKey: ["vehicles"] });
      client.refetchQueries({ queryKey: ["documents"] });
      toast.success("Document supprimé");
    },
  });
  const { isAdmin } = useAuthStore();
  return (
    <Card className="p-3">
      <CardTitle className="uppercase">
        {docsTypesFrechText[data.documentType]}
      </CardTitle>
      <Form {...form}>
        <form
          onSubmit={
            isAdmin()
              ? form.handleSubmit((data) => mutation.mutate(data))
              : form.handleSubmit(() => {
                  toast.error(
                    "Vous n'avez pas les droits pour modifier ce document"
                  );
                })
          }
          className="space-y-4"
        >
          {/* <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date d'obtension</FormLabel>
                <Input type="date" {...field} />
                <FormMessage />
              </FormItem>
            )}
          /> */}
          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date d'expiration</FormLabel>
                <Input type="date" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue className="min-w-full" placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VALID">Valide</SelectItem>
                    <SelectItem value="INVALID">Invalide</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center gap-3">
            <IsAdmin>
              {data.id && (
                <Button
                  disabled={deleteMutation.isPending}
                  variant="destructive"
                  type="button"
                  onClick={() => deleteMutation.mutate()}
                >
                  {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
                </Button>
              )}
              <Button disabled={mutation.isPending} type="submit">
                {mutation.isPending ? "En cours..." : "Enregistrer"}
              </Button>
            </IsAdmin>
          </div>
        </form>
      </Form>
    </Card>
  );
};
