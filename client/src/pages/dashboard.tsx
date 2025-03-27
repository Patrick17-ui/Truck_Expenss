import apiClient from "@/api/request";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type TripStat = {
  month: string;
  trip_count: string;
};

export type ExpenseStat = {
  month: string;
  total_expense: string;
};

export type StatsResponse = {
  tripsLast12Months: TripStat[];
  ongoingTrips: number;
  expensesLast12Months: ExpenseStat[];
  weighbridgeExpensesLast12Months: ExpenseStat[];
};

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["stats"],
    queryFn: () =>
      apiClient.get<{ data: StatsResponse }>("/stats").then((res) => res.data),
  });

  if (isLoading) return <p>Chargement...</p>;
  if (error || !data) return <p>Erreur lors du chargement des données.</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Voyages en cours" value={data?.ongoingTrips} />
      </div>

      <ChartSection title="Voyages des 12 derniers mois" data={data.tripsLast12Months} dataKey="trip_count" color="#3b82f6" />
      <ChartSection title="Dépenses des 12 derniers mois" data={data.expensesLast12Months} dataKey="total_expense" color="#ef4444" />
      <ChartSection title="Dépenses ponts bascules" data={data.weighbridgeExpensesLast12Months} dataKey="total_expense" color="#f59e0b" />
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-bold">{value}</CardContent>
    </Card>
  );
}

function ChartSection({ title, data, dataKey, color }: { title: string; data: any[]; dataKey: string; color: string }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey={dataKey} fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
