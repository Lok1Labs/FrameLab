'use client';

import { useState, useRef, useEffect } from 'react';
import { useImageStore } from '@/lib/store';
import { Delete02Icon, ViewIcon, ViewOffSlashIcon, Add01Icon, TextIcon } from 'hugeicons-react';
import { fontFamilies, getAvailableFontWeights, getFontCSS } from '@/lib/constants/fonts';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

const QUICK_COLORS = [
  '#ffffff', '#000000', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#3b82f6', '#8b5cf6',
];

const WEIGHT_LABELS: Record<string, string> = {
  '100': 'Thin',
  '200': 'Extra Light',
  '300': 'Light',
  'normal': 'Regular',
  '400': 'Regular',
  '500': 'Medium',
  '600': 'Semibold',
  'bold': 'Bold',
  '700': 'Bold',
  '800': 'Extra Bold',
  '900': 'Black',
};

export const TextOverlayControls = () => {
  const {
    textOverlays,
    addTextOverlay,
    updateTextOverlay,
    removeTextOverlay,
    clearTextOverlays,
  } = useImageStore();

  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  const selectedOverlay = textOverlays.find((o) => o.id === selectedOverlayId);

  // Auto-focus textarea when selecting an overlay
  useEffect(() => {
    if (selectedOverlay && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [selectedOverlayId]);

  const handleAddText = () => {
    setSelectedOverlayId(addTextOverlay());
  };

  return (
    <div className="space-y-3">
      {/* Add text button — big and clear */}
      <button
        onClick={handleAddText}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all duration-150"
      >
        <Add01Icon size={16} />
        <span className="text-xs font-medium">Add Text</span>
      </button>

      {/* Text overlay list */}
      {textOverlays.length > 0 && (
        <div className="space-y-1">
          {textOverlays.map((overlay) => {
            const isSelected = selectedOverlayId === overlay.id;
            return (
              <div
                key={overlay.id}
                className={cn(
                  'flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all group',
                  isSelected
                    ? 'bg-primary/8 border border-primary/20'
                    : 'hover:bg-accent/60 border border-transparent'
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                  isSelected ? "bg-primary/10 text-primary" : "bg-muted/60 text-muted-foreground/60"
                )}>
                  <TextIcon size={13} />
                </div>
                <button
                  type="button"
                  aria-label={`Edit text: ${overlay.text || 'Empty text'}`}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedOverlayId(isSelected ? null : overlay.id)}
                  className={cn(
                    'flex-1 text-left text-xs font-medium truncate',
                    !overlay.isVisible && 'text-muted-foreground line-through'
                  )}
                >
                  {overlay.text || 'Empty text'}
                </button>
                <button
                  aria-label={overlay.isVisible ? "Hide text" : "Show text"}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTextOverlay(overlay.id, { isVisible: !overlay.isVisible });
                  }}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                >
                  {overlay.isVisible
                    ? <ViewIcon size={13} />
                    : <ViewOffSlashIcon size={13} />}
                </button>
                <button
                  aria-label="Delete text"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTextOverlay(overlay.id);
                    if (selectedOverlayId === overlay.id) setSelectedOverlayId(null);
                  }}
                  className="p-1 rounded-md text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Delete02Icon size={13} />
                </button>
              </div>
            );
          })}

          {textOverlays.length > 1 && (
            <button
              onClick={clearTextOverlays}
              className="text-[10px] text-muted-foreground hover:text-destructive transition-colors px-2.5 py-1"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Selected overlay editor */}
      {selectedOverlay && (
        <div className="space-y-4 pt-3 border-t border-border/30">

          {/* Text content */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Content</label>
            <textarea
              aria-label="Text content"
              ref={editInputRef}
              value={selectedOverlay.text}
              onChange={(e) => updateTextOverlay(selectedOverlay.id, { text: e.target.value })}
              placeholder="Type your text..."
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Color</label>
            <div className="flex items-center gap-1.5">
              {QUICK_COLORS.map((color) => (
                <button
                  key={color}
                  aria-label={`Text color ${color}`}
                  onClick={() => updateTextOverlay(selectedOverlay.id, { color })}
                  className={cn(
                    'w-5 h-5 rounded-full transition-all shrink-0',
                    selectedOverlay.color === color
                      ? 'ring-[1.5px] ring-foreground ring-offset-1 ring-offset-background scale-110'
                      : 'hover:scale-110'
                  )}
                  style={{
                    backgroundColor: color,
                    border: color === '#ffffff' ? '1px solid hsl(var(--border))' : undefined,
                  }}
                />
              ))}
              <div className="w-px h-4 bg-border/40 mx-0.5" />
              <input
                aria-label="Custom text color"
                type="color"
                value={selectedOverlay.color}
                onChange={(e) => updateTextOverlay(selectedOverlay.id, { color: e.target.value })}
                className="w-5 h-5 rounded-full cursor-pointer border border-border/50 appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0"
              />
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-2">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Typography</label>

            {/* Font family */}
            <select
              aria-label="Font family"
              value={selectedOverlay.fontFamily}
              onChange={(e) => {
                const fontFamily = e.target.value;
                const weights = getAvailableFontWeights(fontFamily);
                const newWeight = weights.includes(selectedOverlay.fontWeight)
                  ? selectedOverlay.fontWeight
                  : weights[0] || 'normal';
                updateTextOverlay(selectedOverlay.id, { fontFamily, fontWeight: newWeight });
              }}
              className="w-full h-9 px-2.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {fontFamilies.map((font) => (
                <option key={font.id} value={font.id} style={{ fontFamily: getFontCSS(font.id) }}>
                  {font.name}
                </option>
              ))}
            </select>

            {/* Weight */}
            <select
              aria-label="Font weight"
              value={selectedOverlay.fontWeight}
              onChange={(e) => updateTextOverlay(selectedOverlay.id, { fontWeight: e.target.value })}
              className="w-full h-9 px-2.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {getAvailableFontWeights(selectedOverlay.fontFamily).map((w) => (
                <option key={w} value={w}>{WEIGHT_LABELS[w] ?? w}</option>
              ))}
            </select>

            {/* Size */}
            <Slider
              value={[selectedOverlay.fontSize]}
              onValueChange={(v) => updateTextOverlay(selectedOverlay.id, { fontSize: v[0] })}
              min={8}
              max={150}
              step={1}
              label="Size"
              valueDisplay={`${selectedOverlay.fontSize}px`}
            />
          </div>

          {/* Opacity */}
          <Slider
            value={[selectedOverlay.opacity]}
            onValueChange={(v) => updateTextOverlay(selectedOverlay.id, { opacity: v[0] })}
            min={0}
            max={1}
            step={0.01}
            label="Opacity"
            valueDisplay={`${Math.round(selectedOverlay.opacity * 100)}%`}
          />

          <div className="space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Position on canvas</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => updateTextOverlay(selectedOverlay.id, { position: { ...selectedOverlay.position, x: 50 } })}
                className="flex-1 rounded-md border border-border px-2 py-2 text-xs hover:bg-accent"
              >
                Center horizontally
              </button>
              <button
                type="button"
                onClick={() => updateTextOverlay(selectedOverlay.id, { position: { ...selectedOverlay.position, y: 50 } })}
                className="flex-1 rounded-md border border-border px-2 py-2 text-xs hover:bg-accent"
              >
                Center vertically
              </button>
            </div>
            <div className="flex gap-2">
              {(['x', 'y'] as const).map((axis) => (
                <label key={axis} className="flex flex-1 items-center gap-1 text-xs text-muted-foreground">
                  {axis.toUpperCase()} (%)
                  <input
                    type="number" min={0} max={100} step={0.1}
                    aria-label={`Text ${axis.toUpperCase()} position`}
                    value={Math.round(selectedOverlay.position[axis] * 10) / 10}
                    onChange={(event) => {
                      const value = event.currentTarget.valueAsNumber;
                      if (Number.isFinite(value)) updateTextOverlay(selectedOverlay.id, {
                        position: { ...selectedOverlay.position, [axis]: Math.min(100, Math.max(0, value)) },
                      });
                    }}
                    className="h-8 min-w-0 w-full rounded-md border border-border bg-background px-2 text-foreground"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Orientation */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Orientation</label>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/50 border border-border/20">
              {(['horizontal', 'vertical'] as const).map((dir) => (
                <button
                  key={dir}
                  onClick={() => updateTextOverlay(selectedOverlay.id, { orientation: dir })}
                  className={cn(
                    'flex-1 h-7 rounded-md text-[11px] font-medium transition-all capitalize',
                    selectedOverlay.orientation === dir
                      ? 'bg-background text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {dir}
                </button>
              ))}
            </div>
          </div>

          {/* Text Shadow */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Shadow</label>
              <button
                aria-label="Text shadow"
                aria-pressed={selectedOverlay.textShadow.enabled}
                onClick={() => updateTextOverlay(selectedOverlay.id, {
                  textShadow: { ...selectedOverlay.textShadow, enabled: !selectedOverlay.textShadow.enabled },
                })}
                className={cn(
                  'w-8 h-[18px] rounded-full transition-colors relative',
                  selectedOverlay.textShadow.enabled ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
              >
                <span
                  className={cn(
                    'absolute top-[3px] w-3 h-3 rounded-full bg-white transition-transform',
                    selectedOverlay.textShadow.enabled ? 'left-[17px]' : 'left-[3px]'
                  )}
                />
              </button>
            </div>

            {selectedOverlay.textShadow.enabled && (
              <div className="space-y-1">
                <Slider
                  value={[selectedOverlay.textShadow.blur]}
                  onValueChange={(v) => updateTextOverlay(selectedOverlay.id, {
                    textShadow: { ...selectedOverlay.textShadow, blur: v[0] },
                  })}
                  min={0}
                  max={20}
                  step={1}
                  label="Blur"
                  valueDisplay={`${selectedOverlay.textShadow.blur}px`}
                />
                <Slider
                  value={[selectedOverlay.textShadow.offsetX]}
                  onValueChange={(v) => updateTextOverlay(selectedOverlay.id, {
                    textShadow: { ...selectedOverlay.textShadow, offsetX: v[0] },
                  })}
                  min={-20}
                  max={20}
                  step={1}
                  label="X Offset"
                  valueDisplay={`${selectedOverlay.textShadow.offsetX}px`}
                />
                <Slider
                  value={[selectedOverlay.textShadow.offsetY]}
                  onValueChange={(v) => updateTextOverlay(selectedOverlay.id, {
                    textShadow: { ...selectedOverlay.textShadow, offsetY: v[0] },
                  })}
                  min={-20}
                  max={20}
                  step={1}
                  label="Y Offset"
                  valueDisplay={`${selectedOverlay.textShadow.offsetY}px`}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
