"use client";

import ReviewerSidebar from "./ReviewerSidebar";
import ReviewerTopbar from "./ReviewerTopbar";

type ReviewerUser = {
  name: string;
  email: string;
  role: string;
  imageUrl: string | null;
};

export default function ReviewerShell({
  user,
  children,
}: {
  user: ReviewerUser;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <ReviewerSidebar />
      <div className="ml-64 flex min-h-screen flex-col">
        <ReviewerTopbar
          name={user.name}
          role={user.role}
          imageUrl={user.imageUrl}
        />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}