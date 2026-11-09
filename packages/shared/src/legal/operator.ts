import type { LegalBlock, LegalOperator } from './types'

export const LEGAL_VERSION = '1.0'
export const LEGAL_EFFECTIVE_DATE = '2026-11-09'

export const LEGAL_OPERATOR: LegalOperator = {
  kind: 'individual',
  displayName: '',
  contactEmail: 'support@push.devcyjoon.tech',
}

export const koreanDate = (iso: string) => {
  const [year, month, day] = iso.split('-').map(Number)
  return `${year}년 ${month}월 ${day}일`
}

const orBlank = (value: string, label: string) => value.trim() || `[${label}]`

const COLUMNS = ['항목', '내용'] as const

export const operatorBlocks = (operator: LegalOperator): LegalBlock[] =>
  operator.kind === 'individual'
    ? [
        { kind: 'paragraph', text: '서비스는 다음 운영자가 운영합니다.' },
        {
          kind: 'table',
          columns: COLUMNS,
          rows: [
            ['운영자 구분', '개인'],
            ['성명', orBlank(operator.displayName, '성명')],
            ['이메일', orBlank(operator.contactEmail, '이메일')],
          ],
        },
        {
          kind: 'paragraph',
          text: '운영자는 사업자 등록을 하지 않은 개인입니다. 운영자는 사업자 등록과 통신판매업 신고를 마친 뒤에 유료 서비스의 결제를 받으며, 그때 상호, 대표자, 사업자등록번호, 통신판매업 신고번호, 주소, 전화번호를 이 조에 표시합니다.',
        },
      ]
    : [
        { kind: 'paragraph', text: '서비스는 다음 운영자가 운영합니다.' },
        {
          kind: 'table',
          columns: COLUMNS,
          rows: [
            ['상호', orBlank(operator.tradeName, '상호')],
            ['대표자', orBlank(operator.representative, '대표자')],
            ['사업자등록번호', orBlank(operator.businessNumber, '사업자등록번호')],
            ['통신판매업 신고번호', orBlank(operator.mailOrderNumber, '통신판매업 신고번호')],
            ['주소', orBlank(operator.address, '주소')],
            ['전화번호', orBlank(operator.phone, '전화번호')],
            ['이메일', orBlank(operator.contactEmail, '이메일')],
          ],
        },
      ]

export const privacyOfficerBlocks = (operator: LegalOperator): LegalBlock[] =>
  operator.kind === 'individual'
    ? [
        {
          kind: 'paragraph',
          text: '운영자는 개인으로서 개인정보 보호책임자 업무를 직접 맡습니다. 개인정보 처리에 관한 문의, 불만, 피해 구제, 권리 행사 요청은 아래로 보내 주세요.',
        },
        {
          kind: 'table',
          columns: COLUMNS,
          rows: [
            ['개인정보 보호책임자', `${orBlank(operator.displayName, '성명')} (운영자)`],
            ['이메일', orBlank(operator.contactEmail, '이메일')],
          ],
        },
      ]
    : [
        {
          kind: 'paragraph',
          text: '운영자는 개인정보 처리에 관한 업무를 총괄하는 개인정보 보호책임자를 다음과 같이 지정합니다. 개인정보 처리에 관한 문의, 불만, 피해 구제, 권리 행사 요청은 아래로 보내 주세요.',
        },
        {
          kind: 'table',
          columns: COLUMNS,
          rows: [
            ['개인정보 보호책임자', orBlank(operator.privacyOfficer, '개인정보 보호책임자')],
            ['전화번호', orBlank(operator.phone, '전화번호')],
            ['이메일', orBlank(operator.contactEmail, '이메일')],
          ],
        },
      ]
