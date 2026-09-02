import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconWarning } from './icons/IconWarning';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../theme/tokens';

interface Props {
  children: React.ReactNode;
  colors: ThemeColors;
}

interface State {
  error: Error | null;
}

class ErrorBoundaryInner extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    const s = createStyles(this.props.colors);
    return (
      <SafeAreaView style={s.container}>
        <View style={s.content}>
          <IconWarning size={48} color={this.props.colors.danger} />
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

// classe não acessa hooks diretamente — este wrapper busca o tema e repassa por prop
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <ErrorBoundaryInner colors={colors}>{children}</ErrorBoundaryInner>;
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg, justifyContent: 'center' },
    content: { alignItems: 'center', paddingHorizontal: 32, gap: 16 },
    title: { color: c.textPrimary, fontSize: 20, fontWeight: '800', textAlign: 'center' },
    message: {
      color: c.textFaint,
      fontSize: 12,
      fontWeight: '500',
      textAlign: 'center',
      fontFamily: 'monospace',
      lineHeight: 18,
    },
    btn: {
      marginTop: 8,
      backgroundColor: c.accentSurfaceBorder,
      paddingHorizontal: 28,
      paddingVertical: 14,
      borderRadius: 14,
    },
    btnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  });
}
