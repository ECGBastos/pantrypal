import type { Metadata } from "next";
import { saveDetectedInventoryItems } from "@/app/actions/inventory";
import { PhotoCaptureUpload } from "@/components/photo-capture-upload";
import { getCategories, getCurrentContext } from "@/lib/app-context";

export const metadata: Metadata = {
  title: "Scan Stock"
};

export const dynamic = "force-dynamic";

export default async function ScanInventoryPage() {
  const { household } = await getCurrentContext();
  const categories = await getCategories(household.id);

  return <PhotoCaptureUpload categories={categories} saveAction={saveDetectedInventoryItems} />;
}
