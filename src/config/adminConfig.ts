export const LEAD_LABELS = [
  'Kalt',
  'Warm', 
  'PI 1 erstellt',
  'PI 2 erstellt',
  'Unterlagen erhalten - PI senden',
  'Besichtigung vereinbaren',
  'Hot Lead',
  'Property Application'
] as const;

export const LEAD_STAGES = [
  'postident1',
  'postident2',
  'contract'
] as const;

export const CONTACT_STATUS = [
  'new',
  'in_progress', 
  'completed',
  'archived'
] as const;

export const DOCUMENT_TYPES = [
  'personalausweis',
  'einkommensnachweis',
  'schufa',
  'arbeitsvertrag',
  'sonstiges'
] as const;

export const PAGINATION_CONFIG = {
  ITEMS_PER_PAGE: 15,
  MAX_VISIBLE_PAGES: 5
};

export const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'new': 'Neu',
    'in_progress': 'In Bearbeitung', 
    'completed': 'Abgeschlossen',
    'archived': 'Archiviert'
  };
  return statusMap[status] || status;
};

export const getStatusColor = (status: string): 'destructive' | 'default' | 'secondary' | 'outline' => {
  const colorMap: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
    'new': 'destructive',
    'in_progress': 'default',
    'completed': 'secondary', 
    'archived': 'outline'
  };
  return colorMap[status] || 'outline';
};