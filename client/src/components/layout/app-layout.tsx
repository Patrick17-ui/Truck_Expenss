import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store";
import {
  CarIcon,
  ClipboardListIcon,
  CreditCardIcon,
  HomeIcon,
  ListOrdered,
  LogOutIcon,
  UserIcon,
  Users
} from "lucide-react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { IsAdmin } from "../moleculs/casl";
import { LogsPopover } from "../moleculs/LogsPopover";
import { TooltipProvider } from "../ui/tooltip";

export function AppLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ClipboardListIcon className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Transport Express</span>
              <span className="text-xs text-muted-foreground">
                Gestion des Dépenses
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location.pathname === "/dashboard"}
                tooltip="Tableau de bord"
                asChild
              >
                <Link to="/dashboard">
                  <HomeIcon />
                  <span>Tableau de bord</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location.pathname.startsWith("/vehicles")}
                tooltip="Véhicules"
                asChild
              >
                <Link to="/vehicles">
                  <CarIcon />
                  <span>Véhicules</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location.pathname.startsWith("/users")}
                tooltip="Chauffeurs & Admin"
                asChild
              >
                <Link to="/users">
                  <UserIcon />
                  <span>Chauffeurs & Admin</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location.pathname.startsWith("/drivers-trips")}
                tooltip="Chauffeurs & Admin"
                asChild
              >
                <Link to="/drivers-trips">
                  <ListOrdered />
                  <span>Classement des chauffeurs</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location.pathname.startsWith("/trips")}
                tooltip="Courses"
                asChild
              >
                <Link to="/trips">
                  <ClipboardListIcon />
                  <span>Courses</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location.pathname.startsWith("/clients")}
                tooltip="Clients"
                asChild
              >
                <Link to="/clients">
                  <Users />
                  <span>Clients</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location.pathname.startsWith("/expenses")}
                tooltip="Dépenses"
                asChild
              >
                <Link to="/expenses">
                  <CreditCardIcon />
                  <span>Dépenses</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location.pathname.startsWith("/invoices")}
                tooltip="Factures"
                asChild
              >
                <Link to="/invoices">
                  <FileTextIcon />
                  <span>Factures</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem> */}

            {/* <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location.pathname.startsWith("/settings")}
                tooltip="Paramètres"
                asChild
              >
                <Link to="/settings">
                  <SettingsIcon />
                  <span>Paramètres</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem> */}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center gap-2 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              {user?.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.name}</span>
              <span className="text-xs text-muted-foreground">
                {user?.role === "ADMIN" ? "Administrateur" : "Chauffeur"}
              </span>
            </div>
            <button
              onClick={logout}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
            >
              <LogOutIcon className="h-4 w-4" />
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <TooltipProvider>
        <div className="w-full h-screen bg-background ">
          <header className="sticky top-0 bg-background flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-2 justify-between w-full">
              <SidebarTrigger />
              <IsAdmin>
                <LogsPopover />
              </IsAdmin>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 min-w-full">
            <Outlet />
          </main>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
