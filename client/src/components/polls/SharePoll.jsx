import { TextInput, ActionIcon, Group, CopyButton, Tooltip } from '@mantine/core'
import { IconCopy, IconCheck } from '@tabler/icons-react'
import { useLang } from '../../i18n'

function SharePoll({ pollId }) {
  const { t } = useLang()
  const url = `${window.location.origin}/poll/${pollId}`

  return (
    <Group gap="xs" wrap="nowrap">
      <TextInput
        value={url}
        readOnly
        style={{ flex: 1 }}
        size="sm"
      />
      <CopyButton value={url} timeout={2000}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? t('copied') : t('copyLink')} withArrow>
            <ActionIcon
              color={copied ? 'teal' : 'gray'}
              variant="subtle"
              onClick={copy}
              size="lg"
            >
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
    </Group>
  )
}

export default SharePoll
