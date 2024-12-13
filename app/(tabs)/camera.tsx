import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Modal } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { PhotoOptionsMenu } from '@/components/PhotoOptionsMenu';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

export default function CameraScreen() {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const router = useRouter();

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status === 'granted') {
        const result = await ImagePicker.launchCameraAsync({
          quality: 0.8,
          allowsEditing: true,
        });

        if (!result.canceled && result.assets[0].uri) {
          // Navega para a tela de seleção de pasta com a URI da foto
          router.push({
            pathname: "/(modals)/select-folder",
            params: { photoUri: result.assets[0].uri }
          });
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
        // Navega para a tela de seleção de pasta com a URI da foto
        router.push({
          pathname: "/(modals)/select-folder",
          params: { photoUri: result.assets[0].uri }
        });
      }
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <IconSymbol size={64} name="camera" color="#999" />
        <Text style={styles.title}>Adicionar Foto</Text>
        <Text style={styles.subtitle}>
          Tire uma nova foto ou selecione da galeria
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowOptionsModal(true)}>
          <IconSymbol size={24} name="plus" color="#FFFFFF" />
          <Text style={styles.buttonText}>Adicionar Foto</Text>
        </TouchableOpacity>
      </View>

      {showOptionsModal && (
        <PhotoOptionsMenu
          onTakePhoto={handleTakePhoto}
          onSelectFromGallery={handleSelectFromGallery}
          onClose={() => setShowOptionsModal(false)}
        />
      )}

      {Platform.OS === 'android' && (
        <Modal
          visible={showOptionsModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowOptionsModal(false)}>
          <TouchableOpacity
            style={styles.optionsOverlay}
            activeOpacity={1}
            onPress={() => setShowOptionsModal(false)}>
            <View style={styles.optionsContainer}>
              <PhotoOptionsMenu
                onTakePhoto={handleTakePhoto}
                onSelectFromGallery={handleSelectFromGallery}
                onClose={() => setShowOptionsModal(false)}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  optionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
