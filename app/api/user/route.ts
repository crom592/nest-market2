import { NextResponse } from "next/server";
import { PrismaClient, UserRole, UserLevel } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email, password, name, phoneNumber } = data;

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Required information is missing" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phoneNumber,
        role: UserRole.CONSUMER,
        points: 0,
        bidCount: 0,
        penaltyCount: 0,
        participationCount: 0,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (err) {
    console.error("Failed to create user:", err);
    return NextResponse.json(
      { message: "Failed to create user account" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
      },
    });
    return NextResponse.json(users);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    return NextResponse.json(
      { message: "사용자 목록을 가져오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
