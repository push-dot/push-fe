import type { Meta, StoryObj } from '@storybook/react-vite'
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
