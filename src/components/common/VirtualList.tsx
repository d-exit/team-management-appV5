import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscanCount?: number;
  className?: string;
}

/**
 * 仮想リストコンポーネント
 */
export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscanCount = 5,
  className = '',
}: VirtualListProps<T>) {
  const listRef = useRef<List>(null);

  const itemData = useMemo(() => ({ items, renderItem }), [items, renderItem]);

  const ItemRenderer = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const item = items[index];
      return (
        <div style={style}>
          {renderItem(item, index)}
        </div>
      );
    },
    [items, renderItem]
  );

  return (
    <div style={{ height }} className={className}>
      <AutoSizer>
        {({ height: autoHeight, width }) => (
          <List
            ref={listRef}
            height={autoHeight}
            itemCount={items.length}
            itemSize={itemHeight}
            itemData={itemData}
            overscanCount={overscanCount}
            width={width}
          >
            {ItemRenderer}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}

/**
 * 無限スクロール仮想リスト
 */
interface InfiniteVirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  className?: string;
}

export function InfiniteVirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  onLoadMore,
  hasMore,
  loading,
  className = '',
}: InfiniteVirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const listRef = useRef<List>(null);

  const handleScroll = useCallback(
    ({ scrollOffset }: { scrollOffset: number }) => {
      setScrollTop(scrollOffset);
      
      // スクロールが下部に近づいたら追加読み込み
      const maxScrollTop = items.length * itemHeight - height;
      if (hasMore && !loading && scrollOffset >= maxScrollTop - height) {
        onLoadMore();
      }
    },
    [items.length, itemHeight, height, hasMore, loading, onLoadMore]
  );

  const ItemRenderer = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const item = items[index];
      return (
        <div style={style}>
          {renderItem(item, index)}
        </div>
      );
    },
    [items, renderItem]
  );

  return (
    <div style={{ height }} className={className}>
      <AutoSizer>
        {({ height: autoHeight, width }) => (
          <List
            ref={listRef}
            height={autoHeight}
            itemCount={items.length}
            itemSize={itemHeight}
            onScroll={handleScroll}
            width={width}
          >
            {ItemRenderer}
          </List>
        )}
      </AutoSizer>
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        </div>
      )}
    </div>
  );
} 