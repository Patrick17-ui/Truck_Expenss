import apiClient from "@/api/request";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Expense, Trip } from "@/types";
import { PaginatedResponse } from "@/types/api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { EditExpenseForm } from "./EditExpenseForm";

interface IProps {
  trip: Trip;
  trigger?: React.ReactNode;
}
export const TripExpensesSheet = ({ trip, trigger }: IProps) => {
  const [open, setOpen] = useState(false);
  const expensesQuery = useQuery({
    queryKey: ["expenses", trip.id],
    enabled: open,
    queryFn: () =>
      apiClient
        .get<PaginatedResponse<Expense>>(`/expenses?limit=-1&trip=${trip.id}`)
        .then((res) => res.data),
  });
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger??<Button size={"sm"}>Details</Button>}
      </SheetTrigger>
      <SheetContent className="min-w-[95vw]">
        <SheetHeader>
          <SheetTitle>
            Details ({trip.departure} - {trip.arrival})
          </SheetTitle>
          <div className="flex flex-col gap-1">
            <small>LV: {trip.lvNumber}</small>
            <small>Chauffeur: {trip.driver?.name}</small>
            <small>Client: {trip.client?.name}</small>
            <small>
              Total:{" "}
              <strong>
                {expensesQuery.data
                  ?.reduce((acc, expense) => {
                    return acc + Number(expense.amount);
                  }, 0)
                  .toLocaleString("fr-FR")}{" "}
                FCFA
              </strong>
            </small>
          </div>
        </SheetHeader>
        <div className="px-3 gap-2 grid grid-cols-1 md:grid-cols-4">
          <div className="bg-foreground/30 p-3 col-span-3 h-[85vh] pb-12 grid grid-cols-1 md:grid-cols-3 gap-3 py-3 overflow-y-auto">
            {expensesQuery.isLoading && <p>Chargement...</p>}
            {expensesQuery.data?.map((expense) => (
              <Card className="p-3 space-y-3" key={expense.id}>
                <EditExpenseForm
                  payload={{ ...expense, tripId: trip.id }}
                  key={expense.id}
                />
              </Card>
            ))}
          </div>
          <Card className="p-3">
            <h4 className="font-bold">Nouvelle depense</h4>
            <EditExpenseForm payload={{ tripId: trip.id }} />
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
