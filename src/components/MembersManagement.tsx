import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Edit, 
  Trash2, 
  FileText, 
  Eye, 
  Download,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Member {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  anrede: string;
  telefon: string;
  strasse: string;
  nummer: string;
  plz: string;
  ort: string;
  staatsangehoerigkeit: string;
  nettoeinkommen: number;
  profile_image_url: string;
  created_at: string;
  email: string;
}

interface UserDocument {
  id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  uploaded_at: string;
}

interface AdminUser {
  id: string;
  username: string;
  role: string;
}

interface MembersManagementProps {
  adminUser?: AdminUser;
}

const MembersManagement = ({ adminUser }: MembersManagementProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingDocuments, setViewingDocuments] = useState<string | null>(null);
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    const filtered = members.filter(member => 
      member.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.ort?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMembers(filtered);
  }, [members, searchQuery]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      // Get admin token from localStorage
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('Admin token not found');
      }

      // Call admin management function to get members
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: { 
          action: 'get_members',
          token: adminToken
        }
      });

      if (error) throw error;

      setMembers(data.members || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Fehler beim Laden der Mitglieder');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDocuments = async (userId: string) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('Admin token not found');
      }

      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: {
          action: 'get_user_documents',
          token: adminToken,
          user_id: userId
        }
      });

      if (error) throw error;
      setUserDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching user documents:', error);
      toast.error('Fehler beim Laden der Dokumente');
    }
  };

  const handleEditMember = async (memberData: Partial<Member>) => {
    if (!editingMember) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: memberData.first_name,
          last_name: memberData.last_name,
          anrede: memberData.anrede,
          telefon: memberData.telefon,
          strasse: memberData.strasse,
          nummer: memberData.nummer,
          plz: memberData.plz,
          ort: memberData.ort,
          staatsangehoerigkeit: memberData.staatsangehoerigkeit,
          nettoeinkommen: memberData.nettoeinkommen,
        })
        .eq('id', editingMember.id);

      if (error) throw error;

      toast.success('Mitglied erfolgreich aktualisiert');
      setEditingMember(null);
      fetchMembers();
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error('Fehler beim Aktualisieren des Mitglieds');
    }
  };

  const handleDeleteMembers = async () => {
    if (selectedMembers.length === 0) return;

    try {
      // Get admin token from localStorage
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('Admin token not found');
      }

      // Call admin management function to delete members
      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: { 
          action: 'delete_members',
          token: adminToken,
          memberIds: selectedMembers
        }
      });

      if (error) throw error;

      toast.success(`${selectedMembers.length} Mitglieder erfolgreich gelöscht`);
      setSelectedMembers([]);
      fetchMembers();
    } catch (error) {
      console.error('Error deleting members:', error);
      toast.error('Fehler beim Löschen der Mitglieder');
    }
  };

  const downloadDocument = async (filePath: string, fileName: string) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('Admin token not found');
      }

      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: {
          action: 'get_user_document_download_url',
          token: adminToken,
          filePath: filePath
        }
      });

      if (error) throw error;

      if (data.url) {
        const a = document.createElement('a');
        a.href = data.url;
        a.download = fileName;
        a.click();
      } else {
        throw new Error('No download URL received');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Fehler beim Herunterladen des Dokuments');
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMembers(filteredMembers.map(member => member.id));
    } else {
      setSelectedMembers([]);
    }
  };

  const handleSelectMember = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers(prev => [...prev, memberId]);
    } else {
      setSelectedMembers(prev => prev.filter(id => id !== memberId));
    }
  };

  if (loading) {
    return <div className="p-6">Lade Mitglieder...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mitgliederverwaltung</CardTitle>
              <CardDescription>
                Verwalten Sie registrierte Mitglieder und deren Dokumente
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Mitglieder suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              {adminUser?.role === 'admin' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteMembers}
                  disabled={selectedMembers.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Löschen ({selectedMembers.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Mitglied</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Einkommen</TableHead>
                  <TableHead>Registriert</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedMembers.includes(member.id)}
                        onCheckedChange={(checked) => 
                          handleSelectMember(member.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-medium">
                            {member.anrede && `${member.anrede} `}
                            {member.first_name} {member.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.staatsangehoerigkeit}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{member.email}</div>
                        <div className="text-muted-foreground">{member.telefon}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{member.strasse} {member.nummer}</div>
                        <div className="text-muted-foreground">
                          {member.plz} {member.ort}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {member.nettoeinkommen && (
                        <Badge variant="secondary">
                          {member.nettoeinkommen.toLocaleString()} €
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(member.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingMember(member)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Mitglied bearbeiten</DialogTitle>
                              <DialogDescription>
                                Bearbeiten Sie die Informationen des Mitglieds
                              </DialogDescription>
                            </DialogHeader>
                            {editingMember && (
                              <EditMemberForm
                                member={editingMember}
                                onSave={handleEditMember}
                                onCancel={() => setEditingMember(null)}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setViewingDocuments(member.user_id);
                                fetchUserDocuments(member.user_id);
                              }}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                            <DialogHeader>
                              <DialogTitle>Dokumente von {member.first_name} {member.last_name}</DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 overflow-hidden">
                              {userDocuments.length === 0 ? (
                                <div className="flex items-center justify-center h-32">
                                  <p className="text-muted-foreground">Keine Dokumente hochgeladen</p>
                                </div>
                              ) : (
                                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                  {userDocuments.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm">{getDocumentTypeLabel(doc.document_type)}</div>
                                        <div className="text-sm text-muted-foreground truncate">{doc.file_name}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                          {new Date(doc.uploaded_at).toLocaleDateString('de-DE', {
                                            day: '2-digit',
                                            month: '2-digit', 
                                            year: 'numeric'
                                          })}
                                        </div>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => downloadDocument(doc.file_path, doc.file_name)}
                                        className="ml-3 shrink-0"
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredMembers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'Keine Mitglieder gefunden' : 'Keine Mitglieder registriert'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Edit Member Form Component
interface EditMemberFormProps {
  member: Member;
  onSave: (data: Partial<Member>) => void;
  onCancel: () => void;
}

const EditMemberForm: React.FC<EditMemberFormProps> = ({ member, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    first_name: member.first_name || '',
    last_name: member.last_name || '',
    anrede: member.anrede || '',
    telefon: member.telefon || '',
    strasse: member.strasse || '',
    nummer: member.nummer || '',
    plz: member.plz || '',
    ort: member.ort || '',
    staatsangehoerigkeit: member.staatsangehoerigkeit || '',
    nettoeinkommen: member.nettoeinkommen || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-firstName">Vorname</Label>
          <Input
            id="edit-firstName"
            value={formData.first_name}
            onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="edit-lastName">Nachname</Label>
          <Input
            id="edit-lastName"
            value={formData.last_name}
            onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="edit-anrede">Anrede</Label>
          <Select
            value={formData.anrede}
            onValueChange={(value) => setFormData(prev => ({ ...prev, anrede: value }))}
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
          <Label htmlFor="edit-telefon">Telefon</Label>
          <Input
            id="edit-telefon"
            value={formData.telefon}
            onChange={(e) => setFormData(prev => ({ ...prev, telefon: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="edit-strasse">Straße</Label>
          <Input
            id="edit-strasse"
            value={formData.strasse}
            onChange={(e) => setFormData(prev => ({ ...prev, strasse: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="edit-nummer">Nummer</Label>
          <Input
            id="edit-nummer"
            value={formData.nummer}
            onChange={(e) => setFormData(prev => ({ ...prev, nummer: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="edit-plz">PLZ</Label>
          <Input
            id="edit-plz"
            value={formData.plz}
            onChange={(e) => setFormData(prev => ({ ...prev, plz: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="edit-ort">Ort</Label>
          <Input
            id="edit-ort"
            value={formData.ort}
            onChange={(e) => setFormData(prev => ({ ...prev, ort: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="edit-staatsangehoerigkeit">Staatsangehörigkeit</Label>
          <Input
            id="edit-staatsangehoerigkeit"
            value={formData.staatsangehoerigkeit}
            onChange={(e) => setFormData(prev => ({ ...prev, staatsangehoerigkeit: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="edit-nettoeinkommen">Nettoeinkommen (€)</Label>
          <Input
            id="edit-nettoeinkommen"
            type="number"
            value={formData.nettoeinkommen}
            onChange={(e) => setFormData(prev => ({ ...prev, nettoeinkommen: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button type="submit">
          Speichern
        </Button>
      </div>
    </form>
  );
};

export default MembersManagement;