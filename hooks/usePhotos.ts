import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { useAuth } from './useAuth';

type Photo = Database['public']['Tables']['photos']['Row'];

export function usePhotos() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const getPhotos = async (folderId: string): Promise<Photo[]> => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching photos:', error.message);
      throw new Error('Não foi possível carregar as fotos');
    }
  };

  const uploadPhoto = async (uri: string, folderId: string): Promise<Photo> => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setLoading(true);
    try {
      // Get file info from URI
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `photos/${fileName}`;

      // Read the file
      const response = await fetch(uri);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      if (!blob.size) throw new Error('Empty image data');

      // Convert Blob to ArrayBuffer
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Upload the photo to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, uint8Array, {
          contentType: `image/${fileExt}`,
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      // Save reference in the database with current timestamp
      const { data, error } = await supabase
        .from('photos')
        .insert({
          folder_id: folderId,
          image_url: publicUrl,
          user_id: user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      if (!data) throw new Error('Não foi possível salvar a foto');

      return data;
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      throw new Error('Não foi possível fazer upload da foto');
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async (photo: Photo): Promise<void> => {
    try {
      // Deletar arquivo do storage
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove([photo.storage_path]);

      if (storageError) throw storageError;

      // Deletar referência do banco
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting photo:', error.message);
      throw new Error('Não foi possível deletar a foto');
    }
  };

  return {
    loading,
    getPhotos,
    uploadPhoto,
    deletePhoto,
  };
}
