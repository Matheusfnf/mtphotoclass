import { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';

// Função para gerar ID único
const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export interface Photo {
  id: string;
  uri: string;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  photos: Photo[];
  createdAt: string;
}

const STORAGE_KEY = 'photo_folders';

export function useStorage() {
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const storagePath = `${FileSystem.documentDirectory}${STORAGE_KEY}`;
      const fileExists = await FileSystem.getInfoAsync(storagePath);

      if (!fileExists.exists) {
        await FileSystem.writeAsStringAsync(storagePath, JSON.stringify([]));
        setFolders([]);
        return;
      }

      const content = await FileSystem.readAsStringAsync(storagePath);
      setFolders(JSON.parse(content));
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const saveFolders = async (updatedFolders: Folder[]) => {
    try {
      const storagePath = `${FileSystem.documentDirectory}${STORAGE_KEY}`;
      await FileSystem.writeAsStringAsync(storagePath, JSON.stringify(updatedFolders));
      setFolders(updatedFolders);
    } catch (error) {
      console.error('Error saving folders:', error);
    }
  };

  const saveFolder = async (name: string): Promise<Folder | null> => {
    try {
      const newFolder: Folder = {
        id: generateId(),
        name,
        photos: [],
        createdAt: new Date().toISOString(),
      };

      const updatedFolders = [...folders, newFolder];
      await saveFolders(updatedFolders);
      return newFolder;
    } catch (error) {
      console.error('Error saving folder:', error);
      return null;
    }
  };

  const savePhoto = async (uri: string, folderId: string) => {
    try {
      // Gera um ID único para a foto
      const photoId = generateId();
      const extension = uri.split('.').pop();
      const newUri = `${FileSystem.documentDirectory}photos/${photoId}.${extension}`;

      // Garante que o diretório de fotos existe
      const photosDir = `${FileSystem.documentDirectory}photos`;
      const photosDirInfo = await FileSystem.getInfoAsync(photosDir);
      if (!photosDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(photosDir);
      }

      // Copia a foto
      await FileSystem.copyAsync({
        from: uri,
        to: newUri,
      });

      // Adiciona a foto à pasta selecionada
      const updatedFolders = folders.map(folder => {
        if (folder.id === folderId) {
          return {
            ...folder,
            photos: [
              ...folder.photos,
              {
                id: photoId,
                uri: newUri,
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }
        return folder;
      });

      await saveFolders(updatedFolders);
    } catch (error) {
      console.error('Error saving photo:', error);
      throw error;
    }
  };

  const deletePhoto = async (folderId: string, photoId: string) => {
    try {
      console.log('Deleting photo from storage:', { folderId, photoId });
      const updatedFolders = folders.map(folder => {
        if (folder.id === folderId) {
          const photoToDelete = folder.photos.find(p => p.id === photoId);
          if (photoToDelete) {
            // Deleta o arquivo da foto
            console.log('Deleting photo file:', photoToDelete.uri);
            FileSystem.deleteAsync(photoToDelete.uri, { idempotent: true })
              .catch(error => console.error('Error deleting photo file:', error));
          }

          return {
            ...folder,
            photos: folder.photos.filter(p => p.id !== photoId),
          };
        }
        return folder;
      });

      await saveFolders(updatedFolders);
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      const folderToDelete = folders.find(f => f.id === folderId);
      
      if (folderToDelete) {
        // Deleta todas as fotos da pasta
        for (const photo of folderToDelete.photos) {
          try {
            await FileSystem.deleteAsync(photo.uri, { idempotent: true });
          } catch (error) {
            console.error('Error deleting photo:', error);
          }
        }
      }

      const updatedFolders = folders.filter(f => f.id !== folderId);
      await saveFolders(updatedFolders);
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  };

  const reloadFolders = () => {
    loadFolders();
  };

  return {
    folders,
    saveFolder,
    savePhoto,
    deleteFolder,
    deletePhoto,
    reloadFolders,
  };
}
