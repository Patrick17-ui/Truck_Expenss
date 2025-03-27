import { Card, CardTitle } from "@/components/ui/card";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Trip } from "@/types";
import { expenseCategoriesFrText } from "@/utils/vehicles";

interface IProps {
  trip: Trip;
}
export const Invoice = ({ trip }: IProps) => {
  const total = trip.expenses
    .filter((e) => e.category !== "WEIGHBRIDGE")
    .reduce((acc, expense) => {
      return acc + Number(expense.amount);
    }, 0);
  const weighbridgeTotal = trip.expenses
    .filter((e) => e.category === "WEIGHBRIDGE")
    .reduce((acc, expense) => {
      return acc + Number(expense.amount);
    }, 0);
  return (
    <div>
      <Card className="p-3">
        <CardTitle>Facture</CardTitle>
        <h5>Depenses</h5>
        <Table>
          {trip.expenses
            .filter((e) => e.category !== "WEIGHBRIDGE")
            .map((expense) => (
              <TableRow key={expense.id}>
                <TableHead>
                  <p>{expenseCategoriesFrText[expense.category]}</p>
                  <p>{expense.description}</p>
                </TableHead>
                <TableCell className="text-right">
                  {expense.amount} FCFA
                </TableCell>
              </TableRow>
            ))}

          <TableRow>
            <TableHead>Total pour le prestataire:</TableHead>
            <TableCell className="text-right font-bold">{total} FCFA</TableCell>
          </TableRow>
        </Table>
        <h5>Ponts bascules et frais de service</h5>
        <Table>
          {trip.expenses
            .filter((e) => e.category === "WEIGHBRIDGE")
            .map((expense) => (
              <TableRow key={expense.id}>
                <TableHead>
                  <p>{expense.weighbridge?.name}</p>
                  <p>{expense.description}</p>
                </TableHead>
                <TableCell className="text-right">
                  {expense.amount} FCFA
                </TableCell>
              </TableRow>
            ))}

          <TableRow>
            <TableHead className="">Total:</TableHead>
            <TableCell className="font-bold text-right">
              {weighbridgeTotal} FCFA
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead>frais de service:</TableHead>
            <TableCell className="text-right">
              {trip.totalAmount} FCFA
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead  className="font-black">Total pour le client:</TableHead>
            <TableCell className="text-right font-black">
              {+(trip.totalAmount || 0) + (+weighbridgeTotal)} FCFA
            </TableCell>
          </TableRow>
        </Table>
      </Card>
    </div>
  );
};
