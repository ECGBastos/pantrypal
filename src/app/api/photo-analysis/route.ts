import { NextResponse } from "next/server";
import { getCurrentContext } from "@/lib/app-context";
import { getPhotoAnalysisProvider } from "@/lib/photo-analysis";

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get("image");

  if (!(image instanceof File)) {
    return NextResponse.json({ error: "Escolhe uma foto primeiro." }, { status: 400 });
  }

  if (!image.type.startsWith("image/")) {
    return NextResponse.json({ error: "O ficheiro escolhido tem de ser uma imagem." }, { status: 400 });
  }

  if (image.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Escolhe uma foto com menos de 6 MB." }, { status: 413 });
  }

  const { household } = await getCurrentContext();

  try {
    // Privacy guardrail: the image stays in this multipart request only. Do not write it
    // to disk, a database, an uploads folder, logs, or durable storage.
    const provider = getPhotoAnalysisProvider();
    const items = await provider.analyzeInventoryPhoto({
      image,
      householdId: household.id
    });

    return NextResponse.json({ items });
  } catch {
    // Do not include request bodies, file names, or image contents in errors/logs.
    return NextResponse.json(
      { error: "Não conseguimos detetar artigos automaticamente. Ainda podes adicioná-los manualmente a partir desta foto." },
      { status: 500 }
    );
  }
}
