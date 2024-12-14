import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { Database } from '@/lib/database.types';

type Folder = Database['public']['Tables']['folders']['Row'];

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadFolders = useCallback(async () => {
    if (!user) {
      setFolders([]);
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFolders(data || []);
    } catch (error: any) {
      console.error('Error loading folders:', error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  const createFolder = async (name: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('folders')
        .insert({
          name,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Não foi possível criar a pasta');

      setFolders(prev => [data, ...prev]);
      return data;
    } catch (error: any) {
      console.error('Error creating folder:', error.message);
      throw new Error('Não foi possível criar a pasta');
    }
  };

  const updateFolder = async (id: string, name: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('folders')
        .update({ name })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Não foi possível atualizar a pasta');

      setFolders(prev => prev.map(folder => 
        folder.id === id ? data : folder
      ));
      return data;
    } catch (error: any) {
      console.error('Error updating folder:', error.message);
      throw new Error('Não foi possível atualizar a pasta');
    }
  };

  const deleteFolder = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setFolders(prev => prev.filter(folder => folder.id !== id));
    } catch (error: any) {
      console.error('Error deleting folder:', error.message);
      throw new Error('Não foi possível deletar a pasta');
    }
  };

  return {
    folders,
    loading,
    createFolder,
    updateFolder,
    deleteFolder,
    loadFolders,
  };
}
