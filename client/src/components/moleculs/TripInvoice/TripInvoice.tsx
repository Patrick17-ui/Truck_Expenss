"use client";

import type React from "react";

import apiClient from "@/api/request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Trip } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { usePDF } from "react-to-pdf";
import { z } from "zod";
import { styles } from "./styles";

const invoiceSchema = z.object({
  clientId: z.string(),
  totalAmount: z.number(),
  invoiceDate: z.coerce.date(),
  tva: z.number().optional(),
  tripId: z.string(),
});

interface TripInvoiceProps {
  trip: Trip;
  trigger?: React.ReactNode;
}

export const TripInvoice = ({ trip, trigger }: TripInvoiceProps) => {
  const client = trip.client;
  const hasInvoice = !!trip.invoice;
  const queryClient = useQueryClient();
  const [tvaRate, setTvaRate] = useState(18); // Default TVA rate is 18%

  const servicePrice = Number(trip.totalAmount || 0) || 0;
  const weighbridgeExpenses = trip.expenses
    .filter((e) => e.category === "WEIGHBRIDGE")
    .map((e) => ({
      label: e.weighbridge!.name,
      amount: Number(e.amount),
    }));

  // Calculate totals
  const totalHT =
    servicePrice +
    weighbridgeExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Apply TVA only to service price as weighbridge expenses are already taxed
  const tva = servicePrice * (tvaRate / 100);
  const totalTTC = totalHT + tva;
  const invoiceMutation = useMutation({
    mutationFn: () => {
      const data = invoiceSchema.parse({
        clientId: client?.id,
        totalAmount: totalHT,
        invoiceDate: new Date(),
        tripId: trip.id,
        tva: tvaRate,
      });
      return apiClient.post("/invoices", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: () => {
      return apiClient.delete(`/invoices/${trip.invoice?.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });

  const { toPDF, targetRef } = usePDF({
    filename: `facture_${trip.client?.name}_${trip.id}.pdf`,
  });
  // Inline styles for better printing with react-pdf

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger ?? <Button size={"sm"}>Facture</Button>}
      </SheetTrigger>
      <SheetContent className="min-w-[65vw] h-[100vh] py-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Facture</SheetTitle>
        </SheetHeader>

        {/* TVA Rate Input */}
        <div style={{ gridColumn: "span 3", ...styles.tvaInput }}>
          <Label htmlFor="tva-rate">Taux de TVA (%):</Label>
          <Input
            id="tva-rate"
            type="number"
            value={tvaRate}
            onChange={(e) => setTvaRate(Number(e.target.value))}
            className="print:hidden"
            style={{ width: "100px" }}
          />
        </div>
        <div id="invoice_pdf" style={styles.container}>
          <div style={{ ...styles.invoice, padding: "16px" }} ref={targetRef}>
            <div style={styles.grid3Cols}>
              {/* Logo and Company Name */}
              <div style={{ ...styles.borderRight, ...styles.borderBottom }}>
                <div style={styles.logo}>Logo</div>
                <div style={styles.companyName}></div>
              </div>

              {/* Invoice Title */}
              <div
                style={{
                  ...styles.borderBottom,
                  gridColumn: "span 2",
                  ...styles.invoiceTitle,
                }}
              >
                FACTURE
              </div>

              {/* Empty space */}
              <div style={styles.borderRight}></div>

              {/* Invoice Number */}
              <div style={{ ...styles.borderBottom, gridColumn: "span 2" }}>
                <div style={styles.grid2Cols}>
                  <div style={{ ...styles.borderRight, ...styles.labelCell }}>
                    Facture N°
                  </div>
                  <div style={styles.valueCell}>1 001</div>
                </div>
              </div>

              {/* Empty space */}
              <div style={styles.borderRight}></div>

              {/* Client Info */}
              <div style={{ ...styles.borderBottom, gridColumn: "span 2" }}>
                <div style={{ ...styles.grid2Cols, ...styles.borderBottom }}>
                  <div style={{ ...styles.borderRight, padding: "8px" }}>
                    Date:
                  </div>
                  <div style={styles.valueCell}>
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
                <div style={{ ...styles.grid2Cols, ...styles.borderBottom }}>
                  <div style={{ ...styles.borderRight, padding: "8px" }}>
                    Client:
                  </div>
                  <div style={styles.valueCell}>{client?.name}</div>
                </div>
                <div style={styles.grid2Cols}>
                  <div style={{ ...styles.borderRight, padding: "8px" }}>
                    Tel:
                  </div>
                  <div style={styles.valueCell}>{client?.contact}</div>
                </div>
              </div>

              {/* Invoice Table */}
              <div style={{ gridColumn: "span 3" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Désignations</th>
                      <th style={styles.tableHeaderCenter}>Qté</th>
                      <th style={styles.tableHeaderCenter}>Prix Unit.</th>
                      <th style={styles.tableHeaderCenter}>Montants</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={styles.tableCell}>Service de transport</td>
                      <td style={styles.tableCellRight}>1</td>
                      <td style={styles.tableCellRight}>
                        {servicePrice.toLocaleString("fr-FR")}
                      </td>
                      <td style={styles.tableCellRight}>
                        {servicePrice.toLocaleString("fr-FR")}
                      </td>
                    </tr>
                    {weighbridgeExpenses.map((expense, index) => (
                      <tr key={index}>
                        <td style={styles.tableCell}>
                          [Frais de pesage] - {expense.label}
                        </td>
                        <td style={styles.tableCellRight}>1</td>
                        <td style={styles.tableCellRight}>
                          {expense.amount.toLocaleString("fr-FR")}
                        </td>
                        <td style={styles.tableCellRight}>
                          {expense.amount.toLocaleString("fr-FR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style={{ ...styles.tableCell }} colSpan={2}></td>
                      <td style={styles.totalLabel}>TOTAL HT</td>
                      <td style={styles.totalValue}>
                        {totalHT.toLocaleString("fr-FR")}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ ...styles.tableCell }} colSpan={2}></td>
                      <td style={styles.tableCellRight}>
                        TVA {tvaRate}% (sur frais de service)
                      </td>
                      <td style={styles.tableCellRight}>
                        {tva.toLocaleString("fr-FR")}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ ...styles.tableCell }} colSpan={2}></td>
                      <td style={styles.finalTotal}>MONTANT TTC</td>
                      <td style={styles.finalTotal}>
                        {totalTTC.toLocaleString("fr-FR")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.buttonContainer}>
            {!hasInvoice ? (
              <Button
                onClick={() => invoiceMutation.mutate()}
                disabled={invoiceMutation.isPending}
              >
                {invoiceMutation.isPending
                  ? "Enregistrement..."
                  : "Enregistrer la facture"}
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={() => deleteInvoice.mutate()}
                disabled={deleteInvoice.isPending}
              >
                {deleteInvoice.isPending
                  ? "Suppression..."
                  : "Supprimer la facture"}
              </Button>
            )}
            <Button onClick={() => toPDF()}>Telecharger</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
