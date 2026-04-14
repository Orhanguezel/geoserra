'use client';
import { useEffect, useRef } from 'react';
import { api } from '@/lib/api';

declare global {
  interface Window {
    paypal?: any;
  }
}

interface Props {
  orderId: string;
  onSuccess: () => void;
  onError: () => void;
}

export function PayPalButton({ orderId, onSuccess, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    if (renderedRef.current) return;
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) return;

    const scriptId = 'paypal-sdk';
    const existing = document.getElementById(scriptId);
    if (!existing) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      script.async = true;
      script.onload = renderButton;
      document.body.appendChild(script);
    } else {
      renderButton();
    }

    function renderButton() {
      if (!window.paypal || !containerRef.current || renderedRef.current) return;
      renderedRef.current = true;
      window.paypal.Buttons({
        createOrder: () => orderId,
        onApprove: async () => {
          try {
            await api.post(`/paypal/capture/${orderId}`);
            onSuccess();
          } catch {
            onError();
          }
        },
        onError: () => onError(),
        style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' },
      }).render(containerRef.current);
    }
  }, [orderId]);

  return <div ref={containerRef} />;
}
