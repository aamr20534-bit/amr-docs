// Web Worker for offloading heavy binary/text computations
self.onmessage = (event: MessageEvent<{ id: string; type: 'wordCount' | 'ping'; payload?: string }>) => {
  const { id, type, payload } = event.data;
  if (type === 'ping') {
    self.postMessage({ id, result: 'pong' });
    return;
  }
  if (type === 'wordCount') {
    const text = payload || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    self.postMessage({ id, result: { words, chars } });
  }
};
