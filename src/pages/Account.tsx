import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AccountSidebar, AccountSection } from "@/components/account/AccountSidebar";
import { PersonalInfoSection } from "@/components/account/PersonalInfoSection";
import { BookingsSection } from "@/components/account/BookingsSection";
import { PaymentsSection } from "@/components/account/PaymentsSection";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

const Account = () => {
  const { signOut } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<AccountSection>("reservations");

  // Si un booking ID est dans l'URL, basculer vers la section réservations
  useEffect(() => {
    const bookingId = searchParams.get('booking');
    if (bookingId) {
      setActiveSection("reservations");
    }
  }, [searchParams]);

  const renderContent = () => {
    switch (activeSection) {
      case "info":
        return <PersonalInfoSection />;
      case "reservations":
        return <BookingsSection />;
      case "payments":
        return <PaymentsSection />;
      default:
        return <BookingsSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
        <AccountSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onSignOut={signOut}
        />
        
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl">
            {renderContent()}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Account;
