# Popup Session Management Fix

## Issue
After logout and login, the Welcome Popup and Live Hunting Guide were not showing again because sessionStorage flags were persisting across login sessions.

## Root Cause
The popups use `sessionStorage` to track if they've been shown:
- `hasSeenWelcomeThisSession` - Welcome popup flag
- `hasSeenLiveHuntingGuide` - Live Hunting guide flag
- `hasSeenIntro` - Logo intro flag

`sessionStorage` persists until the browser tab is closed, so logging out and logging back in within the same browser session would not reset these flags.

## Solution
Updated the `logout()` function in `AuthContext.jsx` to clear all popup-related sessionStorage flags:

```javascript
// LOGOUT
const logout = async () => {
  try {
    await supabase.auth.signOut();
    setUser(null);
    // Clean up after logout
    cleanupStaleTokens();
    // Run storage cleanup
    cleanupStorage();
    // Clear session storage flags for popups so they show again on next login
    sessionStorage.removeItem('hasSeenWelcomeThisSession');
    sessionStorage.removeItem('hasSeenLiveHuntingGuide');
    sessionStorage.removeItem('hasSeenIntro');
    console.log('✅ Session storage cleared for popups');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
```

## Behavior After Fix

### Welcome Popup
- Shows 15 seconds after login
- Shows once per login session
- Resets when user logs out
- Shows again on next login

### Live Hunting Guide
- Shows 1 second after opening Live Hunting page
- Shows once per login session
- Resets when user logs out
- Shows again on next login

### Logo Intro
- Shows once per browser session (on first page load)
- Resets when user logs out
- Shows again on next login

## Testing Steps

1. **Login** → Wait 15 seconds → Welcome popup appears ✅
2. **Navigate to Live Hunting** → Guide appears after 1 second ✅
3. **Logout** → Session storage cleared ✅
4. **Login again** → Wait 15 seconds → Welcome popup appears again ✅
5. **Navigate to Live Hunting** → Guide appears again ✅

## Files Modified
- `src/context/AuthContext.jsx` - Added sessionStorage clearing in logout function

## Related Components
- `src/components/WelcomePopup.jsx` - Uses `hasSeenWelcomeThisSession`
- `src/components/LiveHuntingGuide.jsx` - Uses `hasSeenLiveHuntingGuide`
- `src/App.jsx` - Uses `hasSeenIntro`

## Status
✅ **FIXED** - Popups now show correctly after logout and login
