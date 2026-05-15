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
  Checkbox,
  Box,
  NumberInput,
} from '@mantine/core'
import { IconPlus, IconMinus } from '@tabler/icons-react'
import { pollService } from '../../services/api'
import { useLang } from '../../i18n'
import './PollForm.css'

function PollForm({ onPollCreated }) {
  const { t, lang } = useLang()
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  
  const [isMultipleChoice, setIsMultipleChoice] = useState(false)
  const [minSelections, setMinSelections] = useState(1)
  const [maxSelections, setMaxSelections] = useState(2)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const addOption = () => {
    if (options.length < 100) {
      setOptions([...options, ''])
      if (maxSelections > options.length + 1) {
        setMaxSelections(options.length + 1)
      }
    }
  }

  const updateOption = (index, value) => {
    setOptions(options.map((opt, i) => (i === index ? value : opt)))
  }

  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index)
    setOptions(newOptions)
    if (maxSelections > newOptions.length) {
      setMaxSelections(Math.max(1, newOptions.length))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const validOptions = options.filter((o) => o.trim())
    if (!question.trim()) {
      setError(t('fillAllFields'))
      return
    }
    if (validOptions.length < 2) {
      setError(t('min2Options'))
      return
    }
    if (isMultipleChoice) {
      if (minSelections < 1) {
        setError(t('selectionLimitError').replace('{min}', 1).replace('{max}', validOptions.length))
        return
      }
      if (maxSelections < minSelections || maxSelections > validOptions.length) {
        setError(t('selectionLimitError').replace('{min}', minSelections).replace('{max}', validOptions.length))
        return
      }
    }

    setSubmitting(true)
    try {
      const poll = await pollService.create({
        question: question.trim(),
        options: validOptions,
        language: lang,
        isMultipleChoice,
        minSelections: isMultipleChoice ? minSelections : 1,
        maxSelections: isMultipleChoice ? maxSelections : 1,
      })

      // Reset form
      setQuestion('')
      setOptions(['', ''])
      setIsMultipleChoice(false)
      setMinSelections(1)
      setMaxSelections(2)

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
        <Textarea
          label={<Text size="lg" fw={600}>{t('question')}</Text>}
          placeholder={t('questionPlaceholder')}
          autosize
          minRows={2}
          maxRows={4}
          value={question}
          size="md"
          onChange={(e) => setQuestion(e.currentTarget.value)}
        />

        {/* ── Options ── */}
        <Box>
          <Text size="sm" fw={500} mb={4}>{t('options')}</Text>

          <Stack gap="xs">
            {options.map((optValue, index) => (
              <Group key={index} gap="xs" wrap="nowrap">
                {isMultipleChoice ? (
                  <Checkbox disabled className="poll-form-radio" />
                ) : (
                  <Radio value={String(index)} disabled className="poll-form-radio" />
                )}
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

          {options.length < 100 && (
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

        {/* ── Settings ── */}
        <Box mt="xs">
          <Checkbox
            label={t('useCheckboxes')}
            checked={isMultipleChoice}
            onChange={(e) => setIsMultipleChoice(e.currentTarget.checked)}
            mb="xs"
          />
          
          {isMultipleChoice && (
            <Group grow>
              <NumberInput
                label={t('minSelections')}
                value={minSelections}
                onChange={(val) => setMinSelections(Math.max(1, typeof val === 'number' ? val : 1))}
                min={1}
                max={maxSelections}
              />
              <NumberInput
                label={t('maxSelections')}
                value={maxSelections}
                onChange={(val) => setMaxSelections(Math.max(minSelections, Math.min(options.length, typeof val === 'number' ? val : options.length)))}
                min={minSelections}
                max={options.length}
              />
            </Group>
          )}
        </Box>

        {error && <Text size="sm" c="red">{error}</Text>}

        {/* ── Submit ── */}
        <Button type="submit" fullWidth mt="md" className="submit-btn" loading={submitting}>
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

