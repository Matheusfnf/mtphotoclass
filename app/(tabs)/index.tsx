import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  Alert,
  Platform,
  ScrollView,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useFolders } from '@/hooks/useFolders';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Colors from '@/constants/Colors';
import { SharedStyles } from '@/constants/Styles';

export default function IndexScreen() {
  const router = useRouter();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { folders, loading, createFolder, deleteFolder, loadFolders } = useFolders();

  // Recarrega as pastas quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      // Só recarrega se já tiver carregado uma vez
      if (!loading) {
        loadFolders();
      }
    }, [loadFolders, loading])
  );

  const filteredFolders = folders.filter(folder => {
    const query = searchQuery.toLowerCase();
    return folder.name.toLowerCase().includes(query);
  });

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      try {
        await createFolder(newFolderName.trim());
        setNewFolderName('');
        setIsCreateModalVisible(false);
      } catch (error: any) {
        Alert.alert('Erro', error.message || 'Não foi possível criar a pasta');
      }
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta pasta? Todas as fotos serão excluídas permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFolder(folderId);
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Não foi possível excluir a pasta');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar pastas..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsCreateModalVisible(true)}
        >
          <IconSymbol name="folder.badge.plus" size={24} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : filteredFolders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Nenhuma pasta encontrada' : 'Nenhuma pasta criada'}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.folderGrid}>
          {filteredFolders.map(folder => (
            <TouchableOpacity
              key={folder.id}
              style={styles.folderItem}
              onPress={() => router.push(`/folder?id=${folder.id}`)}
              onLongPress={() => handleDeleteFolder(folder.id)}>
              <View style={styles.folderIcon}>
                <IconSymbol name="folder.fill" size={40} color={Colors.light.primary} />
              </View>
              <Text style={styles.folderName} numberOfLines={2}>
                {folder.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={isCreateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCreateModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Pasta</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nome da pasta"
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus
              onSubmitEditing={handleCreateFolder}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setNewFolderName('');
                  setIsCreateModalVisible(false);
                }}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleCreateFolder}>
                <Text style={[styles.modalButtonText, { color: Colors.light.primary }]}>
                  Criar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: Colors.light.gray[100],
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  addButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.gray[400],
  },
  folderGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  folderItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 8,
  },
  folderIcon: {
    flex: 1,
    backgroundColor: Colors.light.gray[100],
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderName: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    color: Colors.light.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 32,
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: Colors.light.text,
  },
  modalInput: {
    height: 40,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  modalButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: Colors.light.gray[100],
  },
  modalButtonConfirm: {
    backgroundColor: Colors.light.primary + '20',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
