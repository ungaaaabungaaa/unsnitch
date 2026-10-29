# Mobile: iOS and Android

The mobile X apps copy links natively, so browser extensions and userscripts can't touch them. Use one of the options below on the *shared* link instead.

## iOS: the "Unsnitch" Shortcut

### One-tap install (recommended)

1. On your iPhone, open [`shortcut/Unsnitch.shortcut`](../shortcut/Unsnitch.shortcut) and tap **Download** (or AirDrop the file to your phone).
2. Tap the file → **Add Shortcut**.
3. In X, tap **Share → Unsnitch** on any post. The clean link is now on your clipboard. Paste it anywhere.

You can also run it from the home screen or a widget: with no input it cleans **whatever link is on your clipboard**. The first run asks for clipboard and notification permission; choose **Always Allow**.

What it does: 3 actions you can inspect before adding (Replace Text with a regex → Copy to Clipboard → Show Notification). It strips the query from every x.com / twitter.com link, leaves `/search` links and non-X links untouched, and never touches the network. The file is signed with `shortcuts sign --mode anyone` and built by [`shortcut/build.py`](../shortcut/build.py). Tested on iOS 26.2.

### Build it yourself (manual)

Prefer to create it by hand? Use the **Shortcuts** app (iOS 16 or later; action names may differ slightly between versions).

1. Open **Shortcuts**, tap **+** (top right) to create a new shortcut, and tap its name at the top to **Rename** it to `Unsnitch`.
2. Tap the **(i)** (Details) button, turn on **Show in Share Sheet**, and under **Share Sheet Types** keep only **URLs** and **Text** (deselect the rest).
3. Add the action **Get URLs from Input** (search "URLs"; use *Get URLs from Input*, input is *Shortcut Input*). This pulls any link out of what you shared, including a whole message.
4. Add **If**. Set the condition to **URLs** → **contains** → `x.com`. Tap **Add Condition**/use **Or** and add `twitter.com` (keep the *Any* matching option so either host passes).
5. Inside the **If** branch, add **Replace Text**:
   - Find: `\?.*$`
   - Replace With: leave empty
   - In **Show More**, turn on **Regular Expression**; the input is *URLs*.

   This drops everything from the first `?`. (It also drops a `?q=` search query; for search links see the manual fallback.)
6. Still inside the branch, add **Copy to Clipboard** (input: *Updated Text*).
7. Add **Show Notification** with the text `Unsnitched: link copied`.
8. In the **Otherwise** branch, add **Show Notification** with `Not an X link`, or leave it empty.
9. Tap **Done**.

**Use it:** in the X app tap **Share → Share via…**, then pick **Unsnitch** from the share sheet (scroll the app row or tap **More** and add it to Favorites). The cleaned link is on your clipboard; paste it wherever you like.

Note: if **Show in Share Sheet** is on, Shortcuts only receives a link when the app shares one. Sharing from Safari also works.

## Android: Unsnitch web app (PWA)

1. In Chrome open the Unsnitch landing page (the GitHub Pages site for this project).
2. Menu (⋮) → **Install app** (or **Add to Home screen**).
3. In the X app tap **Share → Share via…** and choose **Unsnitch** in the share sheet. (On first use it may take a moment to appear; it is listed once the app is installed.)
4. The web app shows the cleaned link and copies it. Everything runs locally in the page; nothing is uploaded.

If your phone doesn't list it in the share sheet, open the Unsnitch web app, paste the link, and tap **Clean**.

## Manual fallback

For any X link, delete everything from the `?` onward:

```
https://x.com/FFBuncho/status/2115628706068926758?a=E-mbQ0quyOZVCVU3zFg&s=19
                                                  ^ delete from here to the end
```

Result: `https://x.com/FFBuncho/status/2115628706068926758`

Exception: search links (`/search?q=...&f=live`) need `q`, `f`, `pf` and `lf` to work; keep those and drop the rest. If the link ends with a `#fragment`, keep that too.
