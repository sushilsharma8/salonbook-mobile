import { View } from 'react-native';

// ponytail: routing lives in AuthGate (useEffect) to avoid Fabric addViewAt races from <Redirect>.
export default function Index() {
  return <View style={{ flex: 1, backgroundColor: '#fafaf9' }} />;
}
