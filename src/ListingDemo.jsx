import { useState } from "react";
import FurnitureCard from "./features/listings/components/FurnitureCard";
import ListingForm from "./features/listings/components/ListingForm";
import "./features/listings/components/listing-components.css";

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not preview the image."));
    reader.readAsDataURL(file);
  });
}

// Independent local demo — NO backend, authentication, or persistent storage.
export default function ListingDemo() {
  const [listings, setListings] = useState([]);
  const [busy, setBusy] = useState(false);

  async function handleCreate(payload) {
    setBusy(true);
    try {
      const firstImage = payload.images[0];
      const imageUrl = firstImage ? await toDataUrl(firstImage) : null;
      const listing = {
        ...payload,
        id: `demo-${Date.now()}`,
        status: "available",
        image_urls: imageUrl ? [imageUrl] : [],
      };
      // File[] objects are only for uploading; don't put them in persisted records.
      delete listing.images;
      setListings((old) => [listing, ...old]);
      window.alert("Demo listing created! Refreshing the page will clear demo data.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 1050, margin: "30px auto", padding: 16, fontFamily: "sans-serif" }}>
      <h1>TOKYO RE:HOME — Furniture Listings Demo</h1>
      <ListingForm onSubmit={handleCreate} isSubmitting={busy} />
      <h2>Local demo listings</h2>
      <section style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {listings.length === 0 ? <p>No listings yet. Submit the form above.</p> : null}
        {listings.map((listing) => (
          <FurnitureCard
            key={listing.id}
            listing={listing}
            onView={(id) => window.alert(`Open detail page for ${id}`)}
            onRemove={(item) => setListings((old) => old.filter((x) => x.id !== item.id))}
          />
        ))}
      </section>
    </main>
  );
}
