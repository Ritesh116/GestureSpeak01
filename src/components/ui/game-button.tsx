import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const gameButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 active:translate-y-1",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-game hover:shadow-game-hover active:shadow-game-active rounded-2xl",
        secondary:
          "bg-secondary text-secondary-foreground shadow-game hover:shadow-game-hover active:shadow-game-active rounded-2xl",
        success:
          "bg-success text-success-foreground shadow-game hover:shadow-game-hover active:shadow-game-active rounded-2xl",
        warning:
          "bg-warning text-warning-foreground shadow-game hover:shadow-game-hover active:shadow-game-active rounded-2xl",
        accent:
          "bg-accent text-accent-foreground shadow-game hover:shadow-game-hover active:shadow-game-active rounded-2xl",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary/10 rounded-2xl",
        ghost:
          "text-foreground hover:bg-muted rounded-2xl",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        default: "h-12 px-6 text-base",
        lg: "h-14 px-8 text-lg",
        xl: "h-16 px-10 text-xl",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface GameButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gameButtonVariants> {}

const GameButton = React.forwardRef<HTMLButtonElement, GameButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(gameButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
GameButton.displayName = "GameButton";

export { GameButton, gameButtonVariants };
