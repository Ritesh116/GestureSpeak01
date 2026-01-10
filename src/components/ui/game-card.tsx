import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const gameCardVariants = cva(
  "rounded-3xl shadow-card transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-2 border-border",
        primary: "bg-primary/10 text-foreground border-2 border-primary/30",
        secondary: "bg-secondary/10 text-foreground border-2 border-secondary/30",
        success: "bg-success/10 text-foreground border-2 border-success/30",
        accent: "bg-accent/20 text-foreground border-2 border-accent/50",
        glass: "bg-card/80 backdrop-blur-lg border-2 border-border/50",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

export interface GameCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameCardVariants> {}

const GameCard = React.forwardRef<HTMLDivElement, GameCardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(gameCardVariants({ variant, padding, className }))}
        {...props}
      />
    );
  }
);
GameCard.displayName = "GameCard";

export { GameCard, gameCardVariants };
