import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { IconSymbol } from './ui/IconSymbol';

interface PhotoOptionsMenuProps {
  onTakePhoto: () => void;
  onSelectFromGallery: () => void;
  onClose: () => void;
}

export function PhotoOptionsMenu({
  onTakePhoto,
  onSelectFromGallery,
  onClose,
}: PhotoOptionsMenuProps) {
  useEffect(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Tirar Foto', 'Escolher da Galeria'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            onTakePhoto();
          } else if (buttonIndex === 2) {
            onSelectFromGallery();
          }
        }
      );
    }
  }, []);

  // No iOS, não renderizamos nada visualmente
  if (Platform.OS === 'ios') {
    return null;
  }

  // No Android, mostramos o menu personalizado
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.option}
        onPress={() => {
          onTakePhoto();
          onClose();
        }}>
        <IconSymbol name="camera" size={24} color="#007AFF" />
        <Text style={styles.optionText}>Tirar Foto</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.option}
        onPress={() => {
          onSelectFromGallery();
          onClose();
        }}>
        <IconSymbol name="photo.on.rectangle" size={24} color="#007AFF" />
        <Text style={styles.optionText}>Escolher da Galeria</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#007AFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
});
