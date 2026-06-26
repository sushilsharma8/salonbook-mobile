import { Platform } from 'react-native';

export type UploadImageFile = { uri: string; name: string; type: string };

/** React Native FormData file part — Android keeps file:// / content://; iOS strips file:// */
export function toReactNativeUploadFile(file: UploadImageFile): Blob {
  const uri =
    Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri;
  return {
    uri,
    name: file.name,
    type: file.type || 'image/jpeg',
  } as unknown as Blob;
}
