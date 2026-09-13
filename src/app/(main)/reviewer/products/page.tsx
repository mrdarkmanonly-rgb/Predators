import { getReviewedProducts } from "@/lib/reviewer/get-reviewed-products";
import ProductsClient from "./ProductsClient";

export default async function ReviewerProductsPage() {
  const data = await getReviewedProducts();

  return (
    <ProductsClient
      products={data.products}
      categories={data.categories}
    />
  );
}