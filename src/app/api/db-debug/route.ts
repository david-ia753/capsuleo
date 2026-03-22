import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const counts = {
      users: await prisma.user.count(),
      invitations: await prisma.invitation.count(),
      trainers: await prisma.user.count({ where: { role: 'TRAINER' } }),
      students: await prisma.user.count({ where: { role: 'STUDENT' } }),
      pendingInvitations: await prisma.invitation.count({ where: { status: 'PENDING' } }),
    };

    const recentInvitations = await prisma.invitation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        email: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      counts,
      recentInvitations,
      recentUsers
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
