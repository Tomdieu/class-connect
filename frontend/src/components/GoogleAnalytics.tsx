// components/GoogleAnalytics.tsx
'use client';

import Script from 'next/script';

export default function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        suppressHydrationWarning
      />
      <Script id="google-analytics" strategy="afterInteractive" suppressHydrationWarning>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
      <Script
        id="consent-manager"
        type="text/javascript"
        data-cmp-ab="1"
        src="https://cdn.consentmanager.net/delivery/autoblocking/c88b9ba39230e.js"
        data-cmp-host="d.delivery.consentmanager.net"
        data-cmp-cdn="cdn.consentmanager.net"
        data-cmp-codesrc="16"
        strategy="afterInteractive"
        suppressHydrationWarning
      />
    </>
  );
}