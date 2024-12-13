import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import { CircularProgressBase } from 'react-native-circular-progress-indicator';
import { useFocusEffect } from '@react-navigation/native';
import { useStorage, storageEmitter } from '@/hooks/useStorage';
import Colors from '@/constants/Colors';
import { SharedStyles } from '@/constants/Styles';
import { Ionicons } from '@expo/vector-icons';

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function StatsScreen() {
  const [totalSpace, setTotalSpace] = useState(0);
  const [usedSpace, setUsedSpace] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const { folders, loadFolders } = useStorage();
  const hasLoadedOnFocus = useRef(false);

  const loadStorageInfo = useCallback(async () => {
    try {
      setLoading(true);
      
      // Obtém informações do armazenamento total do dispositivo
      const totalMem = await FileSystem.getTotalDiskCapacityAsync();
      
      // Calcula um valor aproximado baseado no número de fotos (5MB por foto em média)
      const AVERAGE_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB em bytes
      const totalPhotos = folders.reduce((total, folder) => total + folder.photos.length, 0);
      const estimatedUsedSpace = totalPhotos * AVERAGE_PHOTO_SIZE;
      
      setTotalSpace(totalMem);
      setUsedSpace(estimatedUsedSpace);
      setLoading(false);
      setIsReloading(false);
    } catch (error) {
      console.error('Error loading storage info:', error);
      setLoading(false);
      setIsReloading(false);
    }
  }, [folders]);

  const handleReload = async () => {
    setIsReloading(true);
    await loadFolders();
    await loadStorageInfo();
  };

  // Atualiza apenas o número de pastas e fotos quando mudam
  useEffect(() => {
    if (!loading) {
      setIsReloading(false);
    }
  }, [folders, loading]);

  // Atualiza quando a tela recebe foco pela primeira vez
  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedOnFocus.current) {
        loadFolders();
        loadStorageInfo();
        hasLoadedOnFocus.current = true;
      }
    }, [loadFolders, loadStorageInfo])
  );

  const percentage = (usedSpace / totalSpace) * 100;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Calculando espaço...</Text>
      </SafeAreaView>
    );
  }

  const totalPhotos = folders.reduce((total, folder) => total + folder.photos.length, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Armazenamento</Text>
        <TouchableOpacity 
          style={styles.reloadButton} 
          onPress={handleReload}
          disabled={isReloading}
        >
          {isReloading ? (
            <ActivityIndicator size="small" color={Colors.light.primary} />
          ) : (
            <Ionicons 
              name="reload" 
              size={24} 
              color={Colors.light.primary} 
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <CircularProgressBase
          value={percentage}
          radius={80}
          duration={2000}
          activeStrokeWidth={12}
          inActiveStrokeWidth={12}
          activeStrokeColor={percentage > 90 ? Colors.light.error : Colors.light.primary}
          inActiveStrokeColor={Colors.light.gray[200]}
        />
        <View style={styles.statsInfo}>
          <Text style={[
            styles.usedSpace,
            percentage > 90 && { color: Colors.light.error }
          ]}>
            {formatBytes(usedSpace)}
          </Text>
          <Text style={styles.totalSpace}>
            de {formatBytes(totalSpace)}
          </Text>
          <Text style={[
            styles.percentageText,
            percentage > 90 && { color: Colors.light.error }
          ]}>
            {percentage.toFixed(1)}% utilizado
          </Text>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.detailTitle}>Detalhes do Armazenamento</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total de Pastas:</Text>
          <Text style={styles.detailValue}>{folders.length}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total de Fotos:</Text>
          <Text style={styles.detailValue}>{totalPhotos}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Utilizamos o armazenamento interno do seu dispositivo para maior agilidade e sem custos adicionais. 
          Toque no ícone de atualizar para ver as mudanças mais recentes.
        </Text>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  reloadButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  statsContainer: {
    alignItems: 'center',
  },
  statsInfo: {
    marginTop: 20,
    alignItems: 'center',
  },
  usedSpace: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  totalSpace: {
    fontSize: 16,
    color: Colors.light.gray[500],
    marginTop: 4,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.primary,
    marginTop: 8,
  },
  detailsContainer: {
    width: '100%',
    marginTop: 40,
    padding: 20,
    backgroundColor: Colors.light.gray[100],
    borderRadius: 12,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: Colors.light.gray[500],
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  infoContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 12,
    color: Colors.light.gray[500],
    textAlign: 'center',
    lineHeight: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.gray[500],
  },
});
