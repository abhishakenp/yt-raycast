# Ship Fast — Product Requirements Document

## Overview
Ship Fast is an AI-powered website generator. Users describe a website in natural language, and the platform generates a live preview they can edit, export, and deploy.

## Core User Flows

### 1. Homepage Generation (Anonymous)
- User visits homepage at `/`
- User enters a project description in the prompt field
- User submits the form
- System creates a session and shows embedded or full dashboard at `/session/:id`
- User watches generation progress and sees preview in iframe at `/preview/:sessionId`
- Anonymous users get 2 free generations per day

### 2. Authentication
- Users can sign in via Google, GitHub, or email/password (Firebase Auth)
- Signed-in users can claim anonymous sessions, list their sessions, and access premium features
- Auth overlay opens when anonymous quota is exhausted

### 3. Session Dashboard
- Live task list and generation logs via WebSocket
- Preview iframe with desktop/mobile toggle
- Chat studio for iterative edits
- Export and payment options for premium features

### 4. Preview Editing
- Inline element selection and editing in preview iframe
- Text, color, spacing, and layout changes
- History restore for previous edits

### 5. Export & Payments
- Export generated site as zip (requires auth + subscription)
- Stripe and Razorpay payment flows for premium unlock

## Pages
| Route | Description | Auth |
|-------|-------------|------|
| `/` | Marketing homepage + prompt form | Public |
| `/pricing` | Pricing plans | Public |
| `/privacy` | Privacy policy | Public |
| `/session/:id` | Generation dashboard | Public (API gated) |
| `/preview/:sessionId` | Generated site preview | Public |
| `/studio/*` | Sanity CMS embed | Session token |

## Success Criteria
- Homepage loads and prompt form is interactive
- Submitting a valid prompt creates a session and navigates to dashboard
- Preview iframe loads generated content after generation completes
- Sign-in flow works (Google/email)
- Public gallery shows recent sessions

## Non-Goals for Testing
- Full payment completion (use test mode only)
- Medusa/Sanity provisioning (requires external infra)
- GitHub push (requires OAuth)
