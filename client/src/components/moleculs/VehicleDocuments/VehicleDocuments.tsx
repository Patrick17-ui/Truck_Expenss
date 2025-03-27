import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Document, Vehicle } from "@/types";
import { useEffect, useState } from "react";
import { EditDocumentForm } from "./EditDocumentForm";

const allTypes: Document["documentType"][] = [
  "ACF",
  "BLUE_CARD",
  "INSURANCE",
  "LICENSE",
  "TECHNICAL_VISIT",
  "GRAY_CARD",
];
interface IProps {
  vehicle: Vehicle;
}
export const VehicleDocuments = ({ vehicle }: IProps) => {
  const [documents, setDocuments] = useState<
    (Partial<Document> & {
      documentType: Document["documentType"];
      vehicleId: string;
    })[]
  >(vehicle.documents);

  useEffect(() => {
    const docs: typeof documents = allTypes.map((type) => {
      const doc = vehicle.documents.find((doc) => doc.documentType === type);
      if (!doc)
        return {
          documentType: type,
          vehicleId: vehicle.id,
        };
      return doc;
    });
    setDocuments(docs);
  }, [documents, vehicle.documents, vehicle.id]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size={"sm"} variant={"outline"}>
          Documents
        </Button>
      </SheetTrigger>
      <SheetContent className="md:min-w-[60vw] px-3">
        <SheetHeader>
          <SheetTitle>Documents</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-8">
          {documents.map((document, index) => (
            <EditDocumentForm
              key={index}
              data={{ ...document, vehicleId: vehicle.id }}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
