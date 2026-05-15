import { useState } from 'react'
import {
  TextInput,
  Textarea,
  Button,
  ActionIcon,
  Group,
  Stack,
  Text,
  Radio,
  Box,
} from '@mantine/core'
import { IconPlus, IconMinus } from '@tabler/icons-react'
import { pollService } from '../../services/api'
import { useLang } from '../../i18n'
import './PollForm.css'

function PollForm({ onPollCreated }) {
  const { t, lang } = useLang()
  const [title, setTitle] = useState('')
  const [username, setUsername] = useState('')
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const addOption = () => {
    if (options.length < 8) {
      setOptions([...options, ''])
    }
  }

  const updateOption = (index, value) => {
    setOptions(options.map((opt, i) => (i === index ? value : opt)))
  }

  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const validOptions = options.filter((o) => o.trim())
    if (!title.trim() || !username.trim() || !question.trim()) {
      setError(t('fillAllFields'))
      return
    }
    if (validOptions.length < 2) {
      setError(t('min2Options'))
      return
    }

    setSubmitting(true)
    try {
      const poll = await pollService.create({
        title: title.trim(),
        createdBy: username.trim(),
        question: question.trim(),
        options: validOptions,
        language: lang,
      })

      // Reset form
      setTitle('')
      setUsername('')
      setQuestion('')
      setOptions(['', ''])

      if (onPollCreated) onPollCreated(poll)
    } catch (err) {
      setError(err.response?.data?.error || t('failedCreate'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="poll-form" onSubmit={handleSubmit}>
      <Stack gap="sm">
        <TextInput
          label={t('title')}
          placeholder={t('titlePlaceholder')}
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
        />

        <TextInput
          label={t('userName')}
          placeholder={t('userNamePlaceholder')}
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
        />

        <Textarea
          label={t('question')}
          placeholder={t('questionPlaceholder')}
          autosize
          minRows={2}
          maxRows={4}
          value={question}
          onChange={(e) => setQuestion(e.currentTarget.value)}
        />

        {/* ── Options ── */}
        <Box>
          <Text size="sm" fw={500} mb={4}>{t('options')}</Text>

          <Stack gap="xs">
            {options.map((optValue, index) => (
              <Group key={index} gap="xs" wrap="nowrap">
                <Radio value={String(index)} disabled className="poll-form-radio" />
                <TextInput
                  placeholder={`${t('optionN')} ${index + 1}`}
                  value={optValue}
                  onChange={(e) => updateOption(index, e.currentTarget.value)}
                  style={{ flex: 1 }}
                />
                {index >= 2 && (
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={() => removeOption(index)}
                    aria-label={`${t('optionN')} ${index + 1}`}
                  >
                    <IconMinus size={14} />
                  </ActionIcon>
                )}
              </Group>
            ))}
          </Stack>

          {options.length < 8 && (
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconPlus size={14} />}
              onClick={addOption}
              mt="xs"
              className="add-option-btn"
            >
              {t('addOption')}
            </Button>
          )}
        </Box>

        {error && <Text size="sm" c="red">{error}</Text>}

        {/* ── Submit ── */}
        <Button type="submit" fullWidth mt="xs" className="submit-btn" loading={submitting}>
          {lang === 'en' ? (
            <>
              <Text span fw={700}>Poll</Text>
              <Text span>ish it</Text>
            </>
          ) : (
            <Text span fw={700}>{t('submit')}</Text>
          )}
        </Button>
      </Stack>
    </form>
  )
}

export default PollForm
