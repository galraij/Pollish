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
import './PollForm.css'

function PollForm() {
  const [options, setOptions] = useState(['', ''])

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

  return (
    <form className="poll-form" onSubmit={(e) => e.preventDefault()}>
      <Stack gap="sm">
        <TextInput
          label="Title"
          placeholder="Give your poll a title"
        />

        <TextInput
          label="User Name"
          placeholder="Your name"
        />

        <Textarea
          label="Question"
          placeholder="What do you want to ask?"
          autosize
          minRows={2}
          maxRows={4}
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

        {/* ── Submit ── */}
        <Button type="submit" fullWidth mt="xs" className="submit-btn">
          <Text span fw={700}>Poll</Text>
          <Text span>ish it</Text>
        </Button>
      </Stack>
    </form>
  )
}

export default PollForm
