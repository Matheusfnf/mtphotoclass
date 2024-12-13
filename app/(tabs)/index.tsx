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
  SafeAreaView
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useStorage } from '@/hooks/useStorage';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Colors from '@/constants/Colors';
import { SharedStyles } from '@/constants/Styles';

export default function IndexScreen() {
  const router = useRouter();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { folders, createFolder, deleteFolder, loadFolders } = useStorage();

  // Recarrega as pastas quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      loadFolders();
    }, [loadFolders])
  );

  const filteredFolders = folders.filter(folder => {
    const query = searchQuery.toLowerCase();
    return (
      folder.name.toLowerCase().includes(query) ||
      folder.photos.some(photo => 
        new Date(photo.createdAt)
          .toLocaleDateString()
          .toLowerCase()
          .includes(query)
      )
    );
  });

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await createFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreateModalVisible(false);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    Alert.alert(
      'Apagar Pasta',
      'Tem certeza que deseja apagar esta pasta? Todas as fotos serão removidas.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFolder(folderId);
            } catch (error) {
              console.error('Error deleting folder:', error);
              Alert.alert('Erro', 'Não foi possível apagar a pasta');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Minhas Pastas</Text>
            <Text style={styles.subtitle}>Organize suas fotos em pastas</Text>
          </View>
          <TouchableOpacity onPress={() => setIsCreateModalVisible(true)}>
            <IconSymbol name="folder.badge.plus" size={28} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>

        {/* Barra de Pesquisa */}
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color={Colors.light.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar pastas ou fotos..."
            placeholderTextColor={Colors.light.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}>
              <IconSymbol name="xmark.circle.fill" size={20} color={Colors.light.gray[400]} />
            </TouchableOpacity>
          )}
        </View>

        {filteredFolders.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol 
              name={searchQuery ? "magnifyingglass" : "folder"} 
              size={64} 
              color={Colors.light.gray[400]} 
            />
            <Text style={styles.emptyStateTitle}>
              {searchQuery ? "Nenhum resultado encontrado" : "Nenhuma pasta criada"}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchQuery 
                ? "Tente buscar com outras palavras"
                : "Crie sua primeira pasta para começar"
              }
            </Text>
          </View>
        ) : (
          <View style={styles.folderList}>
            {filteredFolders.map((folder) => (
              <Link
                key={folder.id}
                href={{
                  pathname: '/(modals)/folder',
                  params: { id: folder.id }
                }}
                asChild>
                <TouchableOpacity style={styles.folderCard}>
                  <View style={styles.folderContent}>
                    <IconSymbol name="folder" size={24} color={Colors.light.primary} />
                    <View style={styles.folderInfo}>
                      <Text style={styles.folderName}>{folder.name}</Text>
                      <Text style={SharedStyles.smallText}>
                        {folder.photos.length} fotos
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder.id);
                      }}>
                      <IconSymbol name="trash" size={20} color={Colors.light.error} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        )}
        
        {/* Espaço extra para garantir que as últimas pastas fiquem visíveis */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setIsCreateModalVisible(true)}>
        <View style={styles.createButtonContent}>
          <IconSymbol name="plus" size={24} color="#FFFFFF" />
          <Text style={SharedStyles.buttonText}>Nova Pasta</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isCreateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCreateModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[SharedStyles.card, styles.modalContent]}>
            <Text style={SharedStyles.title}>Nova Pasta</Text>
            <TextInput
              style={SharedStyles.input}
              placeholder="Nome da pasta"
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[SharedStyles.buttonOutline, styles.modalButton]}
                onPress={() => setIsCreateModalVisible(false)}>
                <Text style={SharedStyles.buttonOutlineText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[SharedStyles.button, styles.modalButton]}
                onPress={handleCreateFolder}>
                <Text style={SharedStyles.buttonText}>Criar</Text>
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
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.gray[500],
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.gray[100],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 8,
    padding: 4,
  },
  clearButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: Colors.light.gray[600],
    marginTop: 8,
    textAlign: 'center',
  },
  folderList: {
    padding: 16,
  },
  folderCard: {
    backgroundColor: Colors.light.gray[100],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  folderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 120, // Espaço extra para o botão de criar pasta e navbar
  },
  createButton: {
    position: 'absolute',
    bottom: 90,
    left: 32,
    right: 32,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 400,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 24,
  },
  modalButton: {
    minWidth: 100,
  },
});
