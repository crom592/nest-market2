import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id as string,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { message: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "Notification ID is required" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.update({
      where: {
        id,
        userId: session.user.id as string,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { message: "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function PUT() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await prisma.notification.updateMany({
      where: {
        userId: session.user.id as string,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { message: "Failed to mark all notifications as read" },
      { status: 500 }
    );
  }
}
