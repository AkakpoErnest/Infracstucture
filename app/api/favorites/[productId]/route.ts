import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: { productId: string } }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // deleteMany (not delete) so removing a favorite that doesn't exist is a
  // no-op success (count: 0) rather than a thrown P2025 error - the
  // end-state the caller wants (not favorited) is already true either way.
  await prisma.favorite.deleteMany({ where: { userId, productId: params.productId } });

  return NextResponse.json({ favorited: false }, { status: 200 });
}
