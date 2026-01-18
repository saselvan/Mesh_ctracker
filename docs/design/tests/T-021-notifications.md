# T-021: Notifications

## Feature
Notification permission request and settings management

## Test Steps

### 1. Initial State
1. Open Settings
2. Scroll to "Notifications" section
3. Verify "Enable Notifications" button visible (if not already granted)

### 2. Permission Request
1. Click "Enable Notifications"
2. Verify browser permission prompt appears
3. Click "Allow"
4. Verify button changes to checkbox "Enable reminder notifications"
5. Verify localStorage contains `notifications-{profileId}` with `{enabled: true}`

### 3. Permission Denied
1. Reset browser notification permissions (or test in incognito)
2. Deny notification permission
3. Verify Settings shows "Notifications blocked. Enable in browser settings."
4. No enable button available

### 4. Persistence
1. Enable notifications
2. Reload page
3. Open Settings
4. Verify notification checkbox still checked
5. Verify localStorage retains settings

### 5. Toggle On/Off
1. With notifications enabled, uncheck the checkbox
2. Verify localStorage updated to `{enabled: false}`
3. Check checkbox again
4. Verify localStorage updated to `{enabled: true}`

### 6. Unsupported Browser
1. If testing in browser without Notification API
2. Verify message "Notifications not supported in this browser."

## Expected Results
- Permission request triggered on first enable
- Settings persist to localStorage per profile
- UI updates based on permission state (granted/denied/default)
- Checkbox control available after permission granted
- Clear feedback for denied or unsupported cases

## Pass Criteria
✅ Permission prompt appears on first enable
✅ Settings persist across reloads
✅ UI handles all permission states correctly
✅ Per-profile settings work correctly
