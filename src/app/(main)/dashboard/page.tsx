import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/utils/prisma.client";
import ConsumerDashboard from "./ConsumerDashboard";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/login");
  }

  const email = clerkUser.primaryEmailAddress?.emailAddress;

  if (!email) {
    redirect("/login");
  }

  // Make sure the Clerk user exists in our database
  const user = await prisma.user.upsert({
    where: {
      clerkUserId: userId,
    },
    update: {
      name:
        `${clerkUser.firstName ?? ""} ${
          clerkUser.lastName ?? ""
        }`.trim() || null,
      email,
      imageUrl: clerkUser.imageUrl,
    },
    create: {
      clerkUserId: userId,
      name:
        `${clerkUser.firstName ?? ""} ${
          clerkUser.lastName ?? ""
        }`.trim() || null,
      email,
      imageUrl: clerkUser.imageUrl,
      role: "CONSUMER",
      status: "ACTIVE",
    },
    select: {
      role: true,
      status: true,
    },
  });

  if (user.status !== "ACTIVE") {
    redirect("/login");
  }

  switch (user.role) {
    case "INSPECTOR":
      redirect("/inspector");

    case "REVIEWER":
      redirect("/reviewer");

    case "ADMIN":
      redirect("/admin");

    case "CONSUMER":
    default:
      return <ConsumerDashboard />;
  }
}