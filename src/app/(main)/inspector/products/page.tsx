import { getInspectedProducts } from "@/lib/inspector/get-inspected-products";
import InspectedProductsClient from "@/components/inspector/InspectedProductsClient";

export default async function InspectorProductsPage() {
  const products = await getInspectedProducts();

  return <InspectedProductsClient products={products} />;
}