import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAdminAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const callAdminFunction = async (action: string, additionalData: Record<string, any> = {}) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Admin token not found');
      }

      const { data, error } = await supabase.functions.invoke('admin-management', {
        body: { action, token, ...additionalData }
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error calling admin function ${action}:`, error);
      toast({
        title: 'Fehler',
        description: `Aktion "${action}" konnte nicht ausgeführt werden.`,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateContactRequestLabel = async (id: string, lead_label: string | null) => {
    return callAdminFunction('update_contact_request_label', { id, lead_label });
  };

  const updateContactRequestStage = async (id: string, lead_stage: string) => {
    return callAdminFunction('update_contact_request_stage', { id, lead_stage });
  };

  const deleteContactRequests = async (ids: string[]) => {
    return callAdminFunction('delete_contact_requests', { ids });
  };

  const getContactRequests = async () => {
    return callAdminFunction('get_contact_requests');
  };

  const getMembers = async () => {
    return callAdminFunction('get_members');
  };

  const getUserDocuments = async (user_id: string, contact_request_id?: string) => {
    return callAdminFunction('get_user_documents', { user_id, contact_request_id });
  };

  const getLeadDocuments = async (contactRequestId: string) => {
    return callAdminFunction('get_lead_documents', { contactRequestId });
  };

  const uploadLeadDocument = async (contactRequestId: string, file: File, documentType: string) => {
    return callAdminFunction('upload_lead_document', { contactRequestId, file, documentType });
  };

  const deleteLeadDocument = async (documentId: string) => {
    return callAdminFunction('delete_lead_document', { documentId });
  };

  return {
    isLoading,
    callAdminFunction,
    updateContactRequestLabel,
    updateContactRequestStage,
    deleteContactRequests,
    getContactRequests,
    getMembers,
    getUserDocuments,
    getLeadDocuments,
    uploadLeadDocument,
    deleteLeadDocument
  };
};