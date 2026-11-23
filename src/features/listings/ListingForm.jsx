import { useState } from "react";
import ImageUploader from "./ImageUploader";

const CATEGORIES = [
  ["desk", "Desk / Table"],
  ["chair", "Chair"],
  ["bed", "Bed"],
  ["sofa", "Sofa"],
  ["storage", "Shelf / Storage"],
  ["appliance", "Home appliance"],
  ["other", "Other"],
];

const EMPTY_FORM = {
  title: "",
  category: "desk",
  condition: "good",
  description: "",
  price_yen: "",
  is_free: false,
  area: "",
  available_from: "",
  listing_type: "single",
};

/**
 * ListingForm does NOT talk directly to Supabase.
 * onSubmit receives {title, category, condition, description, price_yen,
 *   area, available_from, listing_type, items, images: File[]}.
 * Note: editing existing remote images is a separate feature for a later step.
 */
export default function ListingForm({
  initialValues = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
}) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...initialValues,
    price_yen: String(initialValues.price_yen ?? ""),
    is_free: initialValues.price_yen === 0,
  }));
  const [images, setImages] = useState([]);
  const [items, setItems] = useState(
    initialValues.items?.length
      ? initialValues.items.map((item) => ({ ...item }))
      : [{ name: "", quantity: 1 }]
  );
  const [error, setError] = useState("");

  function setField(field, value) {
    setForm((old) => ({ ...old, [field]: value }));
    setError("");
  }

  function updateItem(index, field, value) {
    setItems((old) => old.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) return setError("Please enter a listing title.");
    if (!form.area.trim()) return setError("Please enter a general area, such as Meguro.");
    if (!form.is_free && (form.price_yen === "" || !Number.isInteger(Number(form.price_yen)) || Number(form.price_yen) < 0)) {
      return setError("Enter a valid, non-negative price in whole yen.");
    }
    if (images.length === 0 && !initialValues.id) {
      return setError("Please add at least one furniture photo.");
    }
    if (form.listing_type === "bundle" && items.some((item) => !item.name.trim() || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1)) {
      return setError("Each bundle item needs a name and a positive quantity.");
    }
    if (typeof onSubmit !== "function") {
      return setError("The form needs an onSubmit callback from its parent page.");
    }

    const payload = {
      title: form.title.trim(),
      category: form.category,
      condition: form.condition,
      description: form.description.trim(),
      price_yen: form.is_free ? 0 : Number(form.price_yen),
      area: form.area.trim(), // Public general area, NEVER the exact home address.
      available_from: form.available_from || null,
      listing_type: form.listing_type,
      items: form.listing_type === "bundle"
        ? items.map((item) => ({ name: item.name.trim(), quantity: Number(item.quantity) }))
        : [],
      images, // Browser File objects; upload them to Storage in the service layer.
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit listing.");
    }
  }

  return (
    <form className="listing-form" onSubmit={handleSubmit} noValidate>
      <h2>{initialValues.id ? "Edit listing" : "Post furniture"}</h2>

      <label className="listing-label" htmlFor="listing-title">Listing title *</label>
      <input id="listing-title" maxLength={100} required value={form.title}
        placeholder="e.g. Desk and chair set" onChange={(e) => setField("title", e.target.value)} />

      <div className="listing-form__row">
        <div>
          <label className="listing-label" htmlFor="listing-type">Listing type</label>
          <select id="listing-type" value={form.listing_type}
            onChange={(e) => setField("listing_type", e.target.value)}>
            <option value="single">Single item</option>
            <option value="bundle">Bundle</option>
          </select>
        </div>
        <div>
          <label className="listing-label" htmlFor="listing-category">Category</label>
          <select id="listing-category" value={form.category}
            onChange={(e) => setField("category", e.target.value)}>
            {CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </div>

      {form.listing_type === "bundle" && (
        <fieldset className="listing-form__bundle">
          <legend>Included items</legend>
          {items.map((item, index) => (
            <div className="listing-form__item" key={index}>
              <input aria-label={`Item ${index + 1} name`} placeholder="Item name"
                value={item.name} onChange={(e) => updateItem(index, "name", e.target.value)} />
              <input aria-label={`Item ${index + 1} quantity`} type="number" min="1" step="1"
                value={item.quantity} onChange={(e) => updateItem(index, "quantity", e.target.value)} />
              <button type="button" disabled={items.length === 1}
                onClick={() => setItems((old) => old.filter((_, i) => i !== index))}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => setItems((old) => [...old, { name: "", quantity: 1 }])}>
            + Add item
          </button>
        </fieldset>
      )}

      <label className="listing-label" htmlFor="listing-condition">Condition</label>
      <select id="listing-condition" value={form.condition}
        onChange={(e) => setField("condition", e.target.value)}>
        <option value="new">New / Unused</option>
        <option value="like_new">Like new</option>
        <option value="good">Good</option>
        <option value="fair">Fair / Visible wear</option>
      </select>

      <label className="listing-label" htmlFor="listing-desc">Description</label>
      <textarea id="listing-desc" rows={4} maxLength={1000} value={form.description}
        placeholder="Size, condition, pickup notes (no exact home address)"
        onChange={(e) => setField("description", e.target.value)} />

      <label className="listing-form__checkbox">
        <input type="checkbox" checked={form.is_free}
          onChange={(e) => setField("is_free", e.target.checked)} />
        Free giveaway
      </label>
      <label className="listing-label" htmlFor="listing-price">Price (JPY) *</label>
      <input id="listing-price" type="number" min="0" step="1" inputMode="numeric"
        disabled={form.is_free} value={form.is_free ? "0" : form.price_yen}
        onChange={(e) => setField("price_yen", e.target.value)} />

      <div className="listing-form__row">
        <div>
          <label className="listing-label" htmlFor="listing-area">General area in Tokyo *</label>
          <input id="listing-area" maxLength={80} required value={form.area}
            placeholder="e.g. Meguro" onChange={(e) => setField("area", e.target.value)} />
          <p className="listing-help">Do not enter an exact home address.</p>
        </div>
        <div>
          <label className="listing-label" htmlFor="listing-date">Available from</label>
          <input id="listing-date" type="date" value={form.available_from}
            onChange={(e) => setField("available_from", e.target.value)} />
        </div>
      </div>

      <ImageUploader value={images} onChange={setImages} maxFiles={5} maxSizeMB={2}
        disabled={isSubmitting} />

      {error && <p className="listing-error" role="alert">{error}</p>}
      <div className="listing-form__actions">
        {onCancel && <button type="button" onClick={onCancel} disabled={isSubmitting}>Cancel</button>}
        <button type="submit" className="primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialValues.id ? "Save changes" : "Post listing"}
        </button>
      </div>
    </form>
  );
}
