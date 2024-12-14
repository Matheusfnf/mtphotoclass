import Constants from 'expo-constants';

export function useExpoGo() {
  return Constants.appOwnership === 'expo';
}
