import { Button } from "@/components/ui/button";
import { User, CalendarDays, CreditCard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

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

export const AccountSidebar = ({
  activeSection,
  onSectionChange,
  onSignOut,
}: AccountSidebarProps) => {
  return (
    <aside className="w-full lg:w-64 lg:min-h-[calc(100vh-80px)] border-b lg:border-b-0 lg:border-r bg-card p-6">
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
              "w-full justify-start gap-3 h-11",
              activeSection === item.id && "bg-primary text-primary-foreground"
            )}
            onClick={() => onSectionChange(item.id)}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
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
    </aside>
  );
};
