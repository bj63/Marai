"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type VirtualFeedItem = { id: string };

export type VirtualFeedListProps<TItem extends VirtualFeedItem> = {
  items: TItem[];
  renderItem: (item: TItem) => React.ReactNode;
  estimatedItemHeight?: number;
  overscanPx?: number;
  onEndReached?: () => void;
};

type Measurement = { id: string; height: number; offset: number };

type ViewportState = { height: number; scrollTop: number };

function useViewport(containerRef: React.RefObject<HTMLDivElement>) {
  const [viewport, setViewport] = useState<ViewportState>({ height: 0, scrollTop: 0 });

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const handleScroll = () => {
      setViewport({ height: node.clientHeight, scrollTop: node.scrollTop });
    };

    handleScroll();
    node.addEventListener("scroll", handleScroll);

    const handleResize = () => handleScroll();
    window.addEventListener("resize", handleResize);

    return () => {
      node.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [containerRef]);

  return viewport;
}

function MeasuredRow({
  id,
  offset,
  onMeasure,
  children,
}: {
  id: string;
  offset: number;
  onMeasure: (id: string, height: number) => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const measure = () => {
      const nextHeight = node.getBoundingClientRect().height;
      onMeasure(id, nextHeight);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);

    return () => observer.disconnect();
  }, [id, onMeasure]);

  return (
    <div ref={ref} style={{ position: "absolute", top: offset, left: 0, right: 0 }}>
      {children}
    </div>
  );
}

export function VirtualFeedList<TItem extends VirtualFeedItem>({
  items,
  renderItem,
  estimatedItemHeight = 320,
  overscanPx = 600,
  onEndReached,
}: VirtualFeedListProps<TItem>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heightsRef = useRef<Map<string, number>>(new Map());
  const [heightVersion, setHeightVersion] = useState(0);
  const viewport = useViewport(containerRef);
  const endRequestInFlight = useRef(false);

  const measurements = useMemo(() => {
    const version = heightVersion;
    let offset = 0;
    const entries: Measurement[] = items.map((item) => {
      const height = heightsRef.current.get(item.id) ?? estimatedItemHeight;
      const measurement = { id: item.id, height, offset };
      offset += height;
      return measurement;
    });

    return { entries, totalHeight: offset + version * 0 };
  }, [items, estimatedItemHeight, heightVersion]);

  const { start, end } = useMemo(() => {
    const startOffset = Math.max(0, viewport.scrollTop - overscanPx);
    const endOffset = viewport.scrollTop + viewport.height + overscanPx;

    let startIndex = 0;
    while (
      startIndex < measurements.entries.length &&
      measurements.entries[startIndex].offset + measurements.entries[startIndex].height < startOffset
    ) {
      startIndex += 1;
    }

    let endIndex = startIndex;
    while (endIndex < measurements.entries.length && measurements.entries[endIndex].offset < endOffset) {
      endIndex += 1;
    }

    return { start: startIndex, end: endIndex };
  }, [measurements.entries, viewport.height, viewport.scrollTop, overscanPx]);

  const handleMeasure = useCallback((id: string, height: number) => {
    const prev = heightsRef.current.get(id);
    if (prev !== height) {
      heightsRef.current.set(id, height);
      setHeightVersion((version) => version + 1);
    }
  }, []);

  useEffect(() => {
    if (!onEndReached || endRequestInFlight.current) return;
    const nearEnd = viewport.scrollTop + viewport.height >= measurements.totalHeight - overscanPx;
    if (nearEnd) {
      endRequestInFlight.current = true;
      Promise.resolve(onEndReached()).finally(() => {
        endRequestInFlight.current = false;
      });
    }
  }, [measurements.totalHeight, onEndReached, overscanPx, viewport.height, viewport.scrollTop]);

  return (
    <div ref={containerRef} className="feed-viewport" aria-label="Feed viewport" role="feed">
      <div style={{ position: "relative", height: measurements.totalHeight }}>
        {items.slice(start, end).map((item, index) => {
          const measurement = measurements.entries[start + index];
          return (
            <MeasuredRow key={item.id} id={item.id} offset={measurement?.offset ?? 0} onMeasure={handleMeasure}>
              {renderItem(item)}
            </MeasuredRow>
          );
        })}
      </div>
    </div>
  );
}
