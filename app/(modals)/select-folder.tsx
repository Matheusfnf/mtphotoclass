import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStorage } from '@/hooks/useStorage';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Colors from '@/constants/Colors';

export default function SelectFolderScreen() {
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const { folders, savePhoto, loadFolders } = useStorage();
  const router = useRouter();

  const handleSelectFolder = async (folderId: string) => {
    try {
      if (photoUri) {
        await savePhoto(photoUri, folderId);
        await loadFolders();
        router.push('/');
      }
    } catch (error) {
      console.error('Error saving photo:', error);
      Alert.alert('Erro', 'Não foi possível salvar a foto');
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
            <IconSymbol name="folder" size={24} color={Colors.light.primary} />
            <View style={styles.folderInfo}>
              <Text style={styles.folderName}>{item.name}</Text>
              <Text style={styles.folderCount}>
                {item.photos.length} {item.photos.length === 1 ? 'foto' : 'fotos'}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={Colors.light.gray[400]} />
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
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.gray[200],
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.gray[600],
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
    color: Colors.light.text,
  },
  folderCount: {
    fontSize: 14,
    color: Colors.light.gray[600],
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.gray[200],
  },
});
