import { cva, type VariantProps } from 'class-variance-authority';
import {
  Avatar as ShadAvatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const avatarVariants = cva('', {
  variants: {
    size: {
      sm:  'h-7 w-7 text-xs',
      md:  'h-9 w-9 text-sm',
      lg:  'h-12 w-12 text-base',
    },
  },
  defaultVariants: { size: 'md' },
});

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  /** URL de la photo de profil */
  src?:       string;
  /** Nom complet (utilisé pour générer les initiales et le alt) */
  name:       string;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function Avatar({ src, name, size, className }: AvatarProps) {
  const initials = getInitials(name);

  return (
    <ShadAvatar className={cn(avatarVariants({ size }), className)}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback
        className="bg-primary/10 text-primary font-medium"
        aria-label={name}
      >
        {initials}
      </AvatarFallback>
    </ShadAvatar>
  );
}
