import apiClient from "@/api/request";
import { EditClient } from "@/components/moleculs/EditClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Client } from "@/types";
import { PaginatedResponse } from "@/types/api";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

export function ClientsPage() {
  const [page, setPage] = useState(1);

  const fetchPage = (page: number) => {
    return apiClient.get<PaginatedResponse<Client>>(
      `/clients?page=${page}&limit=10`
    );
  };
  const clientsQuery = useQuery({
    queryKey: ["clients", page],
    queryFn: () => fetchPage(page),
  });

  const totalPages = Math.ceil((clientsQuery.data?.meta.total ?? 0) / 10);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl">Liste des clients</h1>
        <EditClient />
      </div>
      <Table>
        <TableHeader>
          <TableHead>Nom</TableHead>
          <TableHead>Adresse</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Nombre de livraisons</TableHead>
          <TableHead>Modifier</TableHead>
        </TableHeader>
        <TableBody>
          {clientsQuery.data?.data.map((client) => (
            <TableRow key={client.id}>
              <TableCell>{client.name}</TableCell>
              <TableCell>{client.address}</TableCell>
              <TableCell>{client.contact}</TableCell>
              <TableCell>
                <Badge>{client.trips.length}</Badge>
              </TableCell>
              <TableCell>
                <EditClient payload={client} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-center gap-3 py-3 items-center pt-4">
        <span>{clientsQuery.data?.meta.total} utilisateurs</span>
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
