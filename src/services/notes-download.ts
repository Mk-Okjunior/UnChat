import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export async function downloadNote(url: string, fileName: string) {
  const safeName = fileName.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_').trim() || 'note.pdf';

  if (Platform.OS === 'web') {
    const link = document.createElement('a');
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Imeshindikana kupakua faili.');
      const objectUrl = URL.createObjectURL(await response.blob());
      link.href = objectUrl;
      link.download = safeName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    return;
  }

  const folder = new Directory(Paths.cache, 'notes');
  if (!folder.exists) folder.create();
  const destination = new File(folder, safeName);
  if (destination.exists) destination.delete();
  let file: File;
  if (url.startsWith('data:')) {
    destination.create();
    await destination.write(await (await fetch(url)).text());
    file = destination;
  } else {
    file = await File.downloadFileAsync(url, destination);
  }

  try {
    await File.preview(file, { title: safeName });
  } catch {
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error('Faili imepakuliwa lakini app ya kuifungua au kushiriki haipatikani.');
    }
    await Sharing.shareAsync(file.uri, { dialogTitle: `Hifadhi ${safeName}` });
  }
}
