import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { toast } from "sonner";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { ChevronLeft, Plus, Pencil, Trash2, Upload, Download } from "lucide-react";
import { getHotel } from "@/lib/hotels.functions";
import {
  listMenu, createCategory, updateCategory, deleteCategory,
  createItem, updateItem, deleteItem, bulkImportMenu, type BulkRow,
} from "@/lib/menu.functions";

export const Route = createFileRoute("/admin/hotels/$id")({
  head: () => ({
    meta: [{ title: "Menu — Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: HotelDetailPage,
});

type Cat = { id: string; name: string; display_order: number };
type Item = {
  id: string; category_id: string; name: string;
  description: string | null; price: number;
  is_available: boolean; is_veg: boolean;
};

function HotelDetailPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const getH = useServerFn(getHotel);
  const list = useServerFn(listMenu);

  const { data: hotel } = useQuery({
    queryKey: ["hotel", id],
    queryFn: () => getH({ data: { id } }),
  });
  const { data: menu, isLoading } = useQuery({
    queryKey: ["menu", id],
    queryFn: () => list({ data: { restaurantId: id } }) as Promise<{ categories: Cat[]; items: Item[] }>,
  });

  const createCat = useServerFn(createCategory);
  const delCat = useServerFn(deleteCategory);
  const updCat = useServerFn(updateCategory);
  const createIt = useServerFn(createItem);
  const updIt = useServerFn(updateItem);
  const delIt = useServerFn(deleteItem);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["menu", id] });

  const catCreate = useMutation({
    mutationFn: (name: string) =>
      createCat({ data: { restaurantId: id, name, display_order: (menu?.categories.length ?? 0) } }),
    onSuccess: () => { toast.success("Category added"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const catUpdate = useMutation({
    mutationFn: (v: { id: string; name: string }) =>
      updCat({ data: { restaurantId: id, id: v.id, name: v.name } }),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });
  const catDelete = useMutation({
    mutationFn: (catId: string) => delCat({ data: { restaurantId: id, id: catId } }),
    onSuccess: () => { toast.success("Category deleted"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const itemCreate = useMutation({
    mutationFn: (v: Omit<Item, "id">) =>
      createIt({ data: { restaurantId: id, ...v } }),
    onSuccess: () => { toast.success("Item added"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const itemUpdate = useMutation({
    mutationFn: (v: Partial<Item> & { id: string }) =>
      updIt({ data: { restaurantId: id, ...v } }),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });
  const itemDelete = useMutation({
    mutationFn: (itemId: string) => delIt({ data: { restaurantId: id, id: itemId } }),
    onSuccess: () => { toast.success("Item deleted"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const [newCat, setNewCat] = useState("");
  const [addItemFor, setAddItemFor] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <Link to="/admin/hotels" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to hotels
      </Link>

      <div>
        <h1 className="text-3xl font-display font-bold">{hotel?.name ?? "Loading…"}</h1>
        <p className="text-muted-foreground text-sm mt-1 font-mono">{id}</p>
      </div>

      <div className="flex gap-2 items-end max-w-md">
        <div className="flex-1 space-y-1">
          <Label>New category</Label>
          <Input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="e.g. Starters" />
        </div>
        <Button
          disabled={!newCat.trim() || catCreate.isPending}
          onClick={() => { catCreate.mutate(newCat.trim()); setNewCat(""); }}
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {isLoading && <div className="text-muted-foreground">Loading menu…</div>}

      {menu?.categories.length === 0 && !isLoading && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          No categories yet — add one above.
        </div>
      )}

      <div className="space-y-6">
        {menu?.categories.map((cat) => {
          const items = menu.items.filter((i) => i.category_id === cat.id);
          return (
            <div key={cat.id} className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <InlineName
                  value={cat.name}
                  onSave={(name) => catUpdate.mutate({ id: cat.id, name })}
                  className="text-lg font-display font-semibold"
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setAddItemFor(cat.id)}>
                    <Plus className="h-4 w-4 mr-1" /> Item
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Delete category "${cat.name}" and all its items?`))
                        catDelete.mutate(cat.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div>
                {items.length === 0 && (
                  <div className="p-4 text-sm text-muted-foreground">No items in this category.</div>
                )}
                {items.map((it) => (
                  <ItemRow
                    key={it.id}
                    item={it}
                    onSave={(patch) => itemUpdate.mutate({ id: it.id, ...patch })}
                    onDelete={() => {
                      if (confirm(`Delete "${it.name}"?`)) itemDelete.mutate(it.id);
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <ItemDialog
        open={addItemFor != null}
        onOpenChange={(v) => !v && setAddItemFor(null)}
        onCreate={(v) => {
          if (!addItemFor) return;
          itemCreate.mutate({ ...v, category_id: addItemFor });
          setAddItemFor(null);
        }}
      />
    </div>
  );
}

function InlineName({
  value, onSave, className,
}: { value: string; onSave: (v: string) => void; className?: string }) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(value);
  if (!editing)
    return (
      <button className={className + " hover:underline"} onClick={() => { setV(value); setEditing(true); }}>
        {value}
      </button>
    );
  return (
    <div className="flex gap-2">
      <Input value={v} onChange={(e) => setV(e.target.value)} className="h-8" />
      <Button size="sm" onClick={() => { onSave(v); setEditing(false); }}>Save</Button>
      <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
    </div>
  );
}

function ItemRow({
  item, onSave, onDelete,
}: { item: Item; onSave: (patch: Partial<Item>) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [desc, setDesc] = useState(item.description ?? "");
  const [price, setPrice] = useState(String(item.price));
  const [isVeg, setIsVeg] = useState(item.is_veg);

  if (editing) {
    return (
      <div className="p-4 border-t border-border grid gap-3 md:grid-cols-[2fr_3fr_1fr_auto] items-end">
        <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label>Description</Label><Input value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
        <div><Label>Price</Label><Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Switch checked={isVeg} onCheckedChange={setIsVeg} /> <span className="text-xs">Veg</span>
          </div>
          <Button size="sm" onClick={() => {
            onSave({ name, description: desc || null, price: Number(price), is_veg: isVeg });
            setEditing(false);
          }}>Save</Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-border flex items-center gap-3">
      <span className={`inline-block h-2 w-2 rounded-full ${item.is_veg ? "bg-green-500" : "bg-red-500"}`} />
      <div className="flex-1">
        <div className="font-medium">{item.name}</div>
        {item.description && <div className="text-xs text-muted-foreground">{item.description}</div>}
      </div>
      <div className="w-24 text-right font-medium">₹{Number(item.price).toFixed(2)}</div>
      <div className="flex items-center gap-2">
        <Switch checked={item.is_available} onCheckedChange={(v) => onSave({ is_available: v })} />
        <span className="text-xs text-muted-foreground w-14">{item.is_available ? "Available" : "Sold out"}</span>
      </div>
      <Button size="sm" variant="ghost" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" /></Button>
      <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 className="h-4 w-4 text-destructive" /></Button>
    </div>
  );
}

function ItemDialog({
  open, onOpenChange, onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (v: { name: string; description: string | null; price: number; is_available: boolean; is_veg: boolean }) => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [isVeg, setIsVeg] = useState(true);

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setName(""); setDesc(""); setPrice(""); setIsVeg(true); } }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add menu item</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
          <div><Label>Price</Label><Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
          <div className="flex items-center gap-2"><Switch checked={isVeg} onCheckedChange={setIsVeg} /> Vegetarian</div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!name.trim() || !price}
            onClick={() => onCreate({ name: name.trim(), description: desc || null, price: Number(price), is_available: true, is_veg: isVeg })}
          >Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
