import FurnitureCard from "./features/listings/FurnitureCard";
import ListingForm from "./features/listings/ListingForm";

const exampleListing = {
  id: "001",
  title: "Study Desk",
  price_yen: 3000,
  condition: "good",
  area: "Meguro",
  status: "available",
  listing_type: "single",
  image_urls: [],
};

export default function App() {
  async function handleSubmit(data) {
    console.log("Submitted:", data);
  }

  return (
    <main style={{ padding: "30px" }}>
      <h1>TOKYO RE:HOME</h1>

      <h2>Furniture Card</h2>
      <FurnitureCard listing={exampleListing} />

      <h2>Create Furniture Listing</h2>
      <ListingForm onSubmit={handleSubmit} />
    </main>
  );
}
