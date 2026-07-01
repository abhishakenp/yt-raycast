#!/usr/bin/env node

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL

const notification =
  'Ship Fast operational event\n\nevent=test_notification\nsession=manual_test\nmessage=Test notification from standalone script'

if (!SLACK_WEBHOOK_URL) {
  console.error('SLACK_WEBHOOK_URL is required')
  process.exit(1)
}

console.log('Sending test notification to Slack...')

try {
  const response = await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: notification }),
  })

  if (response.ok) {
    console.log('✅ Slack notification sent successfully')
    console.log(JSON.stringify({ ok: true, status: response.status }, null, 2))
  } else {
    console.log('❌ Slack notification failed')
    console.log(
      JSON.stringify(
        { ok: false, status: response.status, statusText: response.statusText },
        null,
        2,
      ),
    )
    process.exit(1)
  }
} catch (error) {
  console.log('❌ Slack notification error:', error.message)
  console.log(JSON.stringify({ ok: false, error: error.message }, null, 2))
  process.exit(1)
}
