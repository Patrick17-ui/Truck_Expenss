import apiClient from "@/api/request";
import { EditUser } from "@/components/moleculs/EditUser";
import { IsAdmin } from "@/components/moleculs/casl";
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
import { User } from "@/types";
import { PaginatedResponse } from "@/types/api";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

export function UsersPage() {
  const [page, setPage] = useState(1);

  const fetchPage = (page: number) => {
    return apiClient.get<PaginatedResponse<User>>(
      `/users?page=${page}&limit=10`
    );
  };
  const usersQuery = useQuery({
    queryKey: ["users", page],
    queryFn: () => fetchPage(page),
  });

  const totalPages = Math.ceil((usersQuery.data?.meta.total ?? 0) / 10);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl">Liste du personnel</h1>
        <IsAdmin>
          <EditUser />
        </IsAdmin>
      </div>
      <Table>
        <TableHeader>
          <TableHead>Nom</TableHead>
          <TableHead>Matricul</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <IsAdmin>
            <TableHead>Modifier</TableHead>
          </IsAdmin>
        </TableHeader>
        <TableBody>
          {usersQuery.data?.data.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.matricule}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge>{user.role}</Badge>
              </TableCell>
              <IsAdmin>
                <TableCell>
                  <EditUser payload={user} />
                </TableCell>
              </IsAdmin>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-center gap-3 py-3 items-center pt-4">
        <span>{usersQuery.data?.meta.total} utilisateurs</span>
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
