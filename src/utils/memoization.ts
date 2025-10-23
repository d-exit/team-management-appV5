/**
 * メモ化とパフォーマンス最適化ユーティリティ
 */

/**
 * シンプルなメモ化関数
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * LRUキャッシュ付きメモ化関数
 */
export function memoizeLRU<T extends (...args: any[]) => any>(
  fn: T,
  maxSize: number = 100,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      const result = cache.get(key)!;
      // LRU: 使用されたアイテムを最後に移動
      cache.delete(key);
      cache.set(key, result);
      return result;
    }
    
    const result = fn(...args);
    
    // キャッシュサイズ制限
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }
    
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * 時間制限付きメモ化関数
 */
export function memoizeWithTTL<T extends (...args: any[]) => any>(
  fn: T,
  ttl: number = 60000, // デフォルト1分
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    const now = Date.now();
    
    const cached = cache.get(key);
    if (cached && (now - cached.timestamp) < ttl) {
      return cached.value;
    }
    
    const result = fn(...args);
    cache.set(key, { value: result, timestamp: now });
    return result;
  }) as T;
}

/**
 * 弱参照キャッシュ付きメモ化関数
 */
export function memoizeWeak<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new WeakMap<object, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    const keyObj = { key };
    
    if (cache.has(keyObj)) {
      return cache.get(keyObj)!;
    }
    
    const result = fn(...args);
    cache.set(keyObj, result);
    return result;
  }) as T;
}

/**
 * デバウンス付きメモ化関数
 */
export function memoizeDebounced<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  const timeouts = new Map<string, NodeJS.Timeout>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    // 既存のタイムアウトをクリア
    if (timeouts.has(key)) {
      clearTimeout(timeouts.get(key)!);
    }
    
    // キャッシュに値がある場合は即座に返す
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    // 新しいタイムアウトを設定
    const timeout = setTimeout(() => {
      const result = fn(...args);
      cache.set(key, result);
      timeouts.delete(key);
    }, delay);
    
    timeouts.set(key, timeout);
    
    // 即座に実行して結果を返す
    return fn(...args);
  }) as T;
}

/**
 * 条件付きメモ化関数
 */
export function memoizeConditional<T extends (...args: any[]) => any>(
  fn: T,
  shouldCache: (...args: Parameters<T>) => boolean,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    if (!shouldCache(...args)) {
      return fn(...args);
    }
    
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * キャッシュクリア関数
 */
export function createCacheManager() {
  const caches = new Set<Map<any, any>>();
  
  return {
    addCache: <K, V>(cache: Map<K, V>) => {
      caches.add(cache);
    },
    clearAll: () => {
      caches.forEach(cache => cache.clear());
    },
    getStats: () => {
      const stats = Array.from(caches).map(cache => ({
        size: cache.size,
        keys: Array.from(cache.keys()),
      }));
      return stats;
    },
  };
} 