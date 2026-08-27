import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { useFinance, useVisits, useClients, useIncidents, useStaff } from "@/lib/api";

const PALETTE = ["#0d7ab8", "#00A0E2", "#39c6b5", "#f5a623", "#e5484d", "#8e5cf7"];

export default function Reports() {
  const { invoices } = useFinance();
  const { data: visits = [] } = useVisits();
  const { data: clients = [] } = useClients();
  const { data: incidents = [] } = useIncidents();
  const { data: staff = [] } = useStaff();

  const revenueByStatus = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of invoices.data ?? []) {
      map.set(i.status, (map.get(i.status) ?? 0) + Number(i.total));
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [invoices.data]);

  const visitsByStatus = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of visits) map.set(v.status, (map.get(v.status) ?? 0) + 1);
    return Array.from(map.entries()).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));
  }, [visits]);

  const clientsByFunding = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of clients) {
      const key = c.funding_source ?? "unknown";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));
  }, [clients]);

  const incidentsBySeverity = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of incidents) map.set(i.severity, (map.get(i.severity) ?? 0) + 1);
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [incidents]);

  const staffByDept = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of staff) map.set(s.department ?? "Other", (map.get(s.department ?? "Other") ?? 0) + 1);
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [staff]);

  return (
    <div>
      <PageHeader
        title="Reporting"
        description="Business analytics across finance, operations and care quality."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 shadow-soft">
          <h3 className="font-display font-semibold">Revenue by invoice status</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`£${Number(v).toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {revenueByStatus.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 shadow-soft">
          <h3 className="font-display font-semibold">Visits by status</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={visitsByStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {visitsByStatus.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 shadow-soft">
          <h3 className="font-display font-semibold">Clients by funding source</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientsByFunding}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#0d7ab8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 shadow-soft">
          <h3 className="font-display font-semibold">Incidents by severity</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={incidentsBySeverity} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {incidentsBySeverity.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 shadow-soft lg:col-span-2">
          <h3 className="font-display font-semibold">Staff by department</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffByDept}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#39c6b5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
