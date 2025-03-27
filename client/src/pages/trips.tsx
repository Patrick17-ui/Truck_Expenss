import apiClient from "@/api/request";
import { IsUser } from "@/components/moleculs/casl";
import { EditTrip, tripTypeFrText } from "@/components/moleculs/EditTrip";
import { TripExpensesSheet } from "@/components/moleculs/TripExpensesSheet";
import { TripInvoice } from "@/components/moleculs/TripInvoice";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ID, Trip } from "@/types";
import { PaginatedResponse } from "@/types/api";
import { expenseCategoriesFrText } from "@/utils/vehicles";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, EllipsisVertical, Trash2 } from "lucide-react";
import { useState } from "react";

export function TripsPage() {
  const [page, setPage] = useState(1);

  const fetchPage = (page: number) => {
    return apiClient.get<PaginatedResponse<Trip>>(
      `/trips?page=${page}&limit=10`
    );
  };
  const tripsQuery = useQuery({
    queryKey: ["trips", page],
    queryFn: () => fetchPage(page),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: ID) => {
      return apiClient.delete(`/trips/${id}`);
    },
    onSuccess: () => {
      tripsQuery.refetch();
    },
  });

  const totalPages = Math.ceil((tripsQuery.data?.meta.total ?? 0) / 10);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl">Liste des courses</h1>
        <IsUser>
          <EditTrip />
        </IsUser>
      </div>
      <Table>
        <TableHeader>
          <TableHead>Itineraire</TableHead>
          <TableHead>LV</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Chauffeur</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Total Depenses(XAF)</TableHead>
          <TableHead>Total Pont bascule(XAF)</TableHead>
          <TableHead>Date (Depart & Arrivee)</TableHead>
          <IsUser>
            <TableHead>Options</TableHead>
          </IsUser>
        </TableHeader>
        <TableBody>
          {tripsQuery.data?.data.map((trip) => {
            const totalExpenses = trip.expenses.reduce(
              (acc, expense) => acc + Number(expense.amount),
              0
            );
            const w = trip.expenses.filter((i) => i.category === "WEIGHBRIDGE");
            const d = trip.expenses.filter((i) => i.category !== "WEIGHBRIDGE");
            const weighbridges = w.reduce(
              (acc, expense) => acc + Number(expense.amount),
              0
            );
            return (
              <TableRow
                key={trip.id}
                className={trip.invoice && "bg-green-300"}
              >
                <TableCell>
                  <div>
                    <span className="font-bold text-xs">{trip.departure}</span>{" "}
                  </div>
                  vers
                  <div>
                    <span className="font-bold text-xs">{trip.arrival}</span>
                  </div>
                </TableCell>
                <TableCell>{trip.lvNumber}</TableCell>
                <TableCell>
                  <small>{tripTypeFrText[trip.tripType]}</small>
                </TableCell>
                <TableCell>{trip.driver?.name}</TableCell>
                <TableCell>{trip.client?.name}</TableCell>
                <TableCell className="font-bold text-xs">
                  <Tooltip>
                    <TooltipTrigger>
                      {totalExpenses.toLocaleString("fr-Fr")} FCFA
                    </TooltipTrigger>
                    <TooltipContent>
                      <ul>
                        {d.map((item) => (
                          <li key={item.id}>
                            {expenseCategoriesFrText[item.category]}:{" "}
                            {item.amount.toLocaleString("fr-Fr")} FCFA
                          </li>
                        ))}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="font-bold text-xs text-red-500">
                  <Tooltip>
                    <TooltipTrigger>
                      {weighbridges.toLocaleString("fr-Fr")} FCFA
                    </TooltipTrigger>
                    <TooltipContent>
                      <ul>
                        {w.map((item) => (
                          <li key={item.id}>
                            {item.weighbridge?.name}:{" "}
                            {item.amount.toLocaleString("fr-Fr")} FCFA
                          </li>
                        ))}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="text-xs">
                  <p>
                    {trip.startTime
                      ? format(trip.startTime, "dd/MM/yyyy hh:mm")
                      : undefined}
                  </p>
                  <p>
                    {trip.endTime
                      ? format(trip.endTime, "dd/MM/yyyy hh:mm")
                      : undefined}
                  </p>
                </TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger>
                      <div
                        className={buttonVariants({
                          variant: "ghost",
                          size: "icon",
                        })}
                      >
                        <EllipsisVertical />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="flex flex-col gap-2 p-2">
                        <TripExpensesSheet
                          trip={trip}
                          trigger={
                            <Button
                              className="w-full justify-start rounded-none"
                              size={"sm"}
                              variant="outline"
                            >
                              Details
                            </Button>
                          }
                        />
                        <TripInvoice
                          trip={trip}
                          trigger={
                            <Button
                              className="w-full justify-start rounded-none"
                              size={"sm"}
                              variant="outline"
                            >
                              Facture
                            </Button>
                          }
                        />
                        <EditTrip
                          payload={trip}
                          trigger={
                            <Button
                              className="w-full justify-start rounded-none"
                              size={"sm"}
                              variant="outline"
                            >
                              Modifer
                            </Button>
                          }
                        />
                        <Button
                          className="w-full justify-start rounded-none"
                          size={"sm"}
                          variant="outline"
                          onClick={() => {
                            if (
                              !confirm("Voulez-vous supprimer cette course ?")
                            )
                              return;

                            deleteMutation.mutate(trip.id);
                          }}
                        >
                          Supprimer{` `}
                          <Trash2 />
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="flex justify-center gap-3 py-3 items-center pt-4">
        <span>{tripsQuery.data?.meta.total} courses</span>
        <Button
          disabled={page === 1}
          size="icon"
          variant="outline"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        >
          <ArrowLeft />
        </Button>
        <span>
          Page {page} sur {totalPages}
        </span>
        <Button
          size="icon"
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
