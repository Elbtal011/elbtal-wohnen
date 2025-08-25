import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, Trash2, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface ProfileData {
  first_name: string;
  last_name: string;
  anrede: string;
  telefon: string;
  strasse: string;
  nummer: string;
  plz: string;
  ort: string;
  staatsangehoerigkeit: string;
  geburtsort: string;
  nettoeinkommen: string;
  profile_image_url: string;
}

interface UserDocument {
  id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  uploaded_at: string;
}

interface PropertyApplication {
  id: string;
  property_id: string;
  created_at: string;
  status: string;
  vorname: string;
  nachname: string;
  nettoeinkommen: number;
  einzugsdatum: string;
  property?: {
    title: string;
    address: string;
    city?: { name: string };
  };
}

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    anrede: '',
    telefon: '',
    strasse: '',
    nummer: '',
    plz: '',
    ort: '',
    staatsangehoerigkeit: '',
    geburtsort: '',
    nettoeinkommen: '',
    profile_image_url: '',
  });
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [applications, setApplications] = useState<PropertyApplication[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchDocuments();
      fetchApplications();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          anrede: data.anrede || '',
          telefon: data.telefon || '',
          strasse: data.strasse || '',
          nummer: data.nummer || '',
          plz: data.plz || '',
          ort: data.ort || '',
          staatsangehoerigkeit: data.staatsangehoerigkeit || '',
          geburtsort: data.geburtsort || '',
          nettoeinkommen: data.nettoeinkommen?.toString() || '',
          profile_image_url: data.profile_image_url || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('property_applications')
        .select(`
          *,
          property:properties(
            title,
            address,
            city:cities(name)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        ...profileData,
        nettoeinkommen: profileData.nettoeinkommen ? parseInt(profileData.nettoeinkommen) : null,
      };

      // Update existing profile if exists, else insert a new one
      const { data: existing, error: selectError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (selectError) throw selectError;

      if (existing?.id) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', existing.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ user_id: user?.id, ...updateData });
        if (insertError) throw insertError;
      }

      toast.success('Profil erfolgreich aktualisiert!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Fehler beim Aktualisieren des Profils');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      // Persist the image URL in the user's profile
      const { data: existing, error: selectError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (selectError) throw selectError;

      if (existing?.id) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ profile_image_url: publicUrl })
          .eq('id', existing.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ user_id: user.id, profile_image_url: publicUrl });
        if (insertError) throw insertError;
      }

      setProfileData(prev => ({ ...prev, profile_image_url: publicUrl }));
      toast.success('Profilbild erfolgreich hochgeladen und gespeichert!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Fehler beim Hochladen des Profilbilds');
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${documentType}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('user_documents')
        .insert({
          user_id: user.id,
          document_type: documentType,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          content_type: file.type,
        });

      if (dbError) throw dbError;

      toast.success('Dokument erfolgreich hochgeladen!');
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Fehler beim Hochladen des Dokuments');
    }
  };

  const handleDocumentDelete = async (documentId: string, filePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('user-documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      toast.success('Dokument erfolgreich gelöscht!');
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Fehler beim Löschen des Dokuments');
    }
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Fehler beim Abmelden');
    } else {
      toast.success('Erfolgreich abgemeldet');
      navigate('/');
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'gehaltsnachweis':
        return 'Gehaltsnachweise';
      case 'kontoauszug':
        return 'Kontoauszug';
      case 'personalausweis':
        return 'Personalausweis/Reisepass';
      default:
        return type;
    }
  };

  const getApplicationStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ausstehend';
      case 'approved':
        return 'Genehmigt';
      case 'rejected':
        return 'Abgelehnt';
      default:
        return status;
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Mein Profil</h1>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Abmelden
            </Button>
          </div>

          {/* Profile Image Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profilbild</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileData.profile_image_url} />
                <AvatarFallback className="text-lg">
                  {profileData.first_name?.[0]}{profileData.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="profile-image" className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Profilbild hochladen
                    </span>
                  </Button>
                </Label>
                <Input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Persönliche Informationen</CardTitle>
              <CardDescription>
                Aktualisieren Sie Ihre persönlichen Daten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Vorname</Label>
                    <Input
                      id="firstName"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Nachname</Label>
                    <Input
                      id="lastName"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="anrede">Anrede</Label>
                    <Select
                      value={profileData.anrede}
                      onValueChange={(value) => setProfileData(prev => ({ ...prev, anrede: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Anrede wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="herr">Herr</SelectItem>
                        <SelectItem value="frau">Frau</SelectItem>
                        <SelectItem value="divers">Divers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="telefon">Telefonnummer</Label>
                    <Input
                      id="telefon"
                      type="tel"
                      value={profileData.telefon}
                      onChange={(e) => setProfileData(prev => ({ ...prev, telefon: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="strasse">Straße</Label>
                    <Input
                      id="strasse"
                      value={profileData.strasse}
                      onChange={(e) => setProfileData(prev => ({ ...prev, strasse: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="nummer">Hausnummer</Label>
                    <Input
                      id="nummer"
                      value={profileData.nummer}
                      onChange={(e) => setProfileData(prev => ({ ...prev, nummer: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="plz">PLZ</Label>
                    <Input
                      id="plz"
                      value={profileData.plz}
                      onChange={(e) => setProfileData(prev => ({ ...prev, plz: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="ort">Ort</Label>
                    <Input
                      id="ort"
                      value={profileData.ort}
                      onChange={(e) => setProfileData(prev => ({ ...prev, ort: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="staatsangehoerigkeit">Staatsangehörigkeit</Label>
                    <Input
                      id="staatsangehoerigkeit"
                      value={profileData.staatsangehoerigkeit}
                      onChange={(e) => setProfileData(prev => ({ ...prev, staatsangehoerigkeit: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="geburtsort">Geburtsort</Label>
                    <Input
                      id="geburtsort"
                      value={profileData.geburtsort}
                      onChange={(e) => setProfileData(prev => ({ ...prev, geburtsort: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="nettoeinkommen">Nettoeinkommen (€)</Label>
                    <Input
                      id="nettoeinkommen"
                      type="number"
                      value={profileData.nettoeinkommen}
                      onChange={(e) => setProfileData(prev => ({ ...prev, nettoeinkommen: e.target.value }))}
                      placeholder="z.B. 3.500"
                    />
                    {profileData.nettoeinkommen && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Intl.NumberFormat('de-DE', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 0,
                        }).format(parseInt(profileData.nettoeinkommen) || 0)}
                      </p>
                    )}
                  </div>
                </div>
                
                <Button type="submit" disabled={loading}>
                  {loading ? 'Speichern...' : 'Profil speichern'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Document Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Dokumente</CardTitle>
              <CardDescription>
                Laden Sie Ihre benötigten Dokumente hoch
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {['gehaltsnachweis', 'kontoauszug', 'personalausweis'].map((docType) => (
                <div key={docType} className="space-y-2">
                  <h4 className="font-medium">{getDocumentTypeLabel(docType)}</h4>
                  
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`doc-${docType}`} className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Dokument hochladen
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id={`doc-${docType}`}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => handleDocumentUpload(e, docType)}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    {documents
                      .filter(doc => doc.document_type === docType)
                      .map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{doc.file_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(doc.uploaded_at).toLocaleDateString()}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDocumentDelete(doc.id, doc.file_path)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                  
                  {docType !== 'personalausweis' && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Property Applications Section */}
          <Card>
            <CardHeader>
              <CardTitle>Meine Immobilienbewerbungen</CardTitle>
              <CardDescription>
                Hier sehen Sie alle Ihre Bewerbungen für Immobilien
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <p className="text-muted-foreground">Sie haben noch keine Bewerbungen eingereicht.</p>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{application.property?.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {application.property?.address}
                            {application.property?.city && `, ${application.property.city.name}`}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getApplicationStatusColor(application.status)}`}>
                          {getApplicationStatusLabel(application.status)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Bewerbung vom:</span>
                          <p className="font-medium">
                            {new Date(application.created_at).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Gewünschter Einzug:</span>
                          <p className="font-medium">
                            {new Date(application.einzugsdatum).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Nettoeinkommen:</span>
                          <p className="font-medium">
                            {new Intl.NumberFormat('de-DE', {
                              style: 'currency',
                              currency: 'EUR',
                              minimumFractionDigits: 0,
                            }).format(application.nettoeinkommen)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserProfile;