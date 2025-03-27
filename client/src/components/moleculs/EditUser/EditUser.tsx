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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  matricule: z.string().min(3),
  role: z.enum(["ADMIN", "USER", "DRIVER"]).default("DRIVER"),
  password: z.string().min(8),
});

const updateUserSchema = createUserSchema.partial();

interface EditUserProps {
  payload?: Partial<User>;
}
export const EditUser = ({ payload }: EditUserProps) => {
  const id = payload?.id;

  const form = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(!!id ? updateUserSchema : createUserSchema),
    defaultValues: {
      name: payload?.name,
      email: payload?.email,
      matricule: payload?.matricule,
      role: payload?.role || "USER",
    },
  });

  console.log(form.formState.errors);
  const [open, setOpen] = useState(false);

  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof updateUserSchema>) => {
      if (!!id) {
        return apiClient.patch(`/users/${id}`, data);
      }
      return apiClient.post(`/auth/register`, data);
    },
    onSuccess: () => {
      toast.success("Operation reussie");
      form.reset();
      client.invalidateQueries({
        queryKey: ["users"],
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
        <Button variant="outline">
          {!!id ? "Modifier" : "Créer un utilisateur"}
        </Button>
      </SheetTrigger>
      <SheetContent className="px-3 h-[100vh] overflow-y-auto pb-8">
        <SheetHeader>
          <SheetTitle>
            {!!id ? "Modifier un utilisateur" : "Créer un utilisateur"}
          </SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue  placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrateur</SelectItem>
                      <SelectItem value="USER">Utilisateur</SelectItem>
                      <SelectItem value="DRIVER">Chauffeur</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="matricule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matricule</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
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
