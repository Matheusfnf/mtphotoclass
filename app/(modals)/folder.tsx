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
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import ImageViewer from 'react-native-image-zoom-viewer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useFolders } from '@/hooks/useFolders';
import { usePhotos } from '@/hooks/usePhotos';
import Colors from '@/constants/Colors';
import { SharedStyles } from '@/constants/Styles';
import { Database } from '@/lib/database.types';

type Photo = Database['public']['Tables']['photos']['Row'];

type PhotoItemProps = {
  photo: Photo;
  isEditing: boolean;
  onDelete: () => void;
  onPress: () => void;
};

const PhotoItem = ({ photo, isEditing, onDelete, onPress }: PhotoItemProps) => (
  <View style={styles.photoContainer}>
    <TouchableOpacity
      style={styles.photo}
      onPress={onPress}
      activeOpacity={0.8}>
      <Image source={{ uri: photo.image_url }} style={styles.photoImage} />
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
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(-1);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const { folders, updateFolder } = useFolders();
  const { loading, getPhotos, uploadPhoto, deletePhoto } = usePhotos();
  const [photos, setPhotos] = useState<Photo[]>([]);

  const folder = folders.find(f => f.id === id);

  useEffect(() => {
    if (folder) {
      setNewName(folder.name);
      loadPhotos();
    }
  }, [folder]);

  const loadPhotos = async () => {
    if (id) {
      const folderPhotos = await getPhotos(id);
      setPhotos(folderPhotos);
    }
  };

  const handleRename = async () => {
    if (!folder || !newName.trim()) return;

    try {
      await updateFolder(folder.id, newName.trim());
      setIsRenaming(false);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível renomear a pasta');
    }
  };

  const handleTakePhoto = async () => {
    if (!folder) return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua câmera.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const photo = await uploadPhoto(result.assets[0].uri, folder.id);
        setPhotos(prev => [photo, ...prev]);
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível adicionar a foto');
    }
  };

  const handleSelectFromGallery = async () => {
    if (!folder) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria de fotos.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const photo = await uploadPhoto(result.assets[0].uri, folder.id);
        setPhotos(prev => [photo, ...prev]);
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível adicionar a foto');
    }
  };

  const handleDeletePhoto = async (photo: Photo) => {
    try {
      await deletePhoto(photo);
      setPhotos(prev => prev.filter(p => p.id !== photo.id));
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível deletar a foto');
    }
  };

  if (!folder) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={Colors.light.text} />
        </TouchableOpacity>

        {isRenaming ? (
          <View style={styles.renameContainer}>
            <TextInput
              style={styles.renameInput}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              onBlur={() => {
                handleRename();
                setIsRenaming(false);
              }}
              onSubmitEditing={handleRename}
            />
          </View>
        ) : (
          <TouchableOpacity style={styles.titleContainer} onPress={() => setIsRenaming(true)}>
            <Text style={styles.title}>{folder.name}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowOptionsMenu(true)}>
            <IconSymbol name="plus.circle.fill" size={24} color={Colors.light.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, isEditing && styles.headerButtonActive]}
            onPress={() => setIsEditing(!isEditing)}>
            <IconSymbol 
              name="trash" 
              size={24} 
              color={isEditing ? Colors.light.error : Colors.light.gray[400]} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="photo" size={64} color={Colors.light.gray[400]} />
          <Text style={styles.emptyText}>Nenhuma foto nesta pasta</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowOptionsMenu(true)}>
            <Text style={styles.addButtonText}>Adicionar Foto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.photosGrid}>
          {photos.map((photo, index) => (
            <PhotoItem
              key={photo.id}
              photo={photo}
              isEditing={isEditing}
              onDelete={() => handleDeletePhoto(photo)}
              onPress={() => {
                setSelectedPhotoIndex(index);
                setIsImageViewerVisible(true);
              }}
            />
          ))}
        </ScrollView>
      )}

      <Modal
        visible={showOptionsMenu}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOptionsMenu(false)}>
        <TouchableOpacity 
          style={styles.optionsModalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsMenu(false)}>
          <View style={styles.optionsModalContent}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleTakePhoto}>
              <IconSymbol name="camera" size={24} color={Colors.light.primary} />
              <Text style={styles.optionText}>Tirar Foto</Text>
            </TouchableOpacity>

            <View style={styles.optionDivider} />

            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleSelectFromGallery}>
              <IconSymbol name="photo" size={24} color={Colors.light.primary} />
              <Text style={styles.optionText}>Escolher da Galeria</Text>
            </TouchableOpacity>

            <View style={styles.optionDivider} />

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => setShowOptionsMenu(false)}>
              <IconSymbol name="xmark" size={24} color={Colors.light.error} />
              <Text style={[styles.optionText, { color: Colors.light.error }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={isImageViewerVisible}
        transparent
        onRequestClose={() => setIsImageViewerVisible(false)}>
        <ImageViewer
          imageUrls={photos.map(photo => ({ url: photo.image_url }))}
          index={selectedPhotoIndex}
          onCancel={() => setIsImageViewerVisible(false)}
          enableSwipeDown
          onSwipeDown={() => setIsImageViewerVisible(false)}
        />
      </Modal>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.gray[200],
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  headerButtonActive: {
    backgroundColor: Colors.light.error,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  renameContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  renameInput: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    padding: 8,
    backgroundColor: Colors.light.gray[100],
    borderRadius: 8,
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
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '600',
  },
  photosGrid: {
    padding: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoContainer: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 4,
  },
  photo: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.light.white,
    borderRadius: 12,
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
});
