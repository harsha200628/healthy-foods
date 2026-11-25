import { StorefrontClient } from "@/components/storefront/StorefrontClient";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: "Healthy Foods",
    description:
      "Small-batch student kitchen crafting fresh, wholesome salads daily.",
    servesCuisine: "Healthy Salads",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StorefrontClient />
    </>
  );
}
