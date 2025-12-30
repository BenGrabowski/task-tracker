import { redirect } from "next/navigation";
import { getCategories } from "@/features/categories";
import { requireHousehold } from "@/lib/session";
import { CategoriesPageClient } from "./categories-page-client";

export default async function CategoriesPage() {
  const session = await requireHousehold();

  if (!session.user.householdId) {
    redirect("/household/setup");
  }

  const result = await getCategories();

  return <CategoriesPageClient initialCategories={result.categories} />;
}
