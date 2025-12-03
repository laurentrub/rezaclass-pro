import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, CalendarDays, CreditCard, LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export type AccountSection = "info" | "reservations" | "payments";

interface AccountSidebarProps {
  activeSection: AccountSection;
  onSectionChange: (section: AccountSection) => void;
  onSignOut: () => void;
}

const menuItems = [
  { id: "info" as const, label: "Informations personnelles", icon: User },
  { id: "reservations" as const, label: "Mes réservations", icon: CalendarDays },
  { id: "payments" as const, label: "Mes paiements", icon: CreditCard },
];

const SidebarContent = ({
  activeSection,
  onSectionChange,
  onSignOut,
  onItemClick,
}: AccountSidebarProps & { onItemClick?: () => void }) => (
  <>
    <div className="mb-6">
      <h2 className="text-xl font-bold text-foreground">Mon Compte</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Gérez vos réservations et informations personnelles
      </p>
    </div>

    <nav className="space-y-1 mb-8">
      {menuItems.map((item) => (
        <Button
          key={item.id}
          variant={activeSection === item.id ? "default" : "ghost"}
          className={cn(
            "w-full justify-start gap-3 h-11 text-left",
            activeSection === item.id && "bg-primary text-primary-foreground"
          )}
          onClick={() => {
            onSectionChange(item.id);
            onItemClick?.();
          }}
        >
          <item.icon className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{item.label}</span>
        </Button>
      ))}
    </nav>

    <div className="pt-4 border-t">
      <Button
        variant="outline"
        className="w-full justify-start gap-3"
        onClick={onSignOut}
      >
        <LogOut className="h-4 w-4" />
        Déconnexion
      </Button>
    </div>
  </>
);

export const AccountSidebar = ({
  activeSection,
  onSectionChange,
  onSignOut,
}: AccountSidebarProps) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Mon Compte</h2>
            <p className="text-xs text-muted-foreground">
              {menuItems.find((item) => item.id === activeSection)?.label}
            </p>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <SidebarContent
                  activeSection={activeSection}
                  onSectionChange={onSectionChange}
                  onSignOut={onSignOut}
                  onItemClick={() => setOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-64 min-h-[calc(100vh-80px)] border-r bg-card p-6">
      <SidebarContent
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        onSignOut={onSignOut}
      />
    </aside>
  );
};
