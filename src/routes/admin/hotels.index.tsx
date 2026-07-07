import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Copy, Pencil, Trash2, Plus, ExternalLink, QrCode, Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { listHotels, createHotel, updateHotel, deleteHotel } from "@/lib/hotels.functions";

export const Route = createFileRoute("/admin/hotels/")({
  head: () => ({
    meta: [{ title: "Hotels — Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: HotelsPage,
});

type Hotel = { id: string; name: string; is_active: boolean; created_at: string };

const WA_NUMBER_KEY = "wa_business_number";

function normalizeNumber(n: string) {
  return n.replace(/[^\d]/g, "");
}

function HotelsPage() {
  const qc = useQueryClient();
  const list = useServerFn(listHotels);
  const create = useServerFn(createHotel);
  const update = useServerFn(updateHotel);
  const remove = useServerFn(deleteHotel);

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ["hotels"],
    queryFn: () => list() as Promise<Hotel[]>,
  });

  const [waNumber, setWaNumber] = useState<string>(() =>
    typeof window !== "undefined" ? localStorage.getItem(WA_NUMBER_KEY) ?? "" : ""
  );
  function saveWa(v: string) {
    const clean = normalizeNumber(v);
    setWaNumber(clean);
    localStorage.setItem(WA_NUMBER_KEY, clean);
  }

  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");

  const createM = useMutation({
    mutationFn: (n: string) => create({ data: { name: n } }),
    onSuccess: () => {
      toast.success("Hotel added");
      setAddOpen(false);
      setName("");
      qc.invalidateQueries({ queryKey: ["hotels"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const updateM = useMutation({
    mutationFn: (v: { id: string; name?: string; is_active?: boolean }) =>
      update({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hotels"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Hotel deleted");
      qc.invalidateQueries({ queryKey: ["hotels"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Hotels</h1>
          <p className="text-muted-foreground mt-1">Manage your hotels and get WhatsApp links.</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add hotel</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add hotel</DialogTitle></DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="hname">Hotel name</Label>
              <Input id="hname" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sai Vijay" />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button disabled={!name.trim() || createM.isPending} onClick={() => createM.mutate(name)}>
                {createM.isPending ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <Label htmlFor="wa-num" className="text-sm">WhatsApp business number (used for all hotel QRs)</Label>
        <div className="flex gap-2 mt-2 max-w-md">
          <Input
            id="wa-num"
            inputMode="tel"
            placeholder="e.g. 919876543210 (country code + number)"
            value={waNumber}
            onChange={(e) => saveWa(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Digits only, include country code (no +). Message format: <code>menu &lt;RID&gt;</code>
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">RID</th>
              <th className="text-left p-3">Active</th>
              <th className="text-left p-3">Created</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading…</td></tr>
            )}
            {!isLoading && hotels.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No hotels yet.</td></tr>
            )}
            {hotels.map((h) => (
              <HotelRow
                key={h.id}
                hotel={h}
                waNumber={waNumber}
                onToggle={(v) => updateM.mutate({ id: h.id, is_active: v })}
                onRename={(n) => updateM.mutate({ id: h.id, name: n })}
                onDelete={() => {
                  if (confirm(`Delete "${h.name}"? This removes its menu, customers and feedback.`))
                    deleteM.mutate(h.id);
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HotelRow({
  hotel, waNumber, onToggle, onRename, onDelete,
}: {
  hotel: Hotel;
  waNumber: string;
  onToggle: (v: boolean) => void;
  onRename: (n: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(hotel.name);

  const message = `menu ${hotel.id}`;
  const waText = encodeURIComponent(message);
  const waLink = waNumber
    ? `https://wa.me/${waNumber}?text=${waText}`
    : `https://wa.me/?text=${waText}`;

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied`));
  }

  return (
    <tr className="border-t border-border">
      <td className="p-3">
        {editing ? (
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8" />
            <Button size="sm" onClick={() => { onRename(name); setEditing(false); }}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => { setName(hotel.name); setEditing(false); }}>Cancel</Button>
          </div>
        ) : (
          <Link to="/admin/hotels/$id" params={{ id: hotel.id }} className="font-medium hover:underline">
            {hotel.name}
          </Link>
        )}
      </td>
      <td className="p-3 font-mono text-xs">
        <button className="hover:underline" onClick={() => copy(hotel.id, "RID")}>
          {hotel.id.slice(0, 8)}…
        </button>
      </td>
      <td className="p-3">
        <Switch checked={hotel.is_active} onCheckedChange={onToggle} />
      </td>
      <td className="p-3 text-muted-foreground">{new Date(hotel.created_at).toLocaleDateString()}</td>
      <td className="p-3">
        <div className="flex items-center justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => copy(`Hi ${hotel.id}`, "WhatsApp text")} title="Copy WhatsApp start text">
            <Copy className="h-4 w-4" />
          </Button>
          <a href={waLink} target="_blank" rel="noreferrer">
            <Button size="sm" variant="ghost" title="Open WhatsApp"><ExternalLink className="h-4 w-4" /></Button>
          </a>
          <QrDialog hotel={hotel} waLink={waLink} />
          <Link to="/admin/hotels/$id" params={{ id: hotel.id }} title="Edit hotel & menu">
            <Button size="sm" variant="ghost"><Pencil className="h-4 w-4" /></Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      </td>

    </tr>
  );
}

function QrDialog({ hotel, waLink }: { hotel: Hotel; waLink: string }) {
  const [open, setOpen] = useState(false);
  const canvasId = `qr-${hotel.id}`;

  function download() {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${hotel.name.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    a.click();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" title="Show QR code"><QrCode className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{hotel.name} — WhatsApp QR</DialogTitle>
          <DialogDescription>Customers scan this to open WhatsApp with the hotel pre-tagged.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="rounded-lg bg-white p-4">
            <QRCodeCanvas id={canvasId} value={waLink} size={240} level="M" includeMargin={false} />
          </div>
          <div className="text-xs font-mono text-muted-foreground break-all text-center max-w-xs">{waLink}</div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
          <Button onClick={download}><Download className="h-4 w-4 mr-2" />Download PNG</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
