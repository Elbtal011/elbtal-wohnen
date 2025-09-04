import React from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";

interface LeadLabelBadgeProps {
  label: string | null | undefined;
  className?: string;
}

// Map labels to semantic badge variants using design tokens
const labelVariantMap: Record<string, BadgeProps["variant"]> = {
  "Kalt": "info",                                        // blue
  "Warm": "warning",                                     // yellow
  "PI 1 erstellt": "purple",                             // purple
  "PI 2 erstellt": "orange",                             // orange
  "Unterlagen erhalten - PI senden": "success",          // green
  "Besichtigung vereinbaren": "secondary",               // neutral
  "Hot Lead": "destructive",                             // red
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
