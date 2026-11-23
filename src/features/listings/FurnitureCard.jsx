/**
 * FurnitureCard
 * Displays a furniture listing. Does not fetch data or change database records.
 * Props:
 *   listing: { id, title, price_yen, area, condition, status,
 *              listing_type, image_urls?: string[], image_url?: string }
 *   onView?(listingId), onEdit?(listing), onRemove?(listing)
 */
export default function FurnitureCard({ listing, onView, onEdit, onRemove }) {
  if (!listing) return null;

  const {
    id,
    title = "Untitled furniture",
    price_yen = 0,
    area = "Tokyo",
    condition = "Unknown",
    status = "available",
    listing_type = "single",
  } = listing;

  // image_urls contains public URLs returned by Storage AFTER upload.
  const imageUrl = listing.image_urls?.[0] ?? listing.image_url ?? null;
  const price = Number(price_yen);
  const displayPrice =
    Number.isFinite(price) && price > 0
      ? new Intl.NumberFormat("ja-JP", {
          style: "currency",
          currency: "JPY",
          maximumFractionDigits: 0,
        }).format(price)
      : "Free";

  return (
    <article className="furniture-card">
      <div className="furniture-card__image-wrap">
        {imageUrl ? (
          <img className="furniture-card__image" src={imageUrl} alt={title} />
        ) : (
          <div className="furniture-card__placeholder" aria-label="No photo yet">
            No photo
          </div>
        )}
        {listing_type === "bundle" && (
          <span className="furniture-card__bundle">Bundle</span>
        )}
      </div>

      <div className="furniture-card__content">
        <h3 className="furniture-card__title">{title}</h3>
        <p className="furniture-card__meta">{area} · {condition}</p>
        <div className="furniture-card__bottom">
          <strong className="furniture-card__price">{displayPrice}</strong>
          <span className={`listing-status listing-status--${status}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        <div className="furniture-card__actions">
          {onView && (
            <button type="button" onClick={() => onView(id)}>
              View details
            </button>
          )}
          {onEdit && (
            <button type="button" onClick={() => onEdit(listing)}>
              Edit
            </button>
          )}
          {onRemove && (
            <button type="button" className="danger" onClick={() => onRemove(listing)}>
              Remove
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
