"use client";

import * as React from "react";
import { useImageStore } from "@/lib/store";
import { AspectRatioDropdown } from "@/components/aspect-ratio/aspect-ratio-dropdown";
import { Button } from "@/components/ui/button";
import { ArrowDown01Icon, ArrowUp01Icon, Settings02Icon, SparklesIcon, Image01Icon, Cancel01Icon } from "hugeicons-react";
import { useDropzone } from "react-dropzone";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/constants";
import { getR2ImageUrl } from "@/lib/r2";
import {
  backgroundCategories,
  getAvailableCategories,
  backgroundPaths,
  getBackgroundThumbnailUrl,
} from "@/lib/r2-backgrounds";
import {
  gradientColors,
  type GradientKey,
} from "@/lib/constants/gradient-colors";
import { solidColors, type SolidColorKey } from "@/lib/constants/solid-colors";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { BackgroundEffects } from "@/components/controls/BackgroundEffects";
import { PresetGallery } from "@/components/presets/PresetGallery";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function EditorRightPanel() {
  const {
    backgroundConfig,
    backgroundBorderRadius,
    setBackgroundType,
    setBackgroundValue,
    setBackgroundOpacity,
    setBackgroundBorderRadius,
  } = useImageStore();

  const [expanded, setExpanded] = React.useState(true);
  const [bgUploadError, setBgUploadError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<"presets" | "settings">(
    "presets"
  );

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `File type not supported. Please use: ${ALLOWED_IMAGE_TYPES.join(
        ", "
      )}`;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return `File size too large. Maximum size is ${
        MAX_IMAGE_SIZE / 1024 / 1024
      }MB`;
    }
    return null;
  };

  const onBgDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const validationError = validateFile(file);
        if (validationError) {
          setBgUploadError(validationError);
          return;
        }

        setBgUploadError(null);
        const blobUrl = URL.createObjectURL(file);
        setBackgroundValue(blobUrl);
        setBackgroundType("image");
      }
    },
    [setBackgroundValue, setBackgroundType]
  );

  const {
    getRootProps: getBgRootProps,
    getInputProps: getBgInputProps,
    isDragActive: isBgDragActive,
  } = useDropzone({
    onDrop: onBgDrop,
    accept: {
      "image/*": ALLOWED_IMAGE_TYPES.map((type) => type.split("/")[1]),
    },
    maxSize: MAX_IMAGE_SIZE,
    multiple: false,
  });

  return (
    <div className="w-full h-full bg-[rgb(26,26,26)] flex flex-col overflow-hidden md:w-80 border-l border-border">
      {/* Header */}
      <div className="p-4 border-b border-border bg-background pr-12">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h3 className="text-sm font-semibold text-foreground min-w-0 flex-1 truncate">
            Canvas Settings
          </h3>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-lg hover:bg-accent transition-colors border border-border/50 hover:border-border shrink-0"
          >
            {expanded ? (
              <ArrowUp01Icon className="size-4" />
            ) : (
              <ArrowDown01Icon className="size-4" />
            )}
          </button>
        </div>

        {expanded && (
          <>
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-foreground mb-1">
                  Canvas Size
                </h4>
                <p className="text-xs text-muted-foreground">
                  Change aspect ratio to fit different platforms
                </p>
              </div>
              <AspectRatioDropdown />
            </div>
          </>
        )}
      </div>

      {expanded && (
        <>
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "presets" | "settings")
              }
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-2 rounded-none bg-transparent h-12 p-1.5 gap-1.5 mb-4">
                <TabsTrigger
                  value="presets"
                  className="data-[state=active]:bg-background rounded-md border-0 data-[state=active]:border-0 transition-all duration-200 text-sm font-medium"
                >
                  <SparklesIcon className="size-4 mr-1.5" />
                  Presets
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:bg-background rounded-md border-0 data-[state=active]:border-0 transition-all duration-200 text-sm font-medium"
                >
                  <Settings02Icon className="size-4 mr-1.5" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="presets" className="mt-0">
                <PresetGallery />
              </TabsContent>

              <TabsContent value="settings" className="mt-0 space-y-6">
                {/* Background Section */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    Background
                  </h4>

                  {/* Opacity */}
                  <Slider
                    value={[
                      backgroundConfig.opacity !== undefined
                        ? backgroundConfig.opacity
                        : 1,
                    ]}
                    onValueChange={(value) => setBackgroundOpacity(value[0])}
                    min={0}
                    max={1}
                    step={0.01}
                    label="Opacity"
                    valueDisplay={`${Math.round(
                      (backgroundConfig.opacity !== undefined
                        ? backgroundConfig.opacity
                        : 1) * 100
                    )}%`}
                  />

                  {/* Border Radius */}
                  <div className="space-y-3">
                    <div className="flex gap-2 mb-2">
                      <Button
                        variant={
                          backgroundBorderRadius === 0 ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setBackgroundBorderRadius(0)}
                        className={`flex-1 text-xs font-medium transition-all rounded-lg h-8 border ${
                          backgroundBorderRadius === 0
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary"
                            : "border-border/50 hover:bg-accent text-foreground bg-background hover:border-border"
                        }`}
                      >
                        Sharp Edge
                      </Button>
                      <Button
                        variant={
                          backgroundBorderRadius > 0 ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setBackgroundBorderRadius(24)}
                        className={`flex-1 text-xs font-medium transition-all rounded-lg h-8 border ${
                          backgroundBorderRadius > 0
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary"
                            : "border-border/50 hover:bg-accent text-foreground bg-background hover:border-border"
                        }`}
                      >
                        Rounded
                      </Button>
                    </div>
                    <Slider
                      value={[backgroundBorderRadius]}
                      onValueChange={(value) =>
                        setBackgroundBorderRadius(value[0])
                      }
                      min={0}
                      max={100}
                      step={1}
                      label="Radius"
                      valueDisplay={`${backgroundBorderRadius}px`}
                    />
                  </div>

                  {/* Background Effects */}
                  <BackgroundEffects />

                  {/* Background Type Selector */}
                  <div className="space-y-3">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Background Type
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        variant={
                          backgroundConfig.type === "image"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setBackgroundType("image")}
                        className={`flex-1 text-xs font-medium transition-all rounded-lg h-8 border ${
                          backgroundConfig.type === "image"
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary"
                            : "border-border/50 hover:bg-accent text-foreground bg-background hover:border-border"
                        }`}
                      >
                        Image
                      </Button>
                      <Button
                        variant={
                          backgroundConfig.type === "solid"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          setBackgroundType("solid");
                          if (
                            !backgroundConfig.value ||
                            typeof backgroundConfig.value !== "string" ||
                            !solidColors[
                              backgroundConfig.value as SolidColorKey
                            ]
                          ) {
                            setBackgroundValue("white");
                          }
                        }}
                        className={`flex-1 text-xs font-medium transition-all rounded-lg h-8 border ${
                          backgroundConfig.type === "solid"
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary"
                            : "border-border/50 hover:bg-accent text-foreground bg-background hover:border-border"
                        }`}
                      >
                        Solid
                      </Button>
                      <Button
                        variant={
                          backgroundConfig.type === "gradient"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          setBackgroundType("gradient");
                          if (
                            !backgroundConfig.value ||
                            typeof backgroundConfig.value !== "string" ||
                            !gradientColors[
                              backgroundConfig.value as GradientKey
                            ]
                          ) {
                            setBackgroundValue("vibrant_orange_pink");
                          }
                        }}
                        className={`flex-1 text-xs font-medium transition-all rounded-lg h-8 border ${
                          backgroundConfig.type === "gradient"
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary"
                            : "border-border/50 hover:bg-accent text-foreground bg-background hover:border-border"
                        }`}
                      >
                        Gradient
                      </Button>
                    </div>
                  </div>

                  {/* Gradient Selector */}
                  {backgroundConfig.type === "gradient" && (
                    <div className="space-y-3">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Gradient
                      </Label>
                      <div className="grid grid-cols-5 gap-2.5 max-h-64">
                        {(Object.keys(gradientColors) as GradientKey[]).map(
                          (key) => (
                            <button
                              key={key}
                              onClick={() => setBackgroundValue(key)}
                              className={`h-16 rounded-lg border-2 transition-all ${
                                backgroundConfig.value === key
                                  ? "border-primary ring-2 ring-ring"
                                  : "border-border hover:border-border/80"
                              }`}
                              style={{
                                background: gradientColors[key],
                              }}
                              title={key.replace(/_/g, " ")}
                            />
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Solid Color Selector */}
                  {backgroundConfig.type === "solid" && (
                    <div className="space-y-3">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Color
                      </Label>
                      <div className="grid grid-cols-5 gap-2.5">
                        {(Object.keys(solidColors) as SolidColorKey[]).map(
                          (key) => (
                            <button
                              key={key}
                              onClick={() => setBackgroundValue(key)}
                              className={`h-10 rounded-lg border-2 transition-all ${
                                backgroundConfig.value === key
                                  ? "border-primary ring-2 ring-ring"
                                  : "border-border hover:border-border/80"
                              }`}
                              style={{
                                backgroundColor: solidColors[key],
                              }}
                              title={key.replace(/_/g, " ")}
                            />
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Image Background Selector */}
                  {backgroundConfig.type === "image" && (
                    <div className="space-y-4">
                      {/* Current Background Preview */}
                      {backgroundConfig.value &&
                        (backgroundConfig.value.startsWith("blob:") ||
                          backgroundConfig.value.startsWith("http") ||
                          backgroundConfig.value.startsWith("data:") ||
                          backgroundPaths.includes(
                            backgroundConfig.value
                          )) && (
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">
                              Current Background
                            </Label>
                            <div className="relative rounded-lg overflow-hidden border border-border aspect-video bg-muted">
                              {(() => {
                                // Check if it's a known R2 background path
                                const isR2Path =
                                  typeof backgroundConfig.value === "string" &&
                                  !backgroundConfig.value.startsWith("blob:") &&
                                  !backgroundConfig.value.startsWith("http") &&
                                  !backgroundConfig.value.startsWith("data:") &&
                                  backgroundPaths.includes(
                                    backgroundConfig.value
                                  );

                                // Get the image URL
                                const imageUrl = isR2Path
                                  ? getR2ImageUrl({ src: backgroundConfig.value as string })
                                  : (backgroundConfig.value as string);

                                return (
                                  <>
                                    <img
                                      src={imageUrl}
                                      alt="Current background"
                                      className="w-full h-full object-cover"
                                    />
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-2 right-2 flex items-center gap-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground border-0 px-3 py-1.5 h-auto"
                                      onClick={() => {
                                        // Reset to default gradient
                                        setBackgroundType("gradient");
                                        setBackgroundValue(
                                          "vibrant_orange_pink"
                                        );
                                        // If it's a blob URL, revoke it
                                        if (
                                          backgroundConfig.value.startsWith(
                                            "blob:"
                                          )
                                        ) {
                                          URL.revokeObjectURL(
                                            backgroundConfig.value
                                          );
                                        }
                                      }}
                                    >
                                      <Cancel01Icon className="size-3.5" />
                                      <span className="text-xs font-medium">
                                        Remove
                                      </span>
                                    </Button>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                      {/* Preset Backgrounds */}
                      {backgroundCategories &&
                        Object.keys(backgroundCategories).length > 0 && (
                          <div className="space-y-3">
                            <Label className="text-xs font-medium text-muted-foreground">
                              Preset Backgrounds
                            </Label>
                            <div className="space-y-3">
                              {getAvailableCategories()
                                .filter(
                                  (category: string) =>
                                    category !== "demo" && category !== "nature"
                                )
                                .map((category: string) => {
                                  const categoryBackgrounds =
                                    backgroundCategories[category];
                                  if (
                                    !categoryBackgrounds ||
                                    categoryBackgrounds.length === 0
                                  )
                                    return null;

                                  const categoryDisplayName =
                                    category.charAt(0).toUpperCase() +
                                    category.slice(1);

                                  return (
                                    <div key={category} className="space-y-2">
                                      <Label className="text-xs font-medium text-muted-foreground capitalize">
                                        {categoryDisplayName} Wallpapers
                                      </Label>
                                      <div className="grid grid-cols-2 gap-2 overflow-y-auto pb-2 max-h-64">
                                        {categoryBackgrounds.map(
                                          (imagePath: string, idx: number) => {
                                            const thumbnailUrl = getBackgroundThumbnailUrl(imagePath);

                                            return (
                                              <button
                                                key={`${category}-${idx}`}
                                                onClick={() => {
                                                  setBackgroundValue(imagePath);
                                                  setBackgroundType("image");
                                                }}
                                                className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                                                  backgroundConfig.value ===
                                                  imagePath
                                                    ? "border-primary ring-2 ring-ring"
                                                    : "border-border hover:border-border/80"
                                                }`}
                                                title={`${categoryDisplayName} ${
                                                  idx + 1
                                                }`}
                                              >
                                                <img
                                                  src={thumbnailUrl}
                                                  alt={`${categoryDisplayName} ${
                                                    idx + 1
                                                  }`}
                                                  className="w-full h-full object-cover"
                                                  loading="lazy"
                                                />
                                              </button>
                                            );
                                          }
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}

                      {/* Upload Background Image */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Upload Background Image
                        </Label>
                        <div
                          {...getBgRootProps()}
                          className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                            isBgDragActive
                              ? "border-primary bg-accent scale-[1.02]"
                              : "border-border hover:border-border/80 hover:bg-accent/50"
                          }`}
                        >
                          <input {...getBgInputProps()} />
                          <div
                            className={`mb-3 transition-colors flex items-center justify-center w-full ${
                              isBgDragActive
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            <Image01Icon className="size-8" />
                          </div>
                          {isBgDragActive ? (
                            <p className="text-xs font-medium text-foreground text-center">
                              Drop the image here...
                            </p>
                          ) : (
                            <div className="space-y-1 text-center">
                              <p className="text-xs font-medium text-muted-foreground">
                                Drag & drop an image here
                              </p>
                              <p className="text-xs text-muted-foreground">
                                or click to browse • PNG, JPG, WEBP up to{" "}
                                {MAX_IMAGE_SIZE / 1024 / 1024}MB
                              </p>
                            </div>
                          )}
                        </div>
                        {bgUploadError && (
                          <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-2">
                            {bgUploadError}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
}
