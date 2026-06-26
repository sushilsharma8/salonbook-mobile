import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

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
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={{ flex: 1, backgroundColor: '#fafaf9', paddingTop: 80, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#1c1917', marginBottom: 8 }}>
          Something went wrong
        </Text>
        <Text style={{ color: '#78716c', marginBottom: 16 }}>
          The screen failed to render. Details below:
        </Text>
        <ScrollView
          style={{ maxHeight: 320, backgroundColor: '#fff', borderRadius: 16, padding: 16 }}
        >
          <Text style={{ color: '#dc2626', fontWeight: '600', marginBottom: 8 }}>
            {error.name}: {error.message}
          </Text>
          {error.stack ? (
            <Text style={{ color: '#57534e', fontSize: 12 }}>{error.stack}</Text>
          ) : null}
        </ScrollView>
        <Pressable
          onPress={this.reset}
          style={{
            marginTop: 20,
            backgroundColor: '#1c1917',
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}
