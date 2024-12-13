import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Modal, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';

export default function CameraScreen() {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const router = useRouter();

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status === 'granted') {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
        });

        if (!result.canceled && result.assets[0].uri) {
          router.push({
            pathname: "/(modals)/select-folder",
            params: { photoUri: result.assets[0].uri }
          });
        }
      } else {
        Alert.alert('Permissão Necessária', 'Precisamos de permissão para acessar sua câmera');
      }
      setShowOptionsModal(false);
    } catch (error) {
      console.error('Error taking photo:', error);
      setShowOptionsModal(false);
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        router.push({
          pathname: "/(modals)/select-folder",
          params: { photoUri: result.assets[0].uri }
        });
      }
      setShowOptionsModal(false);
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
      setShowOptionsModal(false);
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

      <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}>
        <View style={styles.optionsModalOverlay}>
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
              onPress={() => setShowOptionsModal(false)}>
              <Text style={[styles.optionText, { color: Colors.light.error }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
