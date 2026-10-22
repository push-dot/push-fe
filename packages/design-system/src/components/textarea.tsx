import { Textarea as MantineTextarea } from '@mantine/core'
import type { TextareaHTMLAttributes } from 'react'
import { input } from '../styles.css'

const Textarea = ({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <MantineTextarea
    className={[input({ textarea: true }), className ?? ''].filter(Boolean).join(' ')}
    {...rest}
  />
)

export default Textarea
