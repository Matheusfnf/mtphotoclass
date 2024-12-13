import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStorage } from '@/hooks/useStorage';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function SelectFolderScreen() {
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const { folders, savePhoto, reloadFolders } = useStorage();
  const router = useRouter();

  const handleSelectFolder = async (folderId: string) => {
    try {
      if (photoUri) {
        await savePhoto(photoUri, folderId);
        reloadFolders();
        router.push('/');
      }
    } catch (error) {
      console.error('Error saving photo:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Selecione uma Pasta</Text>
        <Text style={styles.subtitle}>
          Escolha onde você quer salvar sua foto
        </Text>
      </View>

      <FlatList
        data={folders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.folderItem}
            onPress={() => handleSelectFolder(item.id)}>
            <IconSymbol name="folder" size={24} color="#007AFF" />
            <View style={styles.folderInfo}>
              <Text style={styles.folderName}>{item.name}</Text>
              <Text style={styles.folderCount}>
                {item.photos.length} {item.photos.length === 1 ? 'foto' : 'fotos'}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#999" />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 20,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  folderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  folderCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
});
