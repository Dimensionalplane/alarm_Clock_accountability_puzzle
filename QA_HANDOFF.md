# SnoozeTax QA Handoff & Verification Plan

## 🎯 Verification Goals
Ensure the high-stakes accountability logic, spatial puzzles, and anti-cheat mechanisms are functioning as intended across platforms.

## 🧪 Test Scenarios

### 1. Alarm & Wallet Flow
- **Scenario**: Create an alarm, wait for it to fire, and hit "Snooze".
- **Expectation**:
  - Penalty (Flat or Incremental) is deducted from the wallet.
  - Transaction history is updated.
  - Alarm is rescheduled for 9 minutes.
- **Verification**: Check wallet balance and history screen.

### 2. Wood Block Puzzle Logic
- **Scenario**: Tap "Dismiss" and attempt to solve the puzzle.
- **Expectation**:
  - Pieces can be dragged and placed on the 5x5 grid.
  - Filling a row or column clears it.
  - Clearing the required lines (based on difficulty) silences the alarm.
  - Timer expiration triggers a penalty and auto-snooze.

### 3. Anti-Cheat Recovery
- **Scenario**: While the alarm is firing or the puzzle is active, force-close the app or restart the phone.
- **Expectation**:
  - Upon next app launch, a retroactive penalty is applied.
  - A notification/alert informs the user of the deduction.

### 4. Settings & Customization
- **Scenario**: Toggle between "Flat" and "Incremental" penalties. Change puzzle difficulty to "Hard".
- **Expectation**:
  - Flat penalty remains constant.
  - **Incremental Penalty**: Penalty amount increases with each consecutive snooze (e.g., $1.00 -> $1.50 -> $2.00). This state is persisted across app restarts during an active session.
  - Hard difficulty requires 2 line clears and has a shorter timer (45s).

## 🚀 Environment
- **Web**: Run `npx serve dist` (or similar) to test the exported build.
- **Mobile**: Use Expo Go or build a development client to test native notification logic.

## 🐛 Known Considerations
- Critical alerts require native permissions (iOS/Android).
- WebSocket-based system dashboard requires the Go backend (`backend-go/main.go`) to be running on `localhost:8080`.
