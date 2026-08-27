import { useState } from "react";
import { toast } from "sonner";
import { Plus, Wallet, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useFinance, useClients, useInvoices, useTableMutation } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import type { Invoice, Payment } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function Finance() {
  return (
    <div>
      <PageHeader
        title="Finance"
        description="Invoices, payments and overdue tracking."
        action={<NewInvoiceDialog />}
      />
      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices" className="pt-4"><InvoicesTab /></TabsContent>
        <TabsContent value="payments" className="pt-4"><PaymentsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function InvoicesTab() {
  const { invoices } = useFinance();
  const { mutateAsync } = useTableMutation<Invoice>("invoices");

  const columns: Column<Invoice>[] = [
    { header: "Invoice", cell: (i) => <span className="font-mono text-xs font-medium">{i.invoice_number}</span> },
    { header: "Client", cell: (i) => <span className="font-medium">{i.clients?.reference ?? "—"}</span> },
    { header: "Period", cell: (i) => <span className="text-muted-foreground">{formatDate(i.period_start)} – {formatDate(i.period_end)}</span> },
    { header: "Due", cell: (i) => <span className="text-muted-foreground">{formatDate(i.due_date)}</span> },
    { header: "Total", cell: (i) => <span className="font-semibold">{formatCurrency(i.total)}</span> },
    { header: "Status", cell: (i) => <StatusBadge status={i.status} /> },
    { header: "Actions", cell: (i) => (
      (i.status === "sent" || i.status === "partial" || i.status === "overdue") ? (
        <RecordPaymentDialog invoice={i} />
      ) : i.status === "draft" ? (
        <Button size="sm" variant="outline" onClick={async () => { await mutateAsync({ id: i.id, values: { status: "sent" } }); toast.success("Invoice marked as sent."); }}>
          Mark sent
        </Button>
      ) : null
    ) },
  ];

  return (
    <DataTable
      columns={columns}
      rows={invoices.data ?? []}
      loading={invoices.isLoading}
      keyOf={(i) => i.id}
      emptyTitle="No invoices yet"
    />
  );
}

function PaymentsTab() {
  const { payments } = useFinance();
  const columns: Column<Payment>[] = [
    { header: "Date", cell: (p) => <span className="text-muted-foreground">{formatDate(p.received_at)}</span> },
    { header: "Amount", cell: (p) => <span className="font-semibold">{formatCurrency(p.amount)}</span> },
    { header: "Method", cell: (p) => <span className="capitalize">{p.method.replace(/_/g, " ")}</span> },
    { header: "Reference", cell: (p) => <span className="font-mono text-xs">{p.reference ?? "—"}</span> },
    { header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
  ];
  return (
    <DataTable
      columns={columns}
      rows={payments.data ?? []}
      loading={payments.isLoading}
      keyOf={(p) => p.id}
      emptyTitle="No payments recorded"
    />
  );
}

function NewInvoiceDialog() {
  const { data: clients = [] } = useClients();
  const { data: invoices = [] } = useInvoices();
  const { mutateAsync, isPending } = useTableMutation<Invoice>("invoices");
  const { mutateAsync: addItem } = useTableMutation("invoice_items");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ client_id: "", period_start: "", period_end: "", due_date: "", description: "", quantity: "0", rate: "0" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id || !form.period_start) return toast.error("Select a client and billing start date.");
    const qty = Number(form.quantity) || 0;
    const rate = Number(form.rate) || 0;
    const amount = Math.round(qty * rate * 100) / 100;
    if (amount <= 0) return toast.error("Quantity and rate must produce a positive amount.");
    const nextNumber = `INV-2026-${String(invoices.length + 1).padStart(3, "0")}`;
    const id = await mutateAsync({
      values: {
        client_id: form.client_id,
        invoice_number: nextNumber,
        period_start: form.period_start,
        period_end: form.period_end || null,
        due_date: form.due_date || null,
        subtotal: amount,
        tax: 0,
        total: amount,
        status: "sent",
      },
    });
    await addItem({ values: { invoice_id: id, description: form.description || "Care services", quantity: qty, rate, amount } });
    toast.success(`Invoice ${nextNumber} created and sent.`);
    setOpen(false);
    setForm({ client_id: "", period_start: "", period_end: "", due_date: "", description: "", quantity: "0", rate: "0" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> New invoice</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create invoice</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2"><Label>Client *</Label>
            <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
              <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name} ({c.reference})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Period start *</Label><Input type="date" value={form.period_start} onChange={(e) => setForm({ ...form, period_start: e.target.value })} /></div>
            <div className="space-y-2"><Label>Period end</Label><Input type="date" value={form.period_end} onChange={(e) => setForm({ ...form, period_end: e.target.value })} /></div>
            <div className="space-y-2"><Label>Due date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Home care visits" /></div>
            <div className="space-y-2"><Label>Hours / quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
            <div className="space-y-2"><Label>Rate (£/hr)</Label><Input type="number" step="0.5" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} /></div>
          </div>
          <DialogFooter><Button type="submit" disabled={isPending}><Receipt className="h-4 w-4" /> {isPending ? "Creating…" : "Create & send"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RecordPaymentDialog({ invoice }: { invoice: Invoice }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid payment amount.");
    setBusy(true);
    const { error } = await supabase.from("payments").insert({
      invoice_id: invoice.id,
      amount: amt,
      method,
      reference: reference || null,
      status: "confirmed",
    });
    if (error) {
      setBusy(false);
      return toast.error("Failed to record payment.");
    }
    const paidTotal = Number(amt);
    const nextStatus = paidTotal >= Number(invoice.total) ? "paid" : "partial";
    await supabase.from("invoices").update({ status: nextStatus }).eq("id", invoice.id);
    setBusy(false);
    toast.success(`Payment recorded. Invoice ${nextStatus === "paid" ? "fully paid" : "partially paid"}.`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Wallet className="h-4 w-4" /> Record payment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Record payment for {invoice.invoice_number}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <p className="text-sm text-muted-foreground">Invoice total: <span className="font-semibold text-foreground">{formatCurrency(invoice.total)}</span></p>
          <div className="space-y-2"><Label>Amount (£)</Label><Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="bank_transfer">Bank transfer</SelectItem><SelectItem value="card">Card</SelectItem><SelectItem value="cash">Cash</SelectItem><SelectItem value="standing_order">Standing order</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Reference</Label><Input value={reference} onChange={(e) => setReference(e.target.value)} /></div>
          </div>
          <DialogFooter><Button type="submit" disabled={busy}>{busy ? "Saving…" : "Record payment"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
