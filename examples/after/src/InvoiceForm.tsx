// The same screen as index.html, written with the kit's React + Tailwind +
// shadcn recipes (recipes/react-tailwind-shadcn). Not wired to a build; it shows
// what the corrected component code looks like and is a clean checker fixture.
"use client";

import { useState } from "react";
import { Bell, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Field } from "@/components/ui/field";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toaster";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Client = { id: string; name: string; email: string };

export function InvoiceForm({ clients, invoiceNumber }: { clients: Client[]; invoiceNumber: string }) {
  const confirm = useConfirm();
  const [clientId, setClientId] = useState(clients[0]?.id);
  const [due, setDue] = useState<Date>();
  const [files, setFiles] = useState<File[]>([]);
  const [reminders, setReminders] = useState(true);
  const [dueError, setDueError] = useState<string>();
  const [sending, setSending] = useState(false);

  const client = clients.find((c) => c.id === clientId);

  async function discard() {
    const ok = await confirm({
      title: "Discard this draft?",
      description: `Invoice ${invoiceNumber} has not been sent. Discarding removes it and cannot be undone.`,
      confirmLabel: "Discard draft",
      cancelLabel: "Keep editing",
      destructive: true,
    });
    if (ok) toast.success(`Draft ${invoiceNumber} discarded`);
  }

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!due) {
      setDueError("Choose a due date so reminders can be scheduled.");
      return;
    }
    setSending(true);
    try {
      await fetch("/api/invoices", { method: "POST", body: new FormData(event.currentTarget) });
      toast.success(`Invoice ${invoiceNumber} sent to ${client?.email}`);
    } catch {
      toast.error("We couldn't send the invoice. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={send} noValidate className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-8 sm:px-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">New invoice</h1>
          <p className="max-w-prose text-muted-foreground">
            Reminders go out 3, 7 and 14 days after the due date. You can change the schedule for each client.
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="icon" aria-label="Notifications: 2 unread">
              <Bell aria-hidden />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>
      </header>

      <fieldset className="flex flex-col gap-5">
        <legend className="mb-5 text-lg font-semibold">Client</legend>
        <Field label="Bill to">
          <Select value={clientId} onValueChange={setClientId} name="client">
            <SelectTrigger>
              <SelectValue placeholder="Choose a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Send to" hint="The invoice and reminders go to this address.">
          <Input type="email" name="email" autoComplete="email" defaultValue={client?.email} required />
        </Field>
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="mb-5 text-lg font-semibold">Invoice</legend>
        <Field label="Due date" error={dueError}>
          <DatePicker
            value={due}
            onValueChange={(date) => {
              setDue(date);
              setDueError(undefined);
            }}
            disabledDays={{ before: new Date() }}
            locale="en-GB"
            placeholder="Pick a date"
          />
        </Field>
        <FileUpload
          files={files}
          onFilesChange={setFiles}
          prompt="Drop a timesheet or receipt here, or browse"
          hint="PDF, PNG or JPG, up to 5 MB"
          accept="application/pdf,image/png,image/jpeg"
          maxSize={5 * 1024 * 1024}
        />
        <div className="flex items-center gap-3">
          <Checkbox id="reminders" name="reminders" checked={reminders} onCheckedChange={(v) => setReminders(v === true)} />
          <Label htmlFor="reminders">Send reminders automatically</Label>
        </div>
      </fieldset>

      <div className="flex flex-wrap justify-end gap-3 border-t pt-6">
        <Button type="button" variant="ghost" className="mr-auto text-destructive" onClick={discard}>
          Discard draft
        </Button>
        <Button type="button" variant="outline" onClick={() => toast.success("Draft saved")}>
          Save draft
        </Button>
        <Button type="submit" loading={sending}>
          <Send aria-hidden /> Send invoice
        </Button>
      </div>
    </form>
  );
}
