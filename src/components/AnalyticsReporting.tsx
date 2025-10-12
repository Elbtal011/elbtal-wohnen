import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  MessageSquare, 
  Eye,
  Calendar,
  DollarSign,
  Clock
} from 'lucide-react';

interface AnalyticsData {
  totalProperties: number;
  activeProperties: number;
  totalInquiries: number;
  newInquiries: number;
  inquiriesThisMonth: number;
  topPerformingProperties: Array<{
    id: string;
    title: string;
    inquiries: number;
    views?: number;
  }>;
  inquiriesByStatus: Array<{
    status: string;
    count: number;
  }>;
  monthlyInquiries: Array<{
    month: string;
    count: number;
  }>;
}

const AnalyticsReporting = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const { data } = await supabase.functions.invoke('admin-management', {
        body: { action: 'get_analytics', token, timeRange }
      });

      if (data?.analytics) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Fehler",
        description: "Analytics konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Neu';
      case 'in_progress': return 'In Bearbeitung';
      case 'completed': return 'Abgeschlossen';
      case 'archived': return 'Archiviert';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics & Reporting</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Analytics werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics & Reporting</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Zeitraum wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Letzte 7 Tage</SelectItem>
            <SelectItem value="30">Letzte 30 Tage</SelectItem>
            <SelectItem value="90">Letzte 90 Tage</SelectItem>
            <SelectItem value="365">Letztes Jahr</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Immobilien</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalProperties || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.activeProperties || 0} aktiv
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamte Anfragen</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalInquiries || 0}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{analytics?.inquiriesThisMonth || 0} diesen Monat
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Neue Anfragen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.newInquiries || 0}</div>
            <p className="text-xs text-muted-foreground">
              Benötigen Bearbeitung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Antwortzeit</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
            <p className="text-xs text-muted-foreground">
              Durchschnittlich
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anfragen nach Status */}
        <Card>
          <CardHeader>
            <CardTitle>Anfragen nach Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.inquiriesByStatus?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`}></div>
                    <span className="text-sm font-medium">{getStatusLabel(item.status)}</span>
                  </div>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-4">Keine Daten verfügbar</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Properties */}
        <Card>
          <CardHeader>
            <CardTitle>Top Immobilien</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.topPerformingProperties?.slice(0, 5).map((property, index) => (
                <div key={property.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{property.title}</p>
                      <p className="text-xs text-muted-foreground">{property.inquiries} Anfragen</p>
                    </div>
                  </div>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-4">Keine Daten verfügbar</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => {
                // Export contacts to CSV
                const csvContent = "data:text/csv;charset=utf-8," + 
                  "Name,Email,Telefon,Status,Datum\n" +
                  analytics?.topPerformingProperties?.map(p => 
                    `${p.title},,,Active,${new Date().toLocaleDateString('de-DE')}`
                  ).join('\n');
                
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `kontaktanfragen_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Anfragen Exportieren
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => {
                // Generate and download analytics report
                const reportContent = `
Analytics Bericht - ${new Date().toLocaleDateString('de-DE')}

Übersicht:
- Gesamte Immobilien: ${analytics?.totalProperties || 0}
- Aktive Immobilien: ${analytics?.activeProperties || 0}
- Gesamte Anfragen: ${analytics?.totalInquiries || 0}
- Neue Anfragen: ${analytics?.newInquiries || 0}

Status Verteilung:
${analytics?.inquiriesByStatus?.map(item => `- ${getStatusLabel(item.status)}: ${item.count}`).join('\n') || 'Keine Daten'}

Top Immobilien:
${analytics?.topPerformingProperties?.slice(0, 5).map((p, i) => `${i + 1}. ${p.title} (${p.inquiries} Anfragen)`).join('\n') || 'Keine Daten'}
                `;
                
                const blob = new Blob([reportContent], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `analytics_bericht_${new Date().toISOString().split('T')[0]}.txt`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
              }}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Bericht Generieren
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => {
                // Schedule follow-ups (placeholder - could integrate with calendar)
                alert('Follow-up Planer wird in Kürze verfügbar sein!');
              }}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Follow-ups Planen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsReporting;