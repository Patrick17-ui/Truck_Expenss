/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import apiClient from "@/api/request";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Expense } from "@/types";
import type { PaginatedResponse } from "@/types/api";
import { expenseCategories, expenseCategoriesFrText } from "@/utils/vehicles";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, ArrowRight, CalendarIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

const expensesFilterQuerySchema = z.object({
  category: z.enum(expenseCategories).optional(),
  startingDate: z.coerce.date().optional(),
  endingDate: z.coerce.date().optional(),
});

export function ExpensesPage() {
  const [page, setPage] = useState(1);
  const [filtersQuery, setFiltersQuery] = useState<
    z.infer<typeof expensesFilterQuerySchema>
  >({});

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filtersQuery]);

  const fetchPage = (
    page: number,
    filters: z.infer<typeof expensesFilterQuerySchema>
  ) => {
    let url = `/expenses?page=${page}&limit=10`;

    if (filters.category) {
      url += `&category=${filters.category}`;
    }

    if (filters.startingDate) {
      url += `&startingDate=${filters.startingDate.toISOString()}`;
    }

    if (filters.endingDate) {
      url += `&endingDate=${filters.endingDate.toISOString()}`;
    }

    return apiClient.get<PaginatedResponse<Expense>>(url);
  };

  const expensesQuery = useQuery({
    queryKey: ["expenses", page, filtersQuery],
    queryFn: () => fetchPage(page, filtersQuery),
  });

  const totalPages = Math.ceil((expensesQuery.data?.meta.total ?? 0) / 10);

  const handleCategoryChange = (category: string) => {
    if (category === "all") {
      const { category, ...rest } = filtersQuery;
      setFiltersQuery(rest);
    } else {
      setFiltersQuery((prev) => ({
        ...prev,
        category: category as z.infer<
          typeof expensesFilterQuerySchema
        >["category"],
      }));
    }
  };

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
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-bold text-2xl">Liste des depenses</h1>
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-4">
        <Select
          value={filtersQuery.category || "all"}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Types</SelectLabel>
              <SelectItem value="all">Tous les types</SelectItem>
              {expenseCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {expenseCategoriesFrText[category]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

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

      {expensesQuery.isLoading ? (
        <div className="flex justify-center py-8">Chargement...</div>
      ) : expensesQuery.isError ? (
        <div className="flex justify-center py-8 text-red-500">
          Erreur lors du chargement des données
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Montant</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>LV</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expensesQuery.data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8">
                    Aucune dépense trouvée
                  </TableCell>
                </TableRow>
              ) : (
                expensesQuery.data?.data.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.amount}</TableCell>
                    <TableCell>
                      {expenseCategoriesFrText[expense.category]}
                    </TableCell>
                    <TableCell>{expense.trip?.lvNumber}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex justify-center gap-3 py-3 items-center pt-4">
            <span>{expensesQuery.data?.meta.total} dépenses</span>
            <Button
              disabled={page === 1}
              size="icon"
              variant="outline"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span>
              Page {page} sur {totalPages || 1}
            </span>
            <Button
              size="icon"
              variant="outline"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage((prev) => prev + 1)}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
