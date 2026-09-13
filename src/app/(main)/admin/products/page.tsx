import { getAdminProducts } from "@/lib/admin/get-admin-products";
import ProductsClient from "./ProductsClient";

export default async function AdminProductsPage() {
  const data = await getAdminProducts();

  return (
    <ProductsClient
      products={data.products}
      categories={data.categories}
      total={data.total}
      capped={data.capped}
    />
  );
}