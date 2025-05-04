# User Score System Documentation

## Overview

The user score system has been updated to better reflect user engagement and content quality. This document explains how the new system works and how it should be implemented in the frontend.

## New Calculation Method

- **User score** is now calculated as the **average lifetime** of all blinks from that user that have been deleted
- Score is expressed in **seconds** (example: 86400 seconds = 24 hours)
- Minimum default value: **86400** (24 hours)

## Data Storage

The backend now uses a new table called `BlinkLifetimes` that records:
- `userID`
- `blinkID`
- `createdAt` (date of blink creation)
- `deletedAt` (date of blink deletion)
- `lifetime` (duration in seconds)

## Technical Operation

- When a blink is deleted (manually or by expiration), its actual lifetime is calculated
- The user's score is the average of the lifetimes of all their deleted blinks
- If a user has no deleted blinks yet, their score is calculated from the estimated remaining time of their active blinks

## Impact on Frontend

### API Changes
- No changes to API endpoints or request/response formats
- The `score` field in the user profile still contains a numeric value, but now represents seconds

### Displaying User Scores
To display the score in a user-friendly way:
```javascript
// Convert seconds to hours
const scoreInHours = userProfile.score / 3600;

// Convert seconds to days
const scoreInDays = userProfile.score / 86400;

// Format for display
const formattedScore = scoreInHours < 24 
  ? `${Math.round(scoreInHours)}h` 
  : `${Math.round(scoreInDays)}d`;
```

### Message Expiration
- Message expiration times are now based on the user's score
- The higher the score, the longer messages will remain available
- The frontend should continue to use the `expiresAt` field from the API to display remaining time

## When is the Score Updated?

The user score is updated:
- When a blink is deleted
- When a new blink is created
- Periodically (every 12 hours)

## Best Practices

1. **Don't hardcode expiration times** - Always use the `expiresAt` field provided by the API
2. **Display scores in appropriate units** - Use hours for scores less than 24 hours, and days for longer periods
3. **Consider score context** - Higher scores indicate better user engagement and content quality
4. **Update UI on refresh** - User scores may change periodically, so refresh profile data when appropriate

## Example Implementation

```typescript
import { ProfileType } from "@/types/usersType";

// Format user score for display
function formatUserScore(profile: ProfileType): string {
  const scoreInSeconds = profile.score;
  
  // Default minimum score (24 hours)
  const minimumScore = 86400;
  
  // Use the higher of actual score or minimum
  const effectiveScore = Math.max(scoreInSeconds, minimumScore);
  
  if (effectiveScore < 86400) {
    // Less than a day - show in hours
    return `${Math.round(effectiveScore / 3600)}h`;
  } else {
    // More than a day - show in days
    return `${Math.round(effectiveScore / 86400)}d`;
  }
}
```

This new scoring system better reflects the actual performance of a user's blinks and allows for improved system performance optimization.
