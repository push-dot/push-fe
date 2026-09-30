import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '@/test-utils'
import {
  Button,
  Card,
  CardGrid,
  DataList,
  DataListRow,
  Dialog,
  DocCard,
  EmptyState,
  ErrorState,
  Form,
  FormRow,
  FormSection,
  IconButton,
  Input,
  Select,
  StatusChip,
  Switch,
  Textarea,
} from '..'
import ToastItemView from '../toast-item'

// Components render inside a <main> landmark so page-level rules (region,
// landmark-one-main) evaluate them as they appear in the real app shell.
const expectNoViolations = async (ui: ReactElement) => {
  const { container } = render(<main>{ui}</main>)
  expect(await axe(container)).toHaveNoViolations()
}

describe('shared components a11y', () => {
  it('Button variants', async () => {
    await expectNoViolations(
      <>
        <Button variant="primary">저장</Button>
        <Button variant="secondary">취소</Button>
        <Button variant="danger">삭제</Button>
        <Button loading>전송 중</Button>
      </>,
    )
  })

  it('IconButton has an accessible name', async () => {
    await expectNoViolations(<IconButton icon="settings" aria-label="설정" />)
  })

  it('Switch exposes role and state', async () => {
    await expectNoViolations(<Switch checked onChange={vi.fn()} aria-label="알림 사용" />)
  })

  it('form controls', async () => {
    await expectNoViolations(
      <>
        <Input aria-label="제목" placeholder="제목" />
        <Textarea aria-label="내용" />
        <Select aria-label="상태">
          <option value="open">진행 중</option>
        </Select>
      </>,
    )
  })

  it('Form layout', async () => {
    await expectNoViolations(
      <Form>
        <FormSection title="계정">
          <FormRow label="이름" hint="표시 이름" />
        </FormSection>
      </Form>,
    )
  })

  it('Card and CardGrid', async () => {
    await expectNoViolations(
      <CardGrid>
        <Card title="문서" meta="어제 수정" />
        <Card title="클릭 가능" onClick={vi.fn()} />
      </CardGrid>,
    )
  })

  it('DocCard', async () => {
    await expectNoViolations(<DocCard title="이력서" meta="이력서" onOpen={vi.fn()} />)
  })

  it('DataList rows', async () => {
    await expectNoViolations(
      <DataList>
        <DataListRow title="항목" meta="메타" />
        <DataListRow title="클릭 가능 항목" onClick={vi.fn()} />
      </DataList>,
    )
  })

  it('StatusChip', async () => {
    await expectNoViolations(<StatusChip tone="verified" label="검증됨" />)
  })

  it('EmptyState with action', async () => {
    await expectNoViolations(
      <EmptyState message="항목이 없습니다" actionLabel="새로 만들기" onAction={vi.fn()} />,
    )
  })

  it('ErrorState with retry', async () => {
    await expectNoViolations(<ErrorState onRetry={vi.fn()} />)
  })

  it('Dialog', async () => {
    await expectNoViolations(
      <Dialog open title="확인" onClose={vi.fn()} actions={<Button variant="primary">확인</Button>}>
        <p>내용</p>
      </Dialog>,
    )
  })

  it('toast item announces via role=status', async () => {
    await expectNoViolations(
      <ToastItemView toast={{ id: 1, message: '저장됨', icon: 'check' }} onDismiss={vi.fn()} />,
    )
  })
})
