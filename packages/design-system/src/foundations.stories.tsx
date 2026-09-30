import type { Meta, StoryObj } from '@storybook/react'
import { palette } from './palette'
import { vars } from './vars.css'

const meta = { title: 'Foundations/Tokens' } satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const Swatch = ({ name, value }: { name: string; value: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div
      style={{
        width: 40,
        height: 24,
        background: value,
        borderRadius: 4,
        border: '1px solid #ddd',
      }}
    />
    <code style={{ fontSize: 12 }}>{name}</code>
  </div>
)

export const Palette: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
      {Object.entries(palette).map(([k, v]) => (
        <Swatch key={k} name={k} value={v} />
      ))}
    </div>
  ),
}

export const SemanticColors: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
      {Object.entries(vars.color).map(([k, v]) => (
        <Swatch key={k} name={k} value={v} />
      ))}
    </div>
  ),
}

export const Typography: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="t-display">Display 28</div>
      <div className="t-h1">Heading 1 · 24</div>
      <div className="t-h2">Heading 2 · 20</div>
      <div className="t-h3">Heading 3 · 17</div>
      <div className="t-body">Body · 15 — 본문 텍스트</div>
      <div className="t-body-sm">Body small · 14</div>
      <div className="t-label">Label · 13</div>
      <div className="t-caption">Caption · 12</div>
    </div>
  ),
}

export const Spacing: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Object.entries(vars.space).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <code style={{ fontSize: 12, width: 120 }}>{k}</code>
          <div style={{ height: 12, width: v, background: '#2563eb', borderRadius: 2 }} />
        </div>
      ))}
    </div>
  ),
}

export const RadiusAndShadow: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.entries(vars.radius).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <code style={{ fontSize: 12, width: 48 }}>{k}</code>
            <div
              style={{
                width: 40,
                height: 40,
                background: '#eff6ff',
                border: '1px solid #2563eb',
                borderRadius: v,
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Object.entries(vars.shadow).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <code style={{ fontSize: 12, width: 48 }}>{k}</code>
            <div
              style={{
                width: 80,
                height: 40,
                background: '#ffffff',
                borderRadius: 8,
                boxShadow: v,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  ),
}

export const SizesAndZ: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxWidth: 480 }}>
      {Object.entries(vars.size).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <code style={{ fontSize: 12 }}>size.{k}</code>
          <code style={{ fontSize: 12, color: '#6b7280' }}>{v}</code>
        </div>
      ))}
      {Object.entries(vars.z).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <code style={{ fontSize: 12 }}>z.{k}</code>
          <code style={{ fontSize: 12, color: '#6b7280' }}>{v}</code>
        </div>
      ))}
    </div>
  ),
}

export const DarkTheme: Story = {
  render: () => (
    <div data-theme="dark" style={{ padding: 24, background: '#101114' }}>
      <div className="t-h2" style={{ marginBottom: 12 }}>Dark theme</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
        }}
      >
        {Object.entries(vars.color).map(([k, v]) => (
          <Swatch key={k} name={k} value={v} />
        ))}
      </div>
    </div>
  ),
}
