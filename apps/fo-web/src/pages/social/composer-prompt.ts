import { COMPOSER_PROMPT } from './constants'

export const composerPrompt = (employer: boolean, name: string) => (employer && name ? `${name} 이름으로 글을 써요` : COMPOSER_PROMPT)
