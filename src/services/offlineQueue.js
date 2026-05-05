import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

const key = "tala_mobile_offline_reports";
const photoDir = `${FileSystem.documentDirectory}offline-reports/`;

async function readQueue() {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

async function writeQueue(items) {
  await AsyncStorage.setItem(key, JSON.stringify(items));
}

async function persistImage(image) {
  if (!image?.uri) return null;
  try {
    await FileSystem.makeDirectoryAsync(photoDir, { intermediates: true }).catch(() => {});
    const extension = image.uri.split(".").pop()?.split("?")[0] || "jpg";
    const target = `${photoDir}${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
    await FileSystem.copyAsync({ from: image.uri, to: target });
    return {
      ...image,
      uri: target
    };
  } catch {
    return image;
  }
}

export async function saveOfflineReport(payload) {
  const items = await readQueue();
  const image = await persistImage(payload.image);
  const nextItem = {
    id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    createdAt: new Date().toISOString(),
    payload: { ...payload, image }
  };
  await writeQueue([nextItem, ...items]);
  return nextItem;
}

export async function listOfflineReports() {
  return readQueue();
}

export async function syncOfflineReports(sendPayload) {
  const items = await readQueue();
  const failed = [];
  const synced = [];

  for (const item of items) {
    try {
      await sendPayload(item.payload);
      synced.push(item.id);
    } catch (error) {
      failed.push({ ...item, lastError: error.message });
    }
  }

  await writeQueue(failed);
  return { total: items.length, synced, failed };
}
