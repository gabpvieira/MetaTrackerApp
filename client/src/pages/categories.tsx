import { CategoryForm } from "@/components/categories/category-form";
import { CategoryGrid } from "@/components/categories/category-grid";

export default function Categories() {
  return (
    <div className="p-6" data-testid="categories-page">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-white">
            Categorias
          </h2>
          <CategoryForm />
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Organize suas transações por categorias
        </p>
      </div>

      {/* Category Grid */}
      <CategoryGrid />
    </div>
  );
}
