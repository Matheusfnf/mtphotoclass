import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { validateEmail, validatePassword, validateName } from '@/utils/validation';
import { useToast } from '@/contexts/ToastContext';

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const validateForm = () => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      showToast(emailValidation.message!, 'error');
      return false;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      showToast(passwordValidation.message!, 'error');
      return false;
    }

    if (isSignUp) {
      const nameValidation = validateName(name);
      if (!nameValidation.isValid) {
        showToast(nameValidation.message!, 'error');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (isSignUp) {
        await register(email, password);
        showToast('Conta criada com sucesso!', 'success');
        setIsSignUp(false);
        setEmail('');
        setPassword('');
      } else {
        await login(email, password);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Minhas Pastas</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? 'Crie sua conta' : 'Entre na sua conta'}
            </Text>
          </View>

          <View style={styles.form}>
            {isSignUp && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Nome"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  placeholderTextColor={Colors.light.gray[400]}
                />
                <Ionicons name="person-outline" size={20} color={Colors.light.gray[400]} style={styles.inputIcon} />
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor={Colors.light.gray[400]}
              />
              <Ionicons name="mail-outline" size={20} color={Colors.light.gray[400]} style={styles.inputIcon} />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={Colors.light.gray[400]}
              />
              <Ionicons name="lock-closed-outline" size={20} color={Colors.light.gray[400]} style={styles.inputIcon} />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUp ? 'Criar conta' : 'Entrar'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                setIsSignUp(!isSignUp);
                setName('');
                setEmail('');
                setPassword('');
              }}>
              <Text style={styles.switchButtonText}>
                {isSignUp
                  ? 'Já tem uma conta? Entre aqui'
                  : 'Não tem uma conta? Crie aqui'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.light.text,
    opacity: 0.8,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.gray[100],
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: Colors.light.text,
  },
  inputIcon: {
    marginLeft: 8,
  },
  button: {
    backgroundColor: Colors.light.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchButtonText: {
    color: Colors.light.primary,
    fontSize: 14,
  },
});

export default LoginScreen;
