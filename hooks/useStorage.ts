import { useEffect, useState, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import EventEmitter from 'eventemitter3';

export const STORAGE_KEY = 'folders.json';

// Função para gerar ID único
const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export interface Photo {
  id: string;
  uri: string;
  timestamp: number;
}

export interface Folder {
  id: string;
  name: string;
  photos: Photo[];
  timestamp: number;
}

export const storageEmitter = new EventEmitter();

export function useStorage() {
  const [folders, setFolders] = useState<Folder[]>([]);

  const saveFolders = useCallback(async (updatedFolders: Folder[]) => {
    try {
      const storagePath = `${FileSystem.documentDirectory}${STORAGE_KEY}`;
      await FileSystem.writeAsStringAsync(storagePath, JSON.stringify(updatedFolders));
      setFolders(updatedFolders);
      storageEmitter.emit('storageChanged');
    } catch (error) {
      console.error('Error saving folders:', error);
    }
  }, []);

  const loadFolders = useCallback(async () => {
    try {
      const storagePath = `${FileSystem.documentDirectory}${STORAGE_KEY}`;
      const fileInfo = await FileSystem.getInfoAsync(storagePath);
      
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(storagePath);
        const loadedFolders = JSON.parse(content);
        setFolders(loadedFolders);
        storageEmitter.emit('storageChanged');
      } else {
        await saveFolders([]);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  }, [saveFolders]);

  const createFolder = useCallback(async (name: string) => {
    try {
      const newFolder: Folder = {
        id: generateId(),
        name,
        photos: [],
        timestamp: Date.now(),
      };
      
      const updatedFolders = [...folders, newFolder];
      await saveFolders(updatedFolders);
      return newFolder;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }, [folders, saveFolders]);

  const deleteFolder = useCallback(async (folderId: string) => {
    try {
      const folderToDelete = folders.find(f => f.id === folderId);
      if (folderToDelete) {
        // Delete all photos in the folder
        for (const photo of folderToDelete.photos) {
          try {
            await FileSystem.deleteAsync(photo.uri, { idempotent: true });
          } catch (error) {
            console.error('Error deleting photo file:', error);
          }
        }
      }
      
      const updatedFolders = folders.filter(folder => folder.id !== folderId);
      await saveFolders(updatedFolders);
      storageEmitter.emit('storageChanged');
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  }, [folders, saveFolders]);

  const renameFolder = useCallback(async (folderId: string, newName: string) => {
    try {
      const updatedFolders = folders.map(folder =>
        folder.id === folderId
          ? { ...folder, name: newName }
          : folder
      );
      await saveFolders(updatedFolders);
      storageEmitter.emit('storageChanged');
    } catch (error) {
      console.error('Error renaming folder:', error);
      throw error;
    }
  }, [folders, saveFolders]);

  const savePhoto = useCallback(async (uri: string, folderId: string) => {
    try {
      const photoId = generateId();
      const extension = uri.split('.').pop();
      const newUri = `${FileSystem.documentDirectory}photos/${photoId}.${extension}`;
      
      // Ensure photos directory exists
      const photosDir = `${FileSystem.documentDirectory}photos`;
      const photosDirInfo = await FileSystem.getInfoAsync(photosDir);
      if (!photosDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(photosDir, { intermediates: true });
      }
      
      // Copy photo to app directory
      await FileSystem.copyAsync({
        from: uri,
        to: newUri
      });
      
      const newPhoto: Photo = {
        id: photoId,
        uri: newUri,
        timestamp: Date.now()
      };
      
      const updatedFolders = folders.map(folder => {
        if (folder.id === folderId) {
          return {
            ...folder,
            photos: [...folder.photos, newPhoto]
          };
        }
        return folder;
      });
      
      await saveFolders(updatedFolders);
      storageEmitter.emit('storageChanged');
      return newPhoto;
    } catch (error) {
      console.error('Error saving photo:', error);
      throw error;
    }
  }, [folders, saveFolders]);

  const deletePhoto = useCallback(async (folderId: string, photoId: string) => {
    try {
      const updatedFolders = folders.map(folder => {
        if (folder.id === folderId) {
          const photoToDelete = folder.photos.find(p => p.id === photoId);
          if (photoToDelete) {
            // Delete the photo file
            FileSystem.deleteAsync(photoToDelete.uri, { idempotent: true })
              .catch(error => console.error('Error deleting photo file:', error));
          }
          return {
            ...folder,
            photos: folder.photos.filter(photo => photo.id !== photoId)
          };
        }
        return folder;
      });
      
      await saveFolders(updatedFolders);
      storageEmitter.emit('storageChanged');
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  }, [folders, saveFolders]);

  // Load folders on mount
  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  return {
    folders,
    loadFolders,
    createFolder,
    deleteFolder,
    renameFolder,
    savePhoto,
    deletePhoto
  };
}
