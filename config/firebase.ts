import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Web Firebase
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Native Firebase
import * as nativeFirebase from '@react-native-firebase/app';
import nativeAuth from '@react-native-firebase/auth';
import nativeFirestore from '@react-native-firebase/firestore';
import nativeStorage from '@react-native-firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAd8-Oe5xoJKeUt41LYeMSj-2S8S6QS7mc",
  authDomain: "myphotoclass-9fa50.firebaseapp.com",
  databaseURL: "https://myphotoclass-9fa50.firebaseio.com",
  projectId: "myphotoclass-9fa50",
  storageBucket: "myphotoclass-9fa50.firebasestorage.app",
  messagingSenderId: "19284633420",
  appId: "1:19284633420:android:034694682d58e5c1d611e9"
};

// Mock para o Expo Go
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: (callback: any) => {
    callback(null);
    return () => {};
  },
  signInWithEmailAndPassword: async () => {
    throw new Error('Auth não disponível no Expo Go');
  },
  createUserWithEmailAndPassword: async () => {
    throw new Error('Auth não disponível no Expo Go');
  },
  signOut: async () => {},
  sendPasswordResetEmail: async () => {
    throw new Error('Auth não disponível no Expo Go');
  },
};

const mockFirestore = {
  collection: () => ({
    doc: () => ({
      set: async () => {},
      get: async () => ({
        exists: false,
        data: () => null,
      }),
    }),
  }),
};

const mockStorage = {
  ref: () => ({
    put: async () => {},
    getDownloadURL: async () => '',
  }),
};

let app;
let auth: any;
let firestore;
let storage;

const isExpoGo = Constants.appOwnership === 'expo';

if (Platform.OS === 'web') {
  // Inicialização Web
  app = initializeApp(firebaseConfig);
  const webAuth = getAuth(app);
  
  // Wrapper para manter a mesma interface do RNFirebase
  auth = {
    currentUser: webAuth.currentUser,
    onAuthStateChanged: (callback: any) => onAuthStateChanged(webAuth, callback),
    signInWithEmailAndPassword: (email: string, password: string) => 
      signInWithEmailAndPassword(webAuth, email, password),
    createUserWithEmailAndPassword: (email: string, password: string) => 
      createUserWithEmailAndPassword(webAuth, email, password),
    signOut: () => signOut(webAuth),
    sendPasswordResetEmail: (email: string) => sendPasswordResetEmail(webAuth, email),
    updateUserProfile: async (displayName: string) => {
      if (webAuth.currentUser) {
        await updateProfile(webAuth.currentUser, { displayName });
        return true;
      }
      throw new Error('No user signed in');
    }
  };
  
  firestore = getFirestore(app);
  storage = getStorage(app);
} else if (isExpoGo) {
  // Mock para Expo Go
  app = {};
  auth = mockAuth;
  firestore = mockFirestore;
  storage = mockStorage;
} else {
  // Inicialização Nativa
  if (!nativeFirebase.apps.length) {
    app = nativeFirebase.initializeApp(firebaseConfig);
  } else {
    app = nativeFirebase.app();
  }
  auth = nativeAuth();
  firestore = nativeFirestore();
  storage = nativeStorage();

  // Configurações do Firestore (apenas nativo)
  firestore.settings({
    cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
    persistence: true,
  });

  // Configurações do Storage (apenas nativo)
  storage.setMaxUploadRetryTime(120000);
  storage.setMaxDownloadRetryTime(120000);
}

export { auth, firestore, storage };
