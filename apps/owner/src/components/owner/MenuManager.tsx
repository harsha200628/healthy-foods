"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  ImagePlus,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { STARTER_SEED_ITEMS } from "@/data/starter-seed";
import {
  firestoreDb,
  formatPrice,
  resolveOwnerAssetUrl,
} from "@/lib/firebase";
import { compressSaladImageFile } from "@/lib/image-upload";
import {
  MenuItemFormSchema,
  type MenuItem,
} from "@/types/owner";

interface FormDraft {
  itemNumber: string;
  title: string;
  tagline: string;
  description: string;
  ingredientsCsv: string;
  dressing: string;
  priceDollars: string;
  calories: string;
  proteinGrams: string;
  prepMinutes: string;
  dietaryTagsCsv: string;
  imageUrl: string;
  isAvailable: boolean;
  sortOrder: string;
}

function emptyDraft(nextIndex: number): FormDraft {
  return {
    itemNumber: `Item ${nextIndex}`,
    title: "",
    tagline: "",
    description: "",
    ingredientsCsv: "",
    dressing: "",
    priceDollars: "10.00",
    calories: "380",
    proteinGrams: "15",
    prepMinutes: "10",
    dietaryTagsCsv: "Fresh, Vegetarian",
    imageUrl: "/images/salad-item-1.jpg",
    isAvailable: true,
    sortOrder: String(nextIndex),
  };
}

function itemToDraft(item: MenuItem): FormDraft {
  return {
    itemNumber: item.itemNumber,
    title: item.title,
    tagline: item.tagline,
    description: item.description,
    ingredientsCsv: item.ingredients.join(", "),
    dressing: item.dressing,
    priceDollars: (item.priceCents / 100).toFixed(2),
    calories: String(item.calories),
    proteinGrams: String(item.proteinGrams),
    prepMinutes: String(item.prepMinutes),
    dietaryTagsCsv: item.dietaryTags.join(", "),
    imageUrl: item.imageUrl,
    isAvailable: item.isAvailable,
    sortOrder: String(item.sortOrder),
  };
}

