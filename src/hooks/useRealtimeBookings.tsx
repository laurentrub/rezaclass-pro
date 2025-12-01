import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export const useRealtimeBookings = (userId: string | undefined, isManager: boolean) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    console.log("Setting up realtime subscription for bookings");

    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings'
        },
        async (payload) => {
          console.log('New booking received:', payload);
          
          // Fetch the full booking details with related data
          const { data: booking } = await supabase
            .from('bookings')
            .select(`
              *,
              properties!inner(
                title,
                location,
                managed_by
              ),
              profiles (full_name, email)
            `)
            .eq('id', payload.new.id)
            .single() as { data: any };

          // Only show notification if user has access to this booking
          const hasAccess = !isManager || 
            (booking?.properties?.managed_by === userId);

          if (hasAccess && booking) {
            toast({
              title: "🎉 Nouvelle réservation !",
              description: `${booking.profiles?.full_name || 'Un client'} a réservé ${booking.properties?.title}`,
              duration: 8000,
            });

            // Play notification sound
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log('Audio play failed:', e));
          }

          // Invalidate queries to refresh the data
          queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('Booking updated:', payload);
          
          // Invalidate queries to refresh the data
          queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [userId, isManager, queryClient, toast]);
};
