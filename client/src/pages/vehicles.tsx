import apiClient from "@/api/request";
import { IsAdmin } from "@/components/moleculs/casl";
import { DocumentsAlert } from "@/components/moleculs/DocumentsAlert";
import { EditVehicle } from "@/components/moleculs/EditVehicle";
import { VehicleDocuments } from "@/components/moleculs/VehicleDocuments";
import { VehicleSkeleton } from "@/components/moleculs/VehicleSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ID, Vehicle } from "@/types";
import { PaginatedResponse } from "@/types/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertTriangleIcon,
  ArrowLeft,
  ArrowRight,
  CarIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";

const typeToFreeText = {
  LOG_TRUCK: "Camion à grumes",
  FLATBED: "Camion plat",
};
export function VehiclesPage() {
  const [page, setPage] = useState(1);

  const fetchPage = (page: number) => {
    return apiClient.get<PaginatedResponse<Vehicle>>(
      `/vehicles?page=${page}&limit=10`
    );
  };
  const vehiclesQuery = useQuery({
    queryKey: ["vehicles", page],
    queryFn: () => fetchPage(page),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: ID) => {
      return apiClient.delete(`/vehicles/${id}`);
    },
    onSuccess: () => {
      vehiclesQuery.refetch();
    },
  });

  const totalPages = Math.ceil((vehiclesQuery.data?.meta.total ?? 0) / 10);

  const hasExpiringDocuments = (vehicle: Vehicle, days: number) => {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);
    return (
      (
        vehicle.documents?.filter(
          (doc) =>
            new Date(doc.expiryDate) >= now &&
            new Date(doc.expiryDate) <= future
        ) || []
      ).length > 0
    );
  };

  const hasExpiredDocuments = (vehicle: Vehicle) => {
    return vehicle.documents.some(
      (doc) => doc.expiryDate && new Date(doc.expiryDate) < new Date()
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Véhicules</h1>
          <p className="text-muted-foreground">
            Gérez votre flotte de véhicules
          </p>
        </div>
        <IsAdmin>
          <EditVehicle />
        </IsAdmin>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-lg border bg-card shadow-sm col-span-2">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Aperçu de la flotte</h2>
          </div>
          <div className="divide-y">
            {vehiclesQuery.isLoading && (
              <div className="">
                {Array.from({ length: 10 }).map((_, i) => (
                  <VehicleSkeleton key={i} />
                ))}
              </div>
            )}
            {vehiclesQuery.data?.data?.map((vehicle) => (
              <div key={vehicle.id} className="p-4">
                <div className="flex flex-col md:flex-row items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <CarIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {vehicle.tractorPlateNumber}
                        </h3>
                        {hasExpiringDocuments(vehicle, 30) && (
                          <div title="Documents expirant bientôt">
                            <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />
                          </div>
                        )}
                        {hasExpiredDocuments(vehicle) && (
                          <div title="Documents expirés">
                            <AlertTriangleIcon className="h-4 w-4 text-red-500" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.model} | {vehicle.brand}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge
                          variant={
                            vehicle.type === "FLATBED" ? "outline" : "default"
                          }
                        >
                          {typeToFreeText[vehicle.type]}
                        </Badge>
                        <span className="text-xs">
                          {vehicle.documents.length} pièce(s)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <VehicleDocuments vehicle={vehicle} />
                    <IsAdmin>
                      <EditVehicle payload={vehicle} />
                      <Button
                        size={"icon"}
                        variant="destructive"
                        onClick={() => {
                          if (
                            confirm(
                              "Voulez-vous vraiment supprimer ce véhicule ?"
                            )
                          )
                            deleteMutation.mutate(vehicle.id);
                        }}
                      >
                        <TrashIcon />
                      </Button>
                    </IsAdmin>
                  </div>
                </div>
              </div>
            ))}

            {vehiclesQuery.data?.data.length === 0 && (
              <div className="p-8 text-center">
                <CarIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-2 text-lg font-medium">
                  Aucun véhicule trouvé
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ajoutez un nouveau véhicule à votre flotte.
                </p>
                <Button className="mt-4">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Ajouter un véhicule
                </Button>
              </div>
            )}
          </div>
          <div className="flex justify-center gap-3 py-3 items-center pt-4">
            <span>{vehiclesQuery.data?.meta.total} véhicules</span>
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
        <DocumentsAlert />
      </div>
    </div>
  );
}
