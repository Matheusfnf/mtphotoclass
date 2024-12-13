import React, { useState } from 'react';
import { StyleSheet, View, TextInput, FlatList, Text } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults] = useState<any[]>([]); // Será implementado com dados reais

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <IconSymbol
          size={20}
          name="magnifyingglass"
          color={Colors.light.text}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar fotos, pastas ou tags..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {searchResults.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol size={48} name="photo.stack" color={Colors.light.tint} />
          <Text style={styles.emptyStateTitle}>Nenhum resultado encontrado</Text>
          <Text style={styles.emptyStateSubtitle}>
            Tente buscar por nome da pasta, tag ou data da foto
          </Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={({ item }) => <Text>{item.name}</Text>}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    margin: 16,
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
