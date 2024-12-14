import Toast, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import Colors from '@/constants/Colors';

const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: Colors.light.success,
        backgroundColor: Colors.light.background,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
      }}
      text2Style={{
        fontSize: 14,
        color: Colors.light.gray[600],
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: Colors.light.error,
        backgroundColor: Colors.light.background,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
      }}
      text2Style={{
        fontSize: 14,
        color: Colors.light.gray[600],
      }}
    />
  ),
};

export const showToast = (type: 'success' | 'error', title: string, message?: string) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 50,
  });
};

export const ToastProvider = () => <Toast config={toastConfig} />;
