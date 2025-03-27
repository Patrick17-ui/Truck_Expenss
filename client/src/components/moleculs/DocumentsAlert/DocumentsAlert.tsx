import apiClient from "@/api/request";
import { Document } from "@/types";
import { PaginatedResponse } from "@/types/api";
import { docsTypesFrechText } from "@/utils/vehicles";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangleIcon } from "lucide-react";

export const DocumentsAlert = () => {
  const documentsQuery = useQuery({
    queryKey: ["documents", "all"],
    queryFn: () =>
      apiClient
        .get<PaginatedResponse<Document>>("/documents?limit=-1")
        .then((res) => res.data),
  });

  const getExpiredDocuments = () => {
    return (
      documentsQuery.data?.filter(
        (doc) => new Date(doc.expiryDate) < new Date()
      ) || []
    );
  };

  const getExpiringDocuments = (days: number) => {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);
    return (
      documentsQuery.data?.filter(
        (doc) => new Date(doc.expiryDate) >= now && new Date(doc.expiryDate) <= future
      ) || []
    );
  };

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center">
        <AlertTriangleIcon className="mr-2 h-5 w-5 text-yellow-500" />
        <h2 className="text-lg font-semibold">Alertes sur les pieces</h2>
      </div>

      <div className="space-y-3">
        {getExpiredDocuments().length > 0 && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <p className="font-medium">
              {getExpiredDocuments().length} piece(s) expirée(s)
            </p>
            <ul className="mt-1 list-inside list-disc">
              {getExpiredDocuments()
                .slice(0, 3)
                .map((doc) => (
                  <li key={doc.id} className="text-xs">{docsTypesFrechText[doc.documentType]} expirée</li>
                ))}
              {getExpiredDocuments().length > 3 && (
                <li>Et {getExpiredDocuments().length - 3} de plus...</li>
              )}
            </ul>
          </div>
        )}

        {getExpiringDocuments(30).length > 0 && (
          <div className="rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-700">
            <p className="font-medium">
              {getExpiringDocuments(30).length} piece(s) expirant(s) avant les 30 prochains jours
            </p>
            <ul className="mt-1 list-inside list-disc">
              {getExpiringDocuments(30)
                .slice(0, 3)
                .map((doc) => (
                  <li key={doc.id} className="text-xs">
                    {docsTypesFrechText[doc.documentType]} expirée depuis le {" "}
                    {new Date(doc.expiryDate).toLocaleDateString()}
                  </li>
                ))}
              {getExpiringDocuments(30).length > 3 && (
                <li>Et {getExpiringDocuments(30).length - 3} de plus...</li>
              )}
            </ul>
          </div>
        )}

        {getExpiredDocuments().length === 0 &&
          getExpiringDocuments(30).length === 0 && (
            <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
              <p>No document alerts at the moment.</p>
            </div>
          )}
      </div>
    </div>
  );
};

