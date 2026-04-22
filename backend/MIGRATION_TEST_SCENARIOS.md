# Migration Command - Test Scenarios

## What the Fixed Command Handles

### Scenario 1: All Files Already on Cloudinary ✅
```
Situation: You deployed CloudinaryField to your models.
          All current files are CloudinaryResource objects with public_id.

Before:
  ✗ Crashes: 'CloudinaryResource' object has no attribute 'path'

After:
  ✓ Detection: hasattr(field_value, 'public_id') → True
  ✓ Action: Skip and log "SKIPPED (already on Cloudinary)"
  ✓ Result: 0 migrated, X skipped, 0 failed ✅
```

### Scenario 2: Mix of Local Files and Cloudinary ✅
```
Situation: Old local files still exist in /media/ folder.
          New files are already on Cloudinary.

Before:
  ✗ Crashes on CloudinaryResource objects
  ✗ Never reaches local files

After:
  ✓ Skips Cloudinary objects safely
  ✓ Detects local files (hasattr 'path')
  ✓ Validates file exists (os.path.exists)
  ✓ Uploads old files to Cloudinary
  ✓ Result: X migrated, Y skipped, 0 failed ✅
```

### Scenario 3: Local Files Deleted/Missing ✅
```
Situation: Database records reference files that no longer exist on disk.
          (e.g., /media/avatars/deleted_file.jpg was manually removed)

Before:
  ✗ FileNotFoundError or other file system error crashes

After:
  ✓ Detects: hasattr(field_value, 'path') → True
  ✓ Validates: os.path.exists(file_path) → False
  ✓ Skips gracefully: "SKIPPED (local file not found at /path)"
  ✓ Continues processing other files
  ✓ Result: X migrated, Y+1 skipped, 0 failed ✅
```

### Scenario 4: Permission/Upload Errors ✅
```
Situation: Cloudinary credentials invalid, network error, or disk permission issue.

Before:
  ✗ Generic exception caught, but error context lost

After:
  ✓ Try block catches specific exceptions
  ✓ Logs detailed error: "FAILED - Permission denied" or specific error
  ✓ Returns 'failed' status
  ✓ Continues processing other files
  ✓ Summary shows: X migrated, Y skipped, Z failed ⚠️
```

### Scenario 5: Re-running Migration (Idempotency) ✅
```
Situation: You run the command once, then accidentally run it again.

Before:
  ✗ Crashes again on CloudinaryResource objects
  ✗ Not idempotent

After:
  ✓ First run: Skips already migrated files
  ✓ Second run: Still skips them (detects via public_id)
  ✓ Safe to run any number of times
  ✓ Result: 0 migrated, X skipped, 0 failed ✅
```

---

## Detailed Example Run

### Command
```bash
cd backend
python manage.py migrate_media_to_cloudinary
```

### Example Output (with all scenarios)
```
=== Starting Media Migration to Cloudinary ===

Processing User...
  • User id=1 field=avatar: SKIPPED (already on Cloudinary)
  ✓ User id=2 field=avatar: MIGRATED
  ⚠ User id=3 field=avatar: SKIPPED (local file not found at /media/avatars/deleted.jpg)
  ✓ User id=4 field=avatar: MIGRATED
  ✗ User id=5 field=avatar: FAILED - [Cloudinary] Unauthorized - Invalid credentials

User Summary: 2 migrated, 2 skipped, 1 failed

Processing City...
  • City id=1 field=thumbnail: SKIPPED (already on Cloudinary)
  • City id=1 field=flyin_graphic: SKIPPED (already on Cloudinary)
  • City id=1 field=loop_graphic: SKIPPED (already on Cloudinary)
  • City id=1 field=support_audio: SKIPPED (already on Cloudinary)
  ✓ City id=2 field=thumbnail: MIGRATED
  ✓ City id=2 field=flyin_graphic: MIGRATED
  ✓ City id=2 field=loop_graphic: MIGRATED
  • City id=2 field=support_audio: SKIPPED (no local file path available)

City Summary: 3 migrated, 5 skipped, 0 failed

Processing Room...
  • Room id=1 field=thumbnail: SKIPPED (already on Cloudinary)
  • Room id=1 field=flyin_graphic: SKIPPED (already on Cloudinary)
  • Room id=1 field=loop_graphic: SKIPPED (already on Cloudinary)
  • Room id=1 field=support_audio: SKIPPED (already on Cloudinary)

Room Summary: 0 migrated, 4 skipped, 0 failed

✓ Migration complete.
```

### Interpreting the Results
```
✅ SUCCESS CASES:
   • 2 migrated (old local files uploaded to Cloudinary)
   • 9 skipped (already on Cloudinary or not available)
   • 1 failed (credentials issue - needs investigation)

NEXT STEPS:
   1. Review the 1 failed record (User id=5)
   2. Check Cloudinary credentials in .env
   3. Re-run migration to complete failed record
```

---

## Expected Behavior for Your Setup

Since your models are already configured with CloudinaryField:

```
Expected Output:
  All records: SKIPPED (already on Cloudinary)
  0 migrated, X skipped, 0 failed
  
Reason:
  New files are uploaded directly to Cloudinary
  No legacy local files to migrate
  Command succeeds but finds nothing to do (idempotent)
```

---

## Troubleshooting

### If you see: "FAILED - [Cloudinary] Unauthorized"
```bash
# Check .env file
cat backend/.env | grep CLOUDINARY

# Verify credentials are correct:
CLOUDINARY_CLOUD_NAME=dyflzseer
CLOUDINARY_API_KEY=671893865547517  # Should match your account
CLOUDINARY_API_SECRET=ABOqma7FxHbUXJtOLhU3Inmkyo0
```

### If you see: "FAILED - Connection error"
```bash
# Check internet connection
ping res.cloudinary.com

# Check firewall/proxy settings
# Re-run migration after network restored
```

### If you see: "SKIPPED (no local file path available)"
```bash
# This is OK - it means the file is already a CloudinaryResource
# No action needed
```

---

## What NOT To Worry About

✅ Safe to run multiple times
✅ Safe if files are already on Cloudinary
✅ Safe if local files are missing
✅ Safe if there are errors (won't crash, will log them)
✅ Safe to interrupt (won't corrupt data)

---

## When You Might Want To Run This

1. **After initial Cloudinary setup** - to migrate legacy files
2. **For data cleanup** - to verify all files are on Cloudinary
3. **After schema changes** - if you add new media fields later
4. **Never problematic** - it's safe to run anytime

