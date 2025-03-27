import { useAuthStore } from "@/store";
import { PropsWithChildren } from "react";

export const IsAdmin = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }
  return <>{children}</>;
};

export const IsUser = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || (user?.role !== "USER" && user?.role !== "ADMIN")) {
    return null;
  }
  return <>{children}</>;
};
