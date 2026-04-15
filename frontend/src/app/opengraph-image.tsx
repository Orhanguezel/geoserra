import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 64px',
          backgroundColor: '#06090f',
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(16,185,129,0.26), transparent 32%), radial-gradient(circle at 85% 80%, rgba(14,165,233,0.22), transparent 28%)',
          color: '#f0f2f5',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
              color: 'white',
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            G
          </div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>GeoSerra</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 900 }}>
          <div style={{ fontSize: 24, letterSpacing: 4, textTransform: 'uppercase', color: '#34d399' }}>
            AI & SEO Gorunurluk Platformu
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: 78, lineHeight: 1.02, fontWeight: 800 }}>
            <span>ChatGPT, Gemini ve</span>
            <span style={{ color: '#10b981', marginLeft: 16 }}>Perplexity</span>
            <span style={{ marginLeft: 16 }}>icin</span>
            <span style={{ color: '#0ea5e9', marginLeft: 16 }}>raporla.</span>
          </div>
          <div style={{ fontSize: 30, color: '#8892a4' }}>
            GEO + SEO + Lighthouse analizi tek platformda.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 18, fontSize: 22, color: '#8892a4' }}>
          <div>geoserra.com</div>
          <div>•</div>
          <div>Free analysis</div>
          <div>•</div>
          <div>PDF report</div>
        </div>
      </div>
    ),
    size,
  );
}
