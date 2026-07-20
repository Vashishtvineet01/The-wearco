import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-bold">New product</h1>
      <ProductForm mode="create" />
    </div>
  );
}
