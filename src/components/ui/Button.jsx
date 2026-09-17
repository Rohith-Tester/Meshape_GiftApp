import { forwardRef } from 'react';
import './Button.css';

/**
 * Shared button used across the site so every call-to-action shares the
 * same sizing, motion, and focus behaviour.
 *
 * variant: 'primary' | 'secondary' | 'ghost'
 * size: 'md' | 'lg'
 */
const Button = forwardRef(function Button(
  { as: Component = 'button', variant = 'primary', size = 'md', className = '', children, ...rest },
  ref
) {
  const classes = ['btn', `btn--${variant}`, `btn--${size}`, className].filter(Boolean).join(' ');

  return (
    <Component ref={ref} className={classes} {...rest}>
      {children}
    </Component>
  );
});

export default Button;
