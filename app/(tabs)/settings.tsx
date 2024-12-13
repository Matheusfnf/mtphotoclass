import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();

  const SettingItem = ({ icon, title, subtitle, hasSwitch = false, hasChevron = true }) => (
    <TouchableOpacity style={styles.settingItem}>
      <View style={styles.settingContent}>
        <IconSymbol size={24} name={icon} color={Colors[colorScheme ?? 'light'].tint} />
        <View style={styles.settingTexts}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {hasSwitch && <Switch />}
      {hasChevron && (
        <IconSymbol size={20} name="chevron.right" color={Colors[colorScheme ?? 'light'].text} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backup e Sincronização</Text>
        <SettingItem
          icon="icloud"
          title="Backup Automático"
          subtitle="Sincronizar fotos com a nuvem"
          hasSwitch
          hasChevron={false}
        />
        <SettingItem
          icon="arrow.clockwise.icloud"
          title="Frequência do Backup"
          subtitle="Diário"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Segurança</Text>
        <SettingItem
          icon="lock"
          title="Proteção do App"
          subtitle="Usar senha ou biometria"
          hasSwitch
          hasChevron={false}
        />
        <SettingItem
          icon="hand.raised"
          title="Privacidade"
          subtitle="Gerenciar permissões"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aparência</Text>
        <SettingItem
          icon="moon"
          title="Tema Escuro"
          hasSwitch
          hasChevron={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.tint,
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTexts: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
