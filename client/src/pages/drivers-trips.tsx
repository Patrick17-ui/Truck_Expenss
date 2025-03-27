import apiClient from "@/api/request";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Trip, User } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const filterQuerySchema = z.object({
  startingDate: z.coerce.date().optional(),
  endingDate: z.coerce.date().optional(),
});
type FilterQuerySchema = z.infer<typeof filterQuerySchema>;

export function DriversTripsPage() {
  const today = new Date();
  const lastMonth = subMonths(today, 1);

  const [filtersQuery, setFiltersQuery] = useState<FilterQuerySchema>({
    startingDate: lastMonth,
    endingDate: today,
  });
  const usersQuery = useQuery({
    queryKey: ["drivers-trips", filtersQuery],
    enabled: !!filtersQuery.startingDate && !!filtersQuery.endingDate,
    queryFn: () =>
      apiClient.get<
        (User & {
          trips: Trip[];
        })[]
      >(
        `/users/drivers-trips?startingDate=${filtersQuery.startingDate}&endingDate=${filtersQuery.endingDate}`
      ),
  });

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setFiltersQuery((prev) => ({ ...prev, startingDate: date }));
    } else {
      const { startingDate, ...rest } = filtersQuery;
      setFiltersQuery(rest);
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      setFiltersQuery((prev) => ({ ...prev, endingDate: date }));
    } else {
      const { endingDate, ...rest } = filtersQuery;
      setFiltersQuery(rest);
    }
  };

  const clearFilters = () => {
    setFiltersQuery({});
  };

  const hasFilters = Object.keys(filtersQuery).length > 0;

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl">Classement des chauffeurs</h1>
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-4">
        <Popover>
          <PopoverTrigger>
            <div className={buttonVariants({ variant: "outline" })}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filtersQuery.startingDate
                ? format(filtersQuery.startingDate, "dd MMMM yyyy", {
                    locale: fr,
                  })
                : "Date de début"}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filtersQuery.startingDate}
              onSelect={handleStartDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger>
            <div className={buttonVariants({ variant: "outline" })}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filtersQuery.endingDate
                ? format(filtersQuery.endingDate, "dd MMMM yyyy", {
                    locale: fr,
                  })
                : "Date de fin"}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filtersQuery.endingDate}
              onSelect={handleEndDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9"
          >
            <X className="h-4 w-4 mr-1" />
            Effacer les filtres
          </Button>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableHead>Nom</TableHead>
          <TableHead>Matricul</TableHead>
          <TableHead>Nbr de courses</TableHead>
          <TableHead>Nbr de navettes</TableHead>
          <TableHead>Nbr de longue distances</TableHead>
        </TableHeader>
        <TableBody>
          {usersQuery.data?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.matricule}</TableCell>
              <TableCell>{user.trips.length}</TableCell>
              <TableCell>
                {user.trips.filter((t) => t.tripType === "SHUTTLE").length}
              </TableCell>
              <TableCell>
                {
                  user.trips.filter((t) => t.tripType === "LONG_DISTANCE")
                    .length
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
