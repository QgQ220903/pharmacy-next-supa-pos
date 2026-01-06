import { getProductById, getProductCategories } from "@/app/actions/products";
import { ProductForm } from "@/components/products/ProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getProductCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Chỉnh sửa thuốc</h1>
      <ProductForm initialData={product} categories={categories} />
    </div>
  );
}
