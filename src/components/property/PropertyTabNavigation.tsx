import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PropertyTabNavigationProps {
  onTabClick?: (sectionId: string) => void;
}

const TABS = [
  { id: "overview", label: "Aperçu" },
  { id: "amenities", label: "Équipements" },
  { id: "availability", label: "Disponibilités" },
  { id: "location", label: "Localisation" },
  { id: "reviews", label: "Avis" },
];

export const PropertyTabNavigation = ({ onTabClick }: PropertyTabNavigationProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Observer for active section detection
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
            setActiveTab(entry.target.id);
          }
        });
      },
      {
        threshold: [0.3, 0.5, 0.7],
        rootMargin: "-100px 0px -50% 0px",
      }
    );

    TABS.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) {
        sectionObserver.observe(section);
      }
    });

    return () => {
      sectionObserver.disconnect();
    };
  }, []);

  const handleTabClick = (tabId: string) => {
    const section = document.getElementById(tabId);
    if (section) {
      const navHeight = 80; // Height of main navigation
      const tabNavHeight = 60; // Height of tab navigation
      const offset = navHeight + tabNavHeight;
      const sectionTop = section.getBoundingClientRect().top + window.scrollY - offset;
      
      window.scrollTo({
        top: sectionTop,
        behavior: "smooth",
      });
    }
    
    setActiveTab(tabId);
    onTabClick?.(tabId);
  };

  return (
    <div className="bg-background border-b">
      <div className="container mx-auto px-4">
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "relative px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors",
                "hover:text-foreground",
                activeTab === tab.id
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