export function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<FormDraft>(emptyDraft(1));
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const q = query(
      collection(firestoreDb, "menuItems"),
      orderBy("sortOrder", "asc"),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: MenuItem[] = snap.docs.map((d) => {
          const raw = d.data();
          return {
            id: d.id,
            itemNumber: String(raw.itemNumber ?? "Item"),
            title: String(raw.title ?? "Salad Bowl"),
            tagline: String(raw.tagline ?? ""),
            description: String(raw.description ?? ""),
            ingredients: Array.isArray(raw.ingredients)
              ? raw.ingredients.map(String)
              : [],
            dressing: String(raw.dressing ?? ""),
            priceCents: Number(raw.priceCents ?? 900),
            calories: Number(raw.calories ?? 350),
            proteinGrams: Number(raw.proteinGrams ?? 12),
            prepMinutes: Number(raw.prepMinutes ?? 10),
            dietaryTags: Array.isArray(raw.dietaryTags)
              ? raw.dietaryTags.map(String)
              : [],
            imageUrl: String(raw.imageUrl ?? "/images/salad-item-1.jpg"),
            isAvailable: Boolean(raw.isAvailable ?? true),
            sortOrder: Number(raw.sortOrder ?? 0),
          };
        });
        setItems(list);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  async function handleSeedStarterBowls() {
    setSeeding(true);
    setFormError(null);
    try {
      for (const starter of STARTER_SEED_ITEMS) {
        await setDoc(doc(firestoreDb, "menuItems", starter.id), {
          itemNumber: starter.itemNumber,
          title: starter.title,
          tagline: starter.tagline,
          description: starter.description,
          ingredients: [...starter.ingredients],
          dressing: starter.dressing,
          priceCents: starter.priceCents,
          calories: starter.calories,
          proteinGrams: starter.proteinGrams,
          prepMinutes: starter.prepMinutes,
          dietaryTags: [...starter.dietaryTags],
          imageUrl: starter.imageUrl,
          isAvailable: starter.isAvailable,
          sortOrder: starter.sortOrder,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch {
      setFormError("Could not seed starter bowls. Check Firestore permissions.");
    } finally {
      setSeeding(false);
    }
  }

  async function handleImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError(null);
    try {
      const compressedDataUrl = await compressSaladImageFile(file);
      setDraft((prev) => ({ ...prev, imageUrl: compressedDataUrl }));
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not process image file.",
      );
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSaveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = MenuItemFormSchema.safeParse(draft);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      setFormError(firstIssue?.message ?? "Please check all item fields.");
      return;
    }

    const v = parsed.data;
    const ingredients = v.ingredientsCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 25);
    const dietaryTags = v.dietaryTagsCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 10);

    const payload = {
      itemNumber: v.itemNumber,
      title: v.title,
      tagline: v.tagline,
      description: v.description,
      ingredients,
      dressing: v.dressing,
      priceCents: Math.round(v.priceDollars * 100),
      calories: v.calories,
      proteinGrams: v.proteinGrams,
      prepMinutes: v.prepMinutes,
      dietaryTags,
      imageUrl: v.imageUrl,
      isAvailable: v.isAvailable,
      sortOrder: v.sortOrder,
      updatedAt: serverTimestamp(),
    };

    setSaving(true);
    try {
      if (editingId === "new") {
        await addDoc(collection(firestoreDb, "menuItems"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      } else if (editingId) {
        await updateDoc(doc(firestoreDb, "menuItems", editingId), payload);
      }
      setEditingId(null);
    } catch {
      setFormError("Could not save menu item. Please check permissions and retry.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleAvailability(item: MenuItem) {
    await updateDoc(doc(firestoreDb, "menuItems", item.id), {
      isAvailable: !item.isAvailable,
      updatedAt: serverTimestamp(),
    });
  }

  async function handleDeleteItem(id: string) {
    await deleteDoc(doc(firestoreDb, "menuItems", id));
    setConfirmDeleteId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[var(--text-primary)]">
            Menu &amp; Photo Manager
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Add new salads, upload fresh photos, edit descriptions and prices,
            or delete items. Updates sync live to the Customer Website.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setDraft(emptyDraft(items.length + 1));
            setEditingId("new");
            setFormError(null);
          }}
          className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--accent-primary)] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-primary-hover)] sm:w-auto"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add New Salad Item</span>
        </button>
      </div>

      {!loading && items.length === 0 && (
        <div className="rounded-3xl border border-[#b7dfc3] bg-[var(--bg-accent-soft)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-semibold text-[var(--text-primary)]">
                Your live Firestore menu is empty
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Load the 4 starter salads (Item 1 – Item 4) into Firestore in
                one click so you can customize or replace them anytime.
              </p>
            </div>
            <button
              type="button"
              disabled={seeding}
              onClick={() => void handleSeedStarterBowls()}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[var(--accent-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--accent-primary-hover)] disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>
                {seeding ? "Loading 4 Bowls..." : "Load Starter 4 Bowls"}
              </span>
            </button>
          </div>
        </div>
      )}

      {editingId && (
        <form
          onSubmit={handleSaveItem}
          noValidate
          className="rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
            <h2 className="font-serif text-2xl font-semibold text-[var(--text-primary)]">
              {editingId === "new" ? "Add New Salad Item" : "Edit Salad Item"}
            </h2>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="cursor-pointer text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-12">
            {/* Image Upload & Preview */}
            <div className="space-y-3 lg:col-span-4">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Salad Photo
              </p>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveOwnerAssetUrl(
                    draft.imageUrl || "/images/salad-item-1.jpg",
                  )}
                  alt="Salad preview"
                  className="h-full w-full object-cover"
                />
              </div>

              <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-elevated)]/70 px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-accent-soft)]">
                <ImagePlus className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
                <span>
                  {uploadingImage ? "Compressing Photo..." : "Upload Photo from Device"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => void handleImageFileChange(e)}
                  className="sr-only"
                />
              </label>

              <div>
                <label
                  htmlFor="item-img-url"
                  className="block text-xs font-medium text-[var(--text-muted)]"
                >
                  Or paste image URL / starter path
                </label>
                <input
                  id="item-img-url"
                  type="text"
                  value={draft.imageUrl.startsWith("data:") ? "(Uploaded image ready)" : draft.imageUrl}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, imageUrl: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-xs"
                />
              </div>
            </div>

            {/* Item Fields */}
            <div className="space-y-4 lg:col-span-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="item-number"
                    className="block text-sm font-semibold"
                  >
                    Item Label
                  </label>
                  <input
                    id="item-number"
                    type="text"
                    value={draft.itemNumber}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, itemNumber: e.target.value }))
                    }
                    placeholder="Item 1"
                    className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="item-title"
                    className="block text-sm font-semibold"
                  >
                    Salad Title
                  </label>
                  <input
                    id="item-title"
                    type="text"
                    value={draft.title}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="e.g., Mediterranean Herb Crunch"
                    className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="item-tagline"
                  className="block text-sm font-semibold"
                >
                  Short Tagline
                </label>
                <input
                  id="item-tagline"
                  type="text"
                  value={draft.tagline}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, tagline: e.target.value }))
                  }
                  placeholder="Light, bright & crisp"
                  className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="item-desc"
                  className="block text-sm font-semibold"
                >
                  Description
                </label>
                <textarea
                  id="item-desc"
                  rows={3}
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Describe the greens, proteins, crunch, and flavor..."
                  className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="item-ingredients"
                    className="block text-sm font-semibold"
                  >
                    Ingredients (comma-separated)
                  </label>
                  <input
                    id="item-ingredients"
                    type="text"
                    value={draft.ingredientsCsv}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        ingredientsCsv: e.target.value,
                      }))
                    }
                    placeholder="Romaine, Cucumber, Chickpeas, Feta"
                    className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="item-dressing"
                    className="block text-sm font-semibold"
                  >
                    Dressing
                  </label>
                  <input
                    id="item-dressing"
                    type="text"
                    value={draft.dressing}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, dressing: e.target.value }))
                    }
                    placeholder="Lemon-Herb Vinaigrette"
                    className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                <div>
                  <label
                    htmlFor="item-price"
                    className="block text-xs font-semibold"
                  >
                    Price ($)
                  </label>
                  <input
                    id="item-price"
                    type="number"
                    step="0.01"
                    min="0.50"
                    value={draft.priceDollars}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, priceDollars: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="item-cal"
                    className="block text-xs font-semibold"
                  >
                    Calories
                  </label>
                  <input
                    id="item-cal"
                    type="number"
                    value={draft.calories}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, calories: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="item-protein"
                    className="block text-xs font-semibold"
                  >
                    Protein (g)
                  </label>
                  <input
                    id="item-protein"
                    type="number"
                    value={draft.proteinGrams}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, proteinGrams: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="item-prep"
                    className="block text-xs font-semibold"
                  >
                    Prep (min)
                  </label>
                  <input
                    id="item-prep"
                    type="number"
                    value={draft.prepMinutes}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, prepMinutes: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="item-order"
                    className="block text-xs font-semibold"
                  >
                    Display Order
                  </label>
                  <input
                    id="item-order"
                    type="number"
                    value={draft.sortOrder}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, sortOrder: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-64 flex-1">
                  <label
                    htmlFor="item-tags"
                    className="block text-xs font-semibold"
                  >
                    Dietary Tags (comma-separated)
                  </label>
                  <input
                    id="item-tags"
                    type="text"
                    value={draft.dietaryTagsCsv}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        dietaryTagsCsv: e.target.value,
                      }))
                    }
                    placeholder="Vegan, High Protein"
                    className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm"
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-2 pt-4 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={draft.isAvailable}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        isAvailable: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-[var(--accent-primary)]"
                  />
                  <span>Available for Customers</span>
                </label>
              </div>
            </div>
          </div>

          {formError && (
            <p
              className="mt-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-xs font-medium text-[var(--danger)]"
              role="alert"
            >
              {formError}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3 border-t border-[var(--border-subtle)] pt-4">
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="min-h-11 cursor-pointer rounded-full border border-[var(--border-strong)] bg-white px-5 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="min-h-11 cursor-pointer rounded-full bg-[var(--accent-primary)] px-6 text-sm font-semibold text-white hover:bg-[var(--accent-primary-hover)] disabled:opacity-50"
            >
              {saving ? "Saving to Firestore..." : "Save Salad Item"}
            </button>
          </div>
        </form>
      )}

      {/* Existing Menu Items Grid */}
      {loading ? (
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-sm text-[var(--text-muted)]">
          Loading menu items...
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]"
            >
              <div className="relative aspect-[16/10] w-full bg-[var(--bg-elevated)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveOwnerAssetUrl(item.imageUrl)}
                  alt={item.title}
                  className={`h-full w-full object-cover ${
                    !item.isAvailable ? "opacity-55 grayscale-[30%]" : ""
                  }`}
                />
                <span className="absolute left-3.5 top-3.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] shadow-xs">
                  {item.itemNumber}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-[var(--text-primary)]">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[var(--accent-primary)]">
                      {item.tagline}
                    </p>
                  </div>
                  <p className="font-serif text-xl font-bold text-[var(--text-primary)]">
                    {formatPrice(item.priceCents)}
                  </p>
                </div>

                <p className="mt-2.5 flex-1 text-sm text-[var(--text-secondary)]">
                  {item.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-4">
                  <button
                    type="button"
                    onClick={() => void handleToggleAvailability(item)}
                    className={`min-h-9 cursor-pointer rounded-full border px-3.5 text-xs font-semibold ${
                      item.isAvailable
                        ? "border-[#b7dfc3] bg-[var(--bg-accent-soft)] text-[var(--accent-primary)]"
                        : "border-[#fecaca] bg-[#fef2f2] text-[var(--danger)]"
                    }`}
                  >
                    {item.isAvailable ? "In Stock" : "Sold Out"}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDraft(itemToDraft(item));
                        setEditingId(item.id);
                        setFormError(null);
                      }}
                      className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-white px-3.5 text-xs font-semibold hover:bg-[var(--bg-elevated)]"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Edit
                    </button>

                    {confirmDeleteId === item.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => void handleDeleteItem(item.id)}
                          className="min-h-9 cursor-pointer rounded-full bg-[var(--danger)] px-3 text-xs font-semibold text-white"
                        >
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="min-h-9 cursor-pointer rounded-full border border-[var(--border-strong)] px-3 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(item.id)}
                        aria-label={`Delete ${item.title}`}
                        className="inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-full border border-[#fecaca] bg-[#fef2f2] px-3 text-xs font-semibold text-[var(--danger)] hover:bg-[#fee2e2]"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
