import React, { forwardRef } from 'react';
import './LoadingButton.css';
import Ripple from './Ripple';

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  ripple?: boolean;
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>>((

  { isLoading, children, ripple = false, ...props },

  ref

) => {

  return (

    <button

      {...props}

      ref={ref}

      disabled={isLoading || props.disabled}

      className={`relative overflow-hidden button-loading-container ${props.className || ""} ${isLoading ? "button-loading" : ""}`}

    >

      <span className="button-text flex items-center justify-center">{children}</span>

      {isLoading && <div className="button-loading-spinner"></div>}

      {ripple && <Ripple />}

    </button>

  );

});

LoadingButton.displayName = "LoadingButton";

export default LoadingButton;
