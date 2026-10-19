import * as React from 'react';
import { Toggle as TogglePrimitive } from 'radix-ui';
import { toggleVariants } from './toggleVariants';
import { cn } from '@/utils';

function Toggle({ className, variant = 'default', size = 'default', ...props }) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle };
