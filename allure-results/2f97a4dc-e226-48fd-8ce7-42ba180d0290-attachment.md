# Page snapshot

```yaml
- banner:
  - link "Slack":
    - /url: https://slack.com
    - img "Slack"
  - text: New to Slack?
  - link "Create an account":
    - /url: /ssb/get-started?entry_point=signin_header#/createnew
- heading "Enter your email to sign in" [level=1]
- text: Or choose another way to sign in.
- textbox "Enter your email address": neharika.rout@optimusinfo.com
- iframe
- button "Sign In With Email" [disabled]
- separator
- text: OR SIGN IN WITH
- separator
- button "Google":
  - img
  - text: Google
- link "Apple":
  - /url: https://slack.com/signin/oauth/apple/start?email_first=1&is_ssb_browser_signin=1&entry_point=desktop_browser_redirect_flow
  - img
  - text: Apple
- text: Having trouble?
- link "Try entering a workspace URL":
  - /url: //slack.com/ssb/workspace-signin
- contentinfo:
  - link "Privacy & Terms":
    - /url: /legal
  - link "Contact Us":
    - /url: /help/requests/new
  - link "Change region":
    - /url: "#"
- alert: loading
- log
- iframe
- iframe
```