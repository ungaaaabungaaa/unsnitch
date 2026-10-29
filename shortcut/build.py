#!/usr/bin/env python3
"""Builds Unsnitch.shortcut (unsigned plist). Sign with:
   shortcuts sign --mode anyone --input Unsnitch.unsigned.shortcut --output Unsnitch.shortcut
Flow: share sheet input (URL/text) — or the clipboard when run from the home screen/widget —
-> regex-strip the query from every x.com/twitter.com link (except /search) -> copy -> notify."""
import plistlib, uuid
U = str(uuid.uuid4()).upper()
# Text parameters take a token *string*: U+FFFC placeholder + attachment at that range.
inp = {"Value": {"string": "\ufffc", "attachmentsByRange": {"{0, 1}": {"Type": "ExtensionInput"}}},
       "WFSerializationType": "WFTextTokenString"}
out = {"Value": {"Type": "ActionOutput", "OutputUUID": U, "OutputName": "Updated Text"},
       "WFSerializationType": "WFTextTokenAttachment"}
# Leaves /search links alone (their ?q= is the query). Tested with NSRegularExpression (same ICU engine as iOS).
REGEX = r"(https?://(?:www\.|mobile\.)?(?:x|twitter)\.com/(?!search[/?#\s]|search$)[^\s?#]*)\?[^\s#]*"
wf = {
  "WFWorkflowClientVersion": "2607.0.2",
  "WFWorkflowMinimumClientVersion": 900,
  "WFWorkflowMinimumClientVersionString": "900",
  "WFWorkflowIcon": {"WFWorkflowIconStartColor": 4282601983, "WFWorkflowIconGlyphNumber": 59511},
  "WFWorkflowTypes": ["ActionExtension"],
  "WFWorkflowInputContentItemClasses": ["WFURLContentItem", "WFStringContentItem"],
  "WFWorkflowHasShortcutInputVariables": True,
  "WFWorkflowNoInputBehavior": {"Name": "WFWorkflowNoInputBehaviorGetClipboard", "Parameters": {}},
  "WFWorkflowImportQuestions": [],
  "WFWorkflowActions": [
    {"WFWorkflowActionIdentifier": "is.workflow.actions.text.replace",
     "WFWorkflowActionParameters": {"UUID": U, "WFInput": inp, "WFReplaceTextFind": REGEX,
       "WFReplaceTextReplace": "$1", "WFReplaceTextRegularExpression": True,
       "WFReplaceTextCaseSensitive": False}},
    {"WFWorkflowActionIdentifier": "is.workflow.actions.setclipboard",
     "WFWorkflowActionParameters": {"WFInput": out}},
    {"WFWorkflowActionIdentifier": "is.workflow.actions.notification",
     "WFWorkflowActionParameters": {"WFNotificationActionTitle": "Unsnitched ✓",
       "WFNotificationActionBody": "Clean link copied. Paste it anywhere.",
       "WFNotificationActionSound": False}},
  ],
}
with open("Unsnitch.unsigned.shortcut", "wb") as f:
    plistlib.dump(wf, f, fmt=plistlib.FMT_BINARY)
print("wrote Unsnitch.unsigned.shortcut")
