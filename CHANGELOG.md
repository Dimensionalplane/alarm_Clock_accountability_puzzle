# SnoozeTax Changelog

## [1.1.0] - 2024-05-29
### Added
- **Core Alarm Engine**: Recurring weekday support with native notification scheduling.
- **Pre-paid Wallet**: Secure storage for balance and transaction history.
- **Advanced Penalty Logic**: Support for both Flat and Incremental penalties (increases per snooze).
- **Wood Block Puzzle**: Spatial reasoning dismissal mechanic with Easy/Medium/Hard difficulties.
- **Anti-Cheat Protection**: Recovery Manager detects app force-quits and reboots during alarms to apply retroactive penalties.
- **System Dashboard**: Integrated Go backend for real-time monitoring and log streaming.
- **Release Ready**: Configured bundle identifiers and package names for production deployment.

### Fixed
- Stale closures in `WoodBlockPuzzle` gesture handlers using `useRef`.
- Simultaneous row and column clearing in puzzle logic.
- Input validation for alarm time entry (HH:MM format).
- Responsive layout issues for puzzle grid and pieces.
