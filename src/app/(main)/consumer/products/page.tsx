import { redirect } from "next/navigation";
import { getUserProducts } from "@/lib/consumer/get-user-products";
import MyProductsClient from "@/components/consumer/MyProductsClient";

export default async function MyProductsPage() {
  const products = await getUserProducts();
  if (!products) redirect("/login");

  return <MyProductsClient products={products} />;
}