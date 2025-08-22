import React from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";

interface LeadLabelBadgeProps {
  label: string | null | undefined;
  className?: string;
}

// Map labels to semantic badge variants using design tokens
const labelVariantMap: Record<string, BadgeProps["variant"]> = {
  "Cold": "info",                                        // blue
  "Hot Lead": "destructive",                             // red
  "Warm": "warning",                                     // yellow
  "VIP": "orange",                                       // orange
  "Converted": "success",                                // green
  "Follow-Up": "purple",                                 // purple
  "Unqualified": "secondary",                            // neutral
  "Auf Unterlagen warten": "warning",                    // yellow
  "Unterlagen erhalten - Kunde wartet auf PI": "info",  // blue
  "Vertrag erstellen": "purple",                         // purple
  "Besichtigungstermin vereinbaren": "orange",           // orange
  "Keine Rückmeldung": "destructive",                    // red
};

const LeadLabelBadge: React.FC<LeadLabelBadgeProps> = ({ label, className }) => {
  if (!label) {
    return <Badge variant="outline" className={`h-7 text-xs px-2 w-fit ${className || ''}`}>Ohne Label</Badge>;
  }

  const variant = labelVariantMap[label] || "secondary";

  return (
    <Badge variant={variant} className={`h-7 text-xs px-2 w-fit ${className || ''}`}>{label}</Badge>
  );
};

export default LeadLabelBadge;
