import apiClient from "@/api/request";
import { buttonVariants } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Client, Document, Expense, Trip, Vehicle } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Logs } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logables = [
  "client",
  "document",
  "expense",
  "trip",
  "user",
  "vehicle",
  "weighbridge",
  "salary",
] as const;

const getDataLabelByType = (data: any, type: (typeof logables)[number]) => {
  switch (type) {
    case "client":
      return (data as Client).name;
    case "document":
      return (data as Document).documentType;
    case "expense":
      return (data as Expense).category;
    case "trip":
      return `${(data as Trip).departure} -> ${(data as Trip).arrival} (${
        (data as Trip).lvNumber||''
      })`;
    case "user":
      return data.name;
    case "vehicle":
      return (data as Vehicle).model + " | " + (data as Vehicle).brand;
  }
};

const pathsToLogables: Record<string, (typeof logables)[number]> = {
  "/": "trip",
  "/trips": "trip",
  "/expenses": "expense",
  "/salaries": "salary",
  "/users": "user",
  "/vehicles": "vehicle",
  "/clients": "client",
  "/drivers-trips": "user",
};

export const LogsPopover = () => {
  const pathname = useLocation().pathname;
  const logable = pathsToLogables[pathname];
  const [open, setOpen] = useState(false);
  const logsQuery = useQuery({
    queryKey: ["logs", logable],
    enabled: !!logable && open,
    queryFn: () =>
      apiClient.get<any[]>(
        `/logs?model=${logable}&startingDate=2024-02-01&endingDate=2025-09-01`
      ),
  });
  if (!logable) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <div className={buttonVariants({ variant: "outline", size: "icon" })}>
          <Logs />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto md:w-[30vw] h-[90vh] p-3" align="start">
        <div className="h-full flex flex-col gap-3 rounded bg-foreground/10 overflow-y-auto p-3">
          {logsQuery.isLoading && <p>Chargement...</p>}
          {logsQuery.data?.length === 0 && (
            <p className="text-center">Aucun log</p>
          )}
          {logsQuery.data?.map((log) => (
            <div className=" flex items-start justify-between gap-3 bg-background rounded p-3">
              <div className="flex flex-col gap-1 flex-auto">
                <span className="text-sm font-semibold text-red-500">
                  Suppression de
                </span>
                <span className="text-xs font-semibold">
                  {getDataLabelByType(log, logable)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {format(new Date(log.deletedAt), "dd/MM/yyyy HH:mm")}
              </span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
