import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const design = await prisma.design.findUnique({
    where: { id: params.id },
    include: {
      alternatives: {
        orderBy: { index: "asc" },
        include: { items: { include: { product: { include: { brand: true } } } } },
      },
    },
  });

  if (!design || design.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(design);
}
