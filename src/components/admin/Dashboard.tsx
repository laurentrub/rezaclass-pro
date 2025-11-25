import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, Calendar, DollarSign, Users, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      // Fetch properties count
      const { count: totalProperties } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true });

      const { count: activeProperties } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Fetch bookings stats
      const { data: bookings } = await supabase
        .from("bookings")
        .select("total_price, status, payment_status, admin_commission");

      const pendingBookings = bookings?.filter((b) => b.status === "pending").length || 0;
      const confirmedBookings = bookings?.filter((b) => b.status === "confirmed").length || 0;
      
      const totalRevenue = bookings?.reduce((sum, b) => sum + (parseFloat(b.total_price as any) || 0), 0) || 0;
      const totalCommissions = bookings?.reduce((sum, b) => sum + (parseFloat(b.admin_commission as any) || 0), 0) || 0;

      // Fetch owners count
      const { count: totalOwners } = await supabase
        .from("property_owners")
        .select("*", { count: "exact", head: true });

      // Fetch recent bookings for alerts
      const { data: recentBookings } = await supabase
        .from("bookings")
        .select(`
          id,
          status,
          created_at,
          check_in_date,
          properties (title)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);

      return {
        totalProperties: totalProperties || 0,
        activeProperties: activeProperties || 0,
        inactiveProperties: (totalProperties || 0) - (activeProperties || 0),
        totalOwners: totalOwners || 0,
        pendingBookings,
        confirmedBookings,
        totalBookings: bookings?.length || 0,
        totalRevenue,
        totalCommissions,
        recentPendingBookings: recentBookings || [],
      };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Propriétés",
      value: stats?.totalProperties || 0,
      subtitle: `${stats?.activeProperties || 0} actives`,
      icon: Home,
      color: "text-blue-500",
    },
    {
      title: "Propriétaires",
      value: stats?.totalOwners || 0,
      subtitle: "Partenaires",
      icon: Users,
      color: "text-green-500",
    },
    {
      title: "Réservations",
      value: stats?.totalBookings || 0,
      subtitle: `${stats?.pendingBookings || 0} en attente`,
      icon: Calendar,
      color: "text-orange-500",
    },
    {
      title: "Commissions",
      value: `${(stats?.totalCommissions || 0).toFixed(0)}€`,
      subtitle: `Total: ${(stats?.totalRevenue || 0).toFixed(0)}€`,
      icon: DollarSign,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Vue d'ensemble</h2>
        <p className="text-muted-foreground">
          Statistiques et activité de votre plateforme
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats && stats.recentPendingBookings.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Réservations en attente</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              {stats.recentPendingBookings.map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-medium">
                    {booking.properties?.title || "Propriété"}
                  </span>
                  <Badge variant="outline">
                    Arrivée: {new Date(booking.check_in_date).toLocaleDateString("fr-FR")}
                  </Badge>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Statistiques détaillées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">État des propriétés</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Actives:</span>
                    <Badge variant="outline" className="bg-green-50">
                      {stats?.activeProperties || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Inactives:</span>
                    <Badge variant="outline" className="bg-gray-50">
                      {stats?.inactiveProperties || 0}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">État des réservations</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Confirmées:</span>
                    <Badge variant="outline" className="bg-green-50">
                      {stats?.confirmedBookings || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>En attente:</span>
                    <Badge variant="outline" className="bg-orange-50">
                      {stats?.pendingBookings || 0}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
