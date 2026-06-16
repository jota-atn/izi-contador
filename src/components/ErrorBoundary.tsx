import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconWarning } from './icons/IconWarning';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <SafeAreaView style={s.container}>
        <View style={s.content}>
          <IconWarning size={48} color="#f87171" />
          <Text style={s.title}>Algo deu errado</Text>
          <Text style={s.message}>{this.state.error.message}</Text>
          <TouchableOpacity style={s.btn} onPress={this.reset}>
            <Text style={s.btnText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', justifyContent: 'center' },
  content: { alignItems: 'center', paddingHorizontal: 32, gap: 16 },
  title: { color: '#f1f5f9', fontSize: 20, fontWeight: '800', textAlign: 'center' },
  message: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  btn: {
    marginTop: 8,
    backgroundColor: '#4c1d95',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
