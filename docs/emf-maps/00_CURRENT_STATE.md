# EMF Maps — Current State
## 25 September 2026

This document is the handoff state for the EMF Maps / EMF Insight Home Wellness work.

## Current scope

We are working only on:

- Home Wellness
- Property
- Property Health Record (PHR)
- Property Health Dashboard
- persistent Property identity and dates

Do not redesign the architecture at this stage.

## Do not touch

- Business Survey UI
- Business Results / Dashboard
- Account Dashboard
- existing Home workflow architecture
- PHR core structure
- backend `project` terminology
- existing JS IDs unless a change is strictly necessary
- working PHR popup
- Full EMF Insight Report €9 logic
- Professional Assessment logic

## Current successful state

Verified working:

- Property opens
- Property ID is unique for newly created properties
- PHR opens
- PHR shows Indoor Sources
- PHR shows Outdoor Sources
- PHR shows Total Sources
- PHR shows Lifestyle / living areas
- Dashboard opens and closes
- Dashboard Property Overview works
- Dashboard Environment works
- Dashboard Lifestyle works
- Dashboard Current Assessment works
- Dashboard Property Insights exists
- Property `createdAt` is persisted for newly created properties
- PHR record history displays the creation date
- Property Health Dashboard now also displays the creation date

## Latest verified example

Property:

- Name: `ddfdgfdf`
- Property ID: `PHI-PRP-B8AB917B`
- Project ID: `22`
- Property createdAt: `2026-09-25T09:21:27.020Z`

Displayed date:

`25 September 2026`

## Current workflow principle

Work one exact change at a time:

1. inspect exact current code
2. identify exact block
3. make one surgical change
4. test
5. inspect screenshot/result
6. continue

Do not make speculative batches of CSS or architecture changes.
