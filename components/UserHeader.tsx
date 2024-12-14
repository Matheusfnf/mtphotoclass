import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import Colors from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export function UserHeader() {
  const [modalVisible, setModalVisible] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await logout();
      router.replace('/(auth)');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.userButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="person-circle-outline" size={24} color={Colors.light.text} />
          <Text style={styles.userName}>Olá, {user?.displayName || 'Usuário'}</Text>
          <Ionicons name="chevron-down" size={20} color={Colors.light.text} />
        </TouchableOpacity>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.userInfo}>
                <Ionicons name="person-circle-outline" size={48} color={Colors.light.text} />
                <Text style={styles.userEmail}>{user?.email}</Text>
              </View>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setModalVisible(false);
                  handleSignOut();
                }}
              >
                <Ionicons name="log-out-outline" size={24} color={Colors.light.error} />
                <Text style={[styles.menuItemText, { color: Colors.light.error }]}>
                  Sair
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.light.background,
  },
  container: {
    padding: 16,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.gray[200],
  },
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    marginTop: 60,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  userInfo: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.gray[200],
  },
  userEmail: {
    fontSize: 14,
    color: Colors.light.gray[600],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  menuItemText: {
    fontSize: 16,
  },
});
