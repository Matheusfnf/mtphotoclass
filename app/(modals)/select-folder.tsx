import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFolders } from '@/hooks/useFolders';
import { usePhotos } from '@/hooks/usePhotos';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Colors from '@/constants/Colors';

export default function SelectFolderScreen() {
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const { folders, loading: loadingFolders } = useFolders();
  const { uploadPhoto, loading: uploadingPhoto } = usePhotos();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const router = useRouter();

  const handleSelectFolder = async (folderId: string) => {
    try {
      if (!photoUri) return;

      setSelectedFolderId(folderId);
      await uploadPhoto(photoUri, folderId);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Error saving photo:', error);
      Alert.alert('Erro', error.message || 'Não foi possível salvar a foto');
    } finally {
      setSelectedFolderId(null);
    }
  };

  if (loadingFolders) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Selecione uma Pasta</Text>
        <Text style={styles.subtitle}>
          Escolha onde você quer salvar sua foto
        </Text>
      </View>

      {folders.length === 0 ? (
        <View style={styles.centerContent}>
          <IconSymbol name="folder" size={64} color={Colors.light.gray[400]} />
          <Text style={styles.emptyText}>Nenhuma pasta criada</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/(tabs)')}>
            <Text style={styles.createButtonText}>Criar Pasta</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={folders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.folderItem,
                selectedFolderId === item.id && styles.selectedFolder
              ]}
              disabled={uploadingPhoto}
              onPress={() => handleSelectFolder(item.id)}>
              <IconSymbol 
                name={selectedFolderId === item.id ? "folder.fill" : "folder"} 
                size={24} 
                color={Colors.light.primary} 
              />
              <View style={styles.folderInfo}>
                <Text style={styles.folderName}>{item.name}</Text>
              </View>
              {selectedFolderId === item.id ? (
                <ActivityIndicator size="small" color={Colors.light.primary} />
              ) : (
                <IconSymbol name="chevron.right" size={20} color={Colors.light.gray[400]} />
              )}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.gray[500],
  },
  listContent: {
    padding: 16,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 8,
  },
  selectedFolder: {
    backgroundColor: Colors.light.primary + '20',
  },
  folderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  separator: {
    height: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.gray[400],
    marginTop: 16,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
