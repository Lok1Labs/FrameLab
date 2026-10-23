'use client';

import * as React from 'react';
import { Clock01Icon } from 'hugeicons-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ComingSoonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
  description?: string;
}

export function ComingSoonDialog({
  open,
  onOpenChange,
  feature,
  description,
}: ComingSoonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Clock01Icon className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">
            {feature} Coming Soon
          </DialogTitle>
          <DialogDescription className="text-center">
            {description || `We're working hard to bring you ${feature.toLowerCase()}. Stay tuned for updates!`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
