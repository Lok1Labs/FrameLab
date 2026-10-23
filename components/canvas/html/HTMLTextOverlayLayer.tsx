'use client';

import { useRef, useState, useCallback } from 'react';
import { getFontCSS } from '@/lib/constants/fonts';
import type { TextOverlay } from '@/lib/store';

export function getDraggedTextPosition(
  start: TextOverlay['position'], deltaX: number, deltaY: number, width: number, height: number,
): TextOverlay['position'] {
  if (width <= 0 || height <= 0) return start;
  return {
    x: Math.min(100, Math.max(0, start.x + deltaX / width * 100)),
    y: Math.min(100, Math.max(0, start.y + deltaY / height * 100)),
  };
}

interface HTMLTextOverlayLayerProps {
  textOverlays: TextOverlay[];
  canvasW: number;
  canvasH: number;
  selectedTextId: string | null;
  setSelectedTextId: (id: string | null) => void;
  setSelectedOverlayId: (id: string | null) => void;
  setIsMainImageSelected: (selected: boolean) => void;
  updateTextOverlay: (id: string, updates: Partial<TextOverlay>) => void;
}

interface DraggableTextProps {
  overlay: TextOverlay;
  canvasW: number;
  canvasH: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<TextOverlay>) => void;
}

function DraggableText({
  overlay,
  canvasW,
  canvasH,
  isSelected,
  onSelect,
  onUpdate,
}: DraggableTextProps) {
  const drag = useRef<{ x: number; y: number; position: TextOverlay["position"] } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Convert percentage position to pixels
  const textX = (overlay.position.x / 100) * canvasW;
  const textY = (overlay.position.y / 100) * canvasH;

  // Build text shadow CSS
  const textShadow = overlay.textShadow?.enabled
    ? `${overlay.textShadow.offsetX}px ${overlay.textShadow.offsetY}px ${overlay.textShadow.blur}px ${overlay.textShadow.color}`
    : undefined;

  if (!overlay.isVisible) return null;

  return (
    <div
      data-text-overlay-id={overlay.id}
      data-export-clean-outline={isSelected ? 'true' : undefined}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { x: event.clientX, y: event.clientY, position: overlay.position };
        setIsDragging(true);
        onSelect();
      }}
      onPointerMove={(event) => {
        if (!drag.current) return;
        const bounds = event.currentTarget.parentElement!.getBoundingClientRect();
        onUpdate({ position: getDraggedTextPosition(
          drag.current.position,
          event.clientX - drag.current.x,
          event.clientY - drag.current.y,
          bounds.width,
          bounds.height,
        ) });
      }}
      onPointerUp={() => { drag.current = null; setIsDragging(false); }}
      onPointerCancel={() => { drag.current = null; setIsDragging(false); }}
      onLostPointerCapture={() => { drag.current = null; setIsDragging(false); }}
      style={{
        position: 'absolute',
        left: `${textX}px`,
        top: `${textY}px`,
        transform: 'translate(-50%, -50%)',
        fontSize: `${overlay.fontSize}px`,
        fontWeight: overlay.fontWeight.includes('bold') ? 'bold' : overlay.fontWeight === 'italic' ? 'normal' : overlay.fontWeight,
        fontStyle: overlay.fontWeight.includes('italic') ? 'italic' : 'normal',
        fontFamily: getFontCSS(overlay.fontFamily),
        color: overlay.color,
        opacity: overlay.opacity,
        textShadow,
        whiteSpace: 'pre',
        lineHeight: 1.2,
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        writingMode: overlay.orientation === 'vertical' ? 'vertical-rl' : 'horizontal-tb',
        outline: isSelected ? '2px solid rgba(59, 130, 246, 0.5)' : 'none',
        outlineOffset: '4px',
        zIndex: 100,
        pointerEvents: 'auto',
      }}
    >
      <span data-no-translate>{overlay.text}</span>
    </div>
  );
}

/**
 * HTML/CSS-based text overlay layer that replaces Konva TextOverlayLayer.
 * Renders text overlays with drag support.
 */
export function HTMLTextOverlayLayer({
  textOverlays,
  canvasW,
  canvasH,
  selectedTextId,
  setSelectedTextId,
  setSelectedOverlayId,
  setIsMainImageSelected,
  updateTextOverlay,
}: HTMLTextOverlayLayerProps) {
  const handleSelect = useCallback((id: string) => {
    setSelectedTextId(id);
    setSelectedOverlayId(null);
    setIsMainImageSelected(false);
  }, [setSelectedTextId, setSelectedOverlayId, setIsMainImageSelected]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: `${canvasW}px`,
        height: `${canvasH}px`,
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      {textOverlays.map((overlay) => (
        <DraggableText
          key={overlay.id}
          overlay={overlay}
          canvasW={canvasW}
          canvasH={canvasH}
          isSelected={selectedTextId === overlay.id}
          onSelect={() => handleSelect(overlay.id)}
          onUpdate={(updates) => updateTextOverlay(overlay.id, updates)}
        />
      ))}
    </div>
  );
}
