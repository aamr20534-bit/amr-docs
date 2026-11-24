import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { blobToBase64, downloadBlob } from './fileHelpers';

export function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

export async function initCapacitorUI(isDark: boolean): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Dark });
    await StatusBar.setBackgroundColor({ color: isDark ? '#06121E' : '#0F2942' });
    await SplashScreen.hide();
  } catch {
    // Ignore when plugin not available in browser
  }
}

export function registerAndroidBackHandler(onBack: () => boolean): () => void {
  if (!Capacitor.isNativePlatform()) return () => {};
  let removeFn: (() => void) | undefined;
  CapApp.addListener('backButton', ({ canGoBack }) => {
    const handled = onBack();
    if (!handled && !canGoBack) {
      CapApp.exitApp();
    }
  }).then((handle) => {
    removeFn = () => handle.remove();
  });
  return () => {
    if (removeFn) removeFn();
  };
}

export async function exportFileToDevice(blob: Blob, filename: string): Promise<string> {
  if (!Capacitor.isNativePlatform()) {
    downloadBlob(blob, filename);
    return filename;
  }
  const base64Data = await blobToBase64(blob);
  const result = await Filesystem.writeFile({
    path: `Download/${filename}`,
    data: base64Data,
    directory: Directory.ExternalStorage,
    recursive: true,
  });
  return result.uri;
}

export async function shareDocumentFile(blob: Blob, filename: string, title: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const base64Data = await blobToBase64(blob);
    const saved = await Filesystem.writeFile({
      path: filename,
      data: base64Data,
      directory: Directory.Cache,
    });
    await Share.share({
      title,
      text: `${title} - AMR DOCS`,
      url: saved.uri,
      dialogTitle: title,
    });
    return;
  }

  const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' });
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title,
      files: [file],
    });
  } else {
    downloadBlob(blob, filename);
  }
}
