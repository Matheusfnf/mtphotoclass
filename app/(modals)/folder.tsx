import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStorage } from '@/hooks/useStorage';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { PhotoOptionsMenu } from '@/components/PhotoOptionsMenu';
import * as ImagePicker from 'expo-image-picker';
import ImageView from 'react-native-image-viewing';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PHOTO_SIZE = (SCREEN_WIDTH - 32) / 3;

interface PhotoItemProps {
  photo: {
    id: string;
    uri: string;
  };
  isEditing: boolean;
  onPress: () => void;
  onDelete: () => void;
  onPhotoPress: () => void;
}

const PhotoItem = ({ photo, isEditing, onPress, onDelete, onPhotoPress }: PhotoItemProps) => {
  const scale = useSharedValue(1);
  const deleteScale = useSharedValue(1);

  const springConfig = {
    damping: 10,
    stiffness: 100,
    mass: 0.5,
  };

  React.useEffect(() => {
    if (isEditing) {
      deleteScale.value = withSpring(1, springConfig);
      scale.value = withSpring(1.02, springConfig);
    } else {
      deleteScale.value = withTiming(0, { duration: 200 });
      scale.value = withSpring(1, springConfig);
    }
  }, [isEditing]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const deleteButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: deleteScale.value }],
    opacity: deleteScale.value,
  }));

  return (
    <Animated.View style={[styles.photoContainer, animatedStyle]}>
      <TouchableOpacity
        onPress={isEditing ? onPress : onPhotoPress}
        onLongPress={onPress}
        delayLongPress={400}
        activeOpacity={0.7}>
        <Image source={{ uri: photo.uri }} style={styles.photo} />
        {isEditing && (
          <Animated.View style={[styles.deleteButton, deleteButtonStyle]}>
            <TouchableOpacity
              onPress={onDelete}
              style={styles.deleteButtonTouchable}>
              <IconSymbol name="minus.circle.fill" size={28} color="#FF3B30" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function FolderScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const folderId = params.id;
  const { folders, savePhoto, deletePhoto, reloadFolders } = useStorage();
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(-1);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const folder = folders.find(f => f.id === folderId);

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status === 'granted') {
        const result = await ImagePicker.launchCameraAsync({
          quality: 0.8,
          allowsEditing: true,
        });

        if (!result.canceled && result.assets[0].uri) {
          await savePhoto(result.assets[0].uri, folderId);
          reloadFolders();
          setShowOptionsModal(false);
        }
      } else {
        alert('Precisamos de permissão para acessar sua câmera');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0].uri) {
        await savePhoto(result.assets[0].uri, folderId);
        reloadFolders();
        setShowOptionsModal(false);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
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
              reloadFolders();
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
        <Text>Pasta não encontrada</Text>
      </View>
    );
  }

  const images = folder.photos.map(photo => ({ uri: photo.uri }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.title}>{folder.name}</Text>
        {folder.photos.length > 0 && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}>
            <Text style={styles.editButtonText}>
              {isEditing ? 'Concluído' : 'Editar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {folder.photos.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="photo" size={64} color="#999" />
          <Text style={styles.emptyStateText}>Nenhuma foto ainda</Text>
          <Text style={styles.emptyStateSubtext}>
            Adicione fotos para começar
          </Text>
        </View>
      ) : (
        <View style={styles.photoGrid}>
          {folder.photos.map((photo, index) => (
            <PhotoItem
              key={photo.id}
              photo={photo}
              isEditing={isEditing}
              onPress={() => setIsEditing(true)}
              onDelete={() => handleDeletePhoto(photo.id)}
              onPhotoPress={() => setSelectedPhotoIndex(index)}
            />
          ))}
        </View>
      )}

      {!isEditing && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowOptionsModal(true)}>
          <IconSymbol name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {showOptionsModal && (
        <PhotoOptionsMenu
          onTakePhoto={handleTakePhoto}
          onSelectFromGallery={handleSelectFromGallery}
          onClose={() => setShowOptionsModal(false)}
        />
      )}

      <ImageView
        images={images}
        imageIndex={selectedPhotoIndex}
        visible={selectedPhotoIndex >= 0}
        onRequestClose={() => setSelectedPhotoIndex(-1)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
        presentationStyle="overFullScreen"
        animationType="fade"
        HeaderComponent={({ imageIndex }) => (
          <View style={styles.imageViewerHeader}>
            <TouchableOpacity
              onPress={() => setSelectedPhotoIndex(-1)}
              style={styles.closeButton}>
              <IconSymbol name="xmark" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.imageCounter}>
              {imageIndex + 1} de {images.length}
            </Text>
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  photoGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    padding: 4,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: -4,
    left: 0,
    width: 28,
    height: 28,
    zIndex: 1,
    margin: 8,
  },
  deleteButtonTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  imageViewerHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 0,
    left: 0,
    right: 0,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  imageCounter: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
