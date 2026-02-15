import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!usernameOrEmail.trim() || !password) {
      setError('Enter username/email and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(usernameOrEmail.trim(), password);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.logoWrap}>
        <Logo size={72} color="#0a0a0a" />
      </View>
      <Text style={styles.title}>TailorMade</Text>
      <Text style={styles.subtitle}>Manage your tailoring business</Text>

      <TextInput
        style={styles.input}
        placeholder="Username or email"
        value={usernameOrEmail}
        onChangeText={(t) => { setUsernameOrEmail(t); setError(''); }}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={(t) => { setPassword(t); setError(''); }}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.link}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.linkText}>Don’t have an account? Sign up</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoWrap: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '600', color: '#0a0a0a', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#737373', marginBottom: 32 },
  input: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#0a0a0a',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fafafa', fontSize: 16, fontWeight: '600' },
  link: { marginTop: 24 },
  linkText: { color: '#737373', fontSize: 15 },
  error: { color: '#b91c1c', marginTop: 8, textAlign: 'center', width: '100%', maxWidth: 320 },
});
