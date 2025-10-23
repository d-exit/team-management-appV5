/**
 * パフォーマンス監視と最適化ユーティリティ
 */

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observers: Set<(metrics: PerformanceMetrics) => void> = new Set();

  /**
   * ページロード時間を測定
   */
  measureLoadTime(): number {
    const loadTime = performance.now();
    const metric: PerformanceMetrics = {
      loadTime,
      renderTime: 0,
      timestamp: Date.now(),
    };
    
    this.metrics.push(metric);
    this.notifyObservers(metric);
    
    return loadTime;
  }

  /**
   * レンダリング時間を測定
   */
  measureRenderTime(componentName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime;
      const metric: PerformanceMetrics = {
        loadTime: 0,
        renderTime,
        timestamp: Date.now(),
      };
      
      this.metrics.push(metric);
      this.notifyObservers(metric);
      
      if (renderTime > 16) { // 60fpsの閾値
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  }

  /**
   * メモリ使用量を測定
   */
  measureMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return undefined;
  }

  /**
   * メトリクスの監視を開始
   */
  startMonitoring(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const metric: PerformanceMetrics = {
          loadTime: entry.startTime,
          renderTime: entry.duration,
          timestamp: Date.now(),
        };
        
        this.metrics.push(metric);
        this.notifyObservers(metric);
      }
    });

    observer.observe({ entryTypes: ['measure'] });
  }

  /**
   * オブザーバーを追加
   */
  addObserver(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.add(callback);
    
    return () => {
      this.observers.delete(callback);
    };
  }

  /**
   * オブザーバーに通知
   */
  private notifyObservers(metric: PerformanceMetrics): void {
    this.observers.forEach(callback => {
      try {
        callback(metric);
      } catch (error) {
        console.error('Performance observer error:', error);
      }
    });
  }

  /**
   * メトリクスを取得
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * メトリクスをクリア
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * 平均レンダリング時間を取得
   */
  getAverageRenderTime(): number {
    const renderTimes = this.metrics
      .filter(m => m.renderTime > 0)
      .map(m => m.renderTime);
    
    if (renderTimes.length === 0) return 0;
    
    return renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;
  }
}

/**
 * グローバルなパフォーマンスモニターインスタンス
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * パフォーマンス測定用のデコレーター
 */
export function measurePerformance(componentName: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      componentDidMount() {
        const endMeasure = performanceMonitor.measureRenderTime(componentName);
        try {
          // 親クラスのcomponentDidMountを呼び出し
          const prototype = Object.getPrototypeOf(this);
          if (prototype && typeof prototype.componentDidMount === 'function') {
            prototype.componentDidMount.call(this);
          }
        } catch (e) {
          // 親クラスにcomponentDidMountが存在しない場合
        }
        endMeasure();
      }
    };
  };
}

/**
 * 関数の実行時間を測定
 */
export function measureExecutionTime<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const startTime = performance.now();
    const result = fn(...args);
    const executionTime = performance.now() - startTime;
    
    if (executionTime > 100) { // 100ms以上の実行時間を警告
      console.warn(`Slow execution detected in ${name}: ${executionTime.toFixed(2)}ms`);
    }
    
    return result;
  }) as T;
}

/**
 * 遅延実行のためのユーティリティ
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout;
  
  return ((...args: Parameters<T>): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

/**
 * スロットリングのためのユーティリティ
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean;
  
  return ((...args: Parameters<T>): void => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
}

/**
 * リソース使用量の監視
 */
export function monitorResourceUsage(): () => void {
  const interval = setInterval(() => {
    const memoryUsage = performanceMonitor.measureMemoryUsage();
    if (memoryUsage && memoryUsage > 100) { // 100MB以上で警告
      console.warn(`High memory usage detected: ${memoryUsage.toFixed(2)}MB`);
    }
  }, 5000); // 5秒ごとにチェック
  
  return () => clearInterval(interval);
} 