import React, { forwardRef } from 'react';
import './LoadingButton.css';

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>>((
  { isLoading, children, ...props },
  ref
) => {
  return (
    <button
      {...props}
      ref={ref}
      disabled={isLoading || props.disabled}
      className={`button-loading-container ${props.className || ""} ${isLoading ? "button-loading" : ""}`}
    >
      <span className="button-text">{children}</span>
      {isLoading && <div className="button-loading-spinner"></div>}
    </button>
  );
});

LoadingButton.displayName = "LoadingButton";

export default LoadingButton;
