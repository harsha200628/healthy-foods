"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { collection, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import {
  DEFAULT_STORE_SETTINGS,
  STARTER_MENU_ITEMS,
} from "@/data/starter-menu";
import { firestoreDb } from "@/lib/firebase";
import { computeCartSummary, countCartItems, formatPrice } from "@/lib/format";
import type { MenuItem, StoreSettings } from "@/types/domain";
import { Footer } from "@/components/storefront/Footer";
import { HeroSection } from "@/components/storefront/HeroSection";
import { HowItWorks } from "@/components/storefront/HowItWorks";
import { MenuShowcase } from "@/components/storefront/MenuShowcase";
import { MobileTabBar } from "@/components/storefront/MobileTabBar";
import { Navbar } from "@/components/storefront/Navbar";
import { OrderDrawer } from "@/components/storefront/OrderDrawer";
import { OrderSection } from "@/components/storefront/OrderSection";

const BAG_STORAGE_KEY = "hf_customer_bag_v1";

export function StorefrontClient() {
  const [menu, setMenu] = useState<readonly MenuItem[]>(STARTER_MENU_ITEMS);
  const [isStarterPreview, setIsStarterPreview] = useState(true);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(BAG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, unknown>;
        const clean: Record<string, number> = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === "number" && Number.isInteger(v) && v > 0) {
            clean[k] = Math.min(20, v);
          }
        }
        setQuantities(clean);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(quantities));
    } catch {
      // Ignore storage errors
    }
  }, [quantities]);

  useEffect(() => {
    const q = query(
      collection(firestoreDb, "menuItems"),
      orderBy("sortOrder", "asc"),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          setMenu(STARTER_MENU_ITEMS);
          setIsStarterPreview(true);
          return;
        }
        const liveItems: MenuItem[] = snap.docs.map((d) => {
          const raw = d.data();
          return {
            id: d.id,
            itemNumber: String(raw.itemNumber ?? "Item"),
            title: String(raw.title ?? "Fresh Salad"),
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
        setMenu(liveItems);
        setIsStarterPreview(false);
      },
      () => {
        setMenu(STARTER_MENU_ITEMS);
      },
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(firestoreDb, "storeSettings", "public"),
      (snap) => {
        if (!snap.exists()) return;
        const raw = snap.data();
        setSettings({
          brandName: String(raw.brandName ?? DEFAULT_STORE_SETTINGS.brandName),
          tagline: DEFAULT_STORE_SETTINGS.tagline,
          pickupLocation: String(
            raw.pickupLocation ?? DEFAULT_STORE_SETTINGS.pickupLocation,
          ),
          serviceHours: String(
            raw.serviceHours ?? DEFAULT_STORE_SETTINGS.serviceHours,
          ),
          contactEmail: String(
            raw.contactEmail ?? DEFAULT_STORE_SETTINGS.contactEmail,
          ),
          contactHandle: String(
            raw.contactHandle ?? DEFAULT_STORE_SETTINGS.contactHandle,
          ),
          isKitchenOpen: Boolean(
            raw.isKitchenOpen ?? DEFAULT_STORE_SETTINGS.isKitchenOpen,
          ),
        });
      },
      () => {
        // Keep defaults on error
      },
    );

    return () => unsub();
  }, []);

  const totalItems = countCartItems(quantities);
  const { totalCents } = computeCartSummary(menu, quantities);

  const handleIncrement = (id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.min(20, (prev[id] ?? 0) + 1),
    }));
  };

  const handleDecrement = (id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) - 1),
    }));
  };

  const handleClearCart = () => {
    setQuantities({});
  };

  return (
    <div className="flex min-h-screen flex-col pb-24 md:pb-0">
      <Navbar
        totalItems={totalItems}
        onOpenBag={() => setIsDrawerOpen(true)}
        brandName={settings.brandName}
      />

      <main id="main-content" className="flex-1">
        <HeroSection settings={settings} menuCount={menu.length} />
        <MenuShowcase
          items={menu}
          isStarterPreview={isStarterPreview}
          isKitchenOpen={settings.isKitchenOpen}
          quantities={quantities}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
        />
        <HowItWorks settings={settings} />
        <OrderSection
          menu={menu}
          isKitchenOpen={settings.isKitchenOpen}
          quantities={quantities}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onClearCart={handleClearCart}
        />
      </main>

      <Footer settings={settings} />

      {/* Sticky mobile floating bag bar above bottom tab bar */}
      {totalItems > 0 && !isDrawerOpen && (
        <div className="fixed inset-x-3 bottom-[76px] z-30 md:hidden">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl bg-[var(--accent-primary)] px-4 py-3.5 text-white shadow-xl ring-1 ring-white/20 active:scale-[0.99]"
          >
            <span className="inline-flex items-center gap-2.5 text-sm font-semibold">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                {totalItems}
              </span>
              <span>
                {totalItems === 1 ? "1 bowl" : `${totalItems} bowls`} ·{" "}
                {formatPrice(totalCents)}
              </span>
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-bold">
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              <span>View Bag</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </button>
        </div>
      )}

      <MobileTabBar />

      <OrderDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        menu={menu}
        isKitchenOpen={settings.isKitchenOpen}
        quantities={quantities}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onClearCart={handleClearCart}
      />
    </div>
  );
}
