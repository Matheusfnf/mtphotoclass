import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useFolders } from '@/hooks/useFolders';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Colors from '@/constants/Colors';

export default function StatsScreen() {
  const { folders, loading } = useFolders();

  const totalFolders = folders.length;
  const totalPhotos = folders.reduce((total, folder) => {
    const photos = folder.photos || [];
    return total + photos.length;
  }, 0);

  const stats = [
    {
      title: 'Total de Pastas',
      value: totalFolders,
      icon: 'folder',
      color: Colors.light.primary,
    },
    {
      title: 'Total de Fotos',
      value: totalPhotos,
      icon: 'photo',
      color: Colors.light.success,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Estatísticas</Text>
        <Text style={styles.subtitle}>
          Veja um resumo das suas fotos e pastas
        </Text>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
              <IconSymbol name={stat.icon} size={24} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>

      {folders.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Suas Pastas</Text>
          <View style={styles.folderList}>
            {folders.map((folder) => (
              <View key={folder.id} style={styles.folderItem}>
                <View style={styles.folderIcon}>
                  <IconSymbol name="folder.fill" size={24} color={Colors.light.primary} />
                </View>
                <View style={styles.folderInfo}>
                  <Text style={styles.folderName}>{folder.name}</Text>
                  <Text style={styles.folderCount}>
                    {folder.photos?.length || 0} {(folder.photos?.length || 0) === 1 ? 'foto' : 'fotos'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.gray[500],
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: Colors.light.gray[500],
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  folderList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  folderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 2,
  },
  folderCount: {
    fontSize: 14,
    color: Colors.light.gray[500],
  },
});
