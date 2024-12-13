import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  ScrollView,
  Image,
  TextInput,
  KeyboardAvoidingView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import ImageViewer from 'react-native-image-zoom-viewer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useStorage } from '@/hooks/useStorage';
import Colors from '@/constants/Colors';
import { SharedStyles } from '@/constants/Styles';

type PhotoItemProps = {
  photo: {
    id: string;
    uri: string;
  };
  isEditing: boolean;
  onPress: () => void;
  onDelete: () => void;
  onPhotoPress: () => void;
};

const PhotoItem = ({ photo, isEditing, onDelete, onPhotoPress }: PhotoItemProps) => (
  <View style={styles.photoContainer}>
    <TouchableOpacity
      style={styles.photo}
      onPress={onPhotoPress}
      activeOpacity={0.8}>
      <Image source={{ uri: photo.uri }} style={styles.photoImage} />
    </TouchableOpacity>
    {isEditing && (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={onDelete}>
        <IconSymbol name="xmark.circle.fill" size={24} color={Colors.light.error} />
      </TouchableOpacity>
    )}
  </View>
);

export default function FolderScreen() {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const { id: folderId } = useLocalSearchParams<{ id: string }>();
  const { folders, savePhoto, deletePhoto, renameFolder, loadFolders } = useStorage();
  const router = useRouter();

  const folder = folders.find(f => f.id === folderId);

  useEffect(() => {
    if (folder) {
      setNewFolderName(folder.name);
    }
  }, [folder]);

  const handleRename = async () => {
    if (!folder || !newFolderName.trim() || newFolderName.trim() === folder.name) return;

    try {
      await renameFolder(folder.id, newFolderName.trim());
      setIsRenameModalVisible(false);
    } catch (error) {
      console.error('Error renaming folder:', error);
      Alert.alert('Erro', 'Não foi possível renomear a pasta');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status === 'granted') {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
        });

        if (!result.canceled && result.assets[0].uri) {
          await savePhoto(result.assets[0].uri, folderId);
          await loadFolders();
        }
        setShowOptionsModal(false);
      } else {
        Alert.alert('Permissão Necessária', 'Precisamos de permissão para acessar sua câmera');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        await savePhoto(result.assets[0].uri, folderId);
        await loadFolders();
      }
      setShowOptionsModal(false);
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    Alert.alert(
      'Apagar Foto',
      'Tem certeza que deseja apagar esta foto?',
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
              await deletePhoto(folderId, photoId);
              await loadFolders();
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert('Erro', 'Não foi possível excluir a foto');
            }
          },
        },
      ]
    );
  };

  if (!folder) {
    return (
      <View style={styles.container}>
        <Text style={SharedStyles.text}>Pasta não encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[SharedStyles.header, styles.header]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.titleContainer}
          onPress={() => {
            setNewFolderName(folder.name);
            setIsRenameModalVisible(true);
          }}>
          <Text style={SharedStyles.headerTitle}>{folder.name}</Text>
        </TouchableOpacity>

        {folder.photos.length > 0 && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowOptionsModal(true)}>
            <IconSymbol name="trash" size={24} color={Colors.light.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Modal de Renomear */}
      <Modal
        visible={isRenameModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsRenameModalVisible(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.modalInput}
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="Nome da pasta"
              placeholderTextColor={Colors.light.gray[400]}
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setIsRenameModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleRename}>
                <Text style={[styles.modalButtonText, { color: Colors.light.primary }]}>Renomear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ScrollView style={styles.content}>
        {folder.photos.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="photo" size={64} color={Colors.light.gray[400]} />
            <Text style={[SharedStyles.subtitle, styles.emptyStateText]}>
              Nenhuma foto ainda
            </Text>
            <Text style={SharedStyles.text}>
              Adicione fotos para começar
            </Text>
          </View>
        ) : (
          <View style={styles.photoGrid}>
            {folder.photos.map((photo, index) => (
              <PhotoItem
                key={photo.id}
                photo={photo}
                isEditing={false}
                onPress={() => setIsEditing(true)}
                onDelete={() => handleDeletePhoto(photo.id)}
                onPhotoPress={() => setSelectedImageIndex(index)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {!isRenameModalVisible && (
        <TouchableOpacity
          style={[SharedStyles.button, styles.fab]}
          onPress={() => setShowOptionsModal(true)}>
          <IconSymbol name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {showOptionsModal && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowOptionsModal(false)}>
          <View style={styles.optionsModalOverlay}>
            <View style={styles.optionsModalContent}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => {
                  handleTakePhoto();
                }}>
                <IconSymbol name="camera" size={24} color={Colors.light.primary} />
                <Text style={styles.optionText}>Tirar Foto</Text>
              </TouchableOpacity>

              <View style={styles.optionDivider} />

              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => {
                  handleSelectFromGallery();
                }}>
                <IconSymbol name="photo" size={24} color={Colors.light.primary} />
                <Text style={styles.optionText}>Escolher da Galeria</Text>
              </TouchableOpacity>

              <View style={styles.optionDivider} />

              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => setShowOptionsModal(false)}>
                <Text style={[styles.optionText, { color: Colors.light.error }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {selectedImageIndex !== null && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedImageIndex(null)}>
          <View style={styles.imageViewerContainer}>
            <ImageViewer
              imageUrls={[{ url: folder.photos[selectedImageIndex].uri }]}
              index={0}
              enableSwipeDown
              onSwipeDown={() => setSelectedImageIndex(null)}
              enablePreload
              saveToLocalByLongPress={false}
              renderHeader={() => (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedImageIndex(null)}>
                  <IconSymbol name="xmark" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              renderIndicator={() => null}
            />
          </View>
        </Modal>
      )}
    </View>
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
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  renameButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    marginTop: 16,
    marginBottom: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  photoContainer: {
    width: '44%',
    aspectRatio: 1,
    margin: '3%',
    position: 'relative',
  },
  photo: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.light.gray[200],
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    padding: 8,
    backgroundColor: Colors.light.background,
    borderRadius: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    padding: 0,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 2,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageCounter: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 16,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  optionsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  optionsModalContent: {
    backgroundColor: Colors.light.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    color: Colors.light.text,
    fontWeight: '500',
  },
  optionDivider: {
    height: 1,
    backgroundColor: Colors.light.gray[200],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalInput: {
    fontSize: 16,
    color: Colors.light.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.gray[300],
    paddingVertical: 12,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.light.gray[200],
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    borderRightWidth: 1,
    borderRightColor: Colors.light.gray[200],
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.text,
  },
});
