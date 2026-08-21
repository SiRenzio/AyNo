import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/auth-context';
const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, primary: '#8b5cf6', background: '#080b14', card: '#0f1422', border: '#263149' } };
export default function RootLayout() { return <AuthProvider><ThemeProvider value={theme}><StatusBar style="light" /><Stack screenOptions={{ headerStyle: { backgroundColor: '#0f1422' }, headerTintColor: '#f8fafc', contentStyle: { backgroundColor: '#080b14' } }}><Stack.Screen name="index" options={{ headerShown: false }} /><Stack.Screen name="login" options={{ headerShown: false }} /><Stack.Screen name="register" options={{ headerShown: false }} /><Stack.Screen name="(tabs)" options={{ headerShown: false }} /><Stack.Screen name="events/[id]" options={{ title: 'Event details' }} /></Stack></ThemeProvider></AuthProvider>; }
