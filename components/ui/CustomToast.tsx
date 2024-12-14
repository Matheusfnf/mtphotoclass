import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

const { width } = Dimensions.get('window');

interface ToastProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
  onHide: () => void;
}

export function CustomToast({ visible, message, type, onHide }: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }
  }, [visible]);

  if (!visible) return null;

  const backgroundColor = type === 'success' ? Colors.light.success : Colors.light.error;
  const icon = type === 'success' ? 'checkmark-circle' : 'alert-circle';

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }], backgroundColor },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={icon} size={24} color="white" />
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={onHide}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 999,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  message: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    marginHorizontal: 12,
  },
});
