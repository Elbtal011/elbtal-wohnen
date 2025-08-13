import React from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";

interface LeadLabelBadgeProps {
  label: string | null | undefined;
  className?: string;
}

// Map labels to semantic badge variants using design tokens
const labelVariantMap: Record<string, BadgeProps["variant"]> = {
  "Cold": "info",            // blue
  "Hot Lead": "destructive",  // red
  "Warm": "warning",          // yellow
  "VIP": "orange",            // orange
  "Converted": "success",     // green
  "Follow-Up": "purple",      // purple
  "Unqualified": "secondary", // neutral
};

const LeadLabelBadge: React.FC<LeadLabelBadgeProps> = ({ label, className }) => {
  if (!label) {
    return <Badge variant="outline" className={className}>Ohne Label</Badge>;
  }

  const variant = labelVariantMap[label] || "secondary";

  return (
    <Badge variant={variant} className={["px-2 py-0.5", className].filter(Boolean).join(" ")}>{label}</Badge>
  );
};

export default LeadLabelBadge;
