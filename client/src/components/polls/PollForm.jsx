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
import './PollForm.css'

function PollForm({ onPollCreated }) {
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
      setError('Please fill in all fields')
      return
    }
    if (validOptions.length < 2) {
      setError('At least 2 non-empty options required')
      return
    }

    setSubmitting(true)
    try {
      const poll = await pollService.create({
        title: title.trim(),
        createdBy: username.trim(),
        question: question.trim(),
        options: validOptions,
      })

      // Reset form
      setTitle('')
      setUsername('')
      setQuestion('')
      setOptions(['', ''])

      if (onPollCreated) onPollCreated(poll)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create poll')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="poll-form" onSubmit={handleSubmit}>
      <Stack gap="sm">
        <TextInput
          label="Title"
          placeholder="Give your poll a title"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
        />

        <TextInput
          label="User Name"
          placeholder="Your name"
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
        />

        <Textarea
          label="Question"
          placeholder="What do you want to ask?"
          autosize
          minRows={2}
          maxRows={4}
          value={question}
          onChange={(e) => setQuestion(e.currentTarget.value)}
        />

        {/* ── Options ── */}
        <Box>
          <Text size="sm" fw={500} mb={4}>Options</Text>

          <Stack gap="xs">
            {options.map((optValue, index) => (
              <Group key={index} gap="xs" wrap="nowrap">
                <Radio value={String(index)} disabled className="poll-form-radio" />
                <TextInput
                  placeholder={`Option ${index + 1}`}
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
                    aria-label={`Remove option ${index + 1}`}
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
              Add option
            </Button>
          )}
        </Box>

        {error && <Text size="sm" c="red">{error}</Text>}

        {/* ── Submit ── */}
        <Button type="submit" fullWidth mt="xs" className="submit-btn" loading={submitting}>
          <Text span fw={700}>Poll</Text>
          <Text span>ish it</Text>
        </Button>
      </Stack>
    </form>
  )
}

export default PollForm
