import { discardUploadedImage } from './useImageUpload'

// A failed save; the new upload (if any) has already been cleaned up best-effort.
export class ImageSaveError extends Error {
  readonly reason: unknown
  readonly uploadDiscarded: boolean
  readonly cleanupFailed: boolean

  constructor(
    reason: unknown,
    {
      uploadDiscarded,
      cleanupFailed,
    }: { uploadDiscarded: boolean; cleanupFailed: boolean },
  ) {
    super('Save failed.')
    this.name = 'ImageSaveError'
    this.reason = reason
    this.uploadDiscarded = uploadDiscarded
    this.cleanupFailed = cleanupFailed
  }
}

type SaveWithImageCleanupInput = {
  // Local image key the record pointed at before this save; null for a new record.
  previousKey: string | null
  // Key of an upload made in this form session that the database does not reference yet.
  pendingUploadKey: string | null
  // Local image key the record points at once this save succeeds.
  savedKey: string | null
  write: () => Promise<unknown>
}

async function discardAll(keys: (string | null)[]) {
  const results = await Promise.all(
    keys.flatMap((key) => (key ? [discardUploadedImage(key)] : [])),
  )
  return results.every(Boolean)
}

// Writes the record, then removes local files only once the database no longer points at
// them. External URLs never have a key, so they are never sent to upload deletion.
// Resolves with whether every cleanup succeeded; rejects with `ImageSaveError`.
export async function saveWithImageCleanup({
  previousKey,
  pendingUploadKey,
  savedKey,
  write,
}: SaveWithImageCleanupInput) {
  try {
    await write()
  } catch (error) {
    // The old image stays referenced; only the new, unsaved upload is an orphan.
    const cleaned = await discardAll([pendingUploadKey])
    throw new ImageSaveError(error, {
      uploadDiscarded: Boolean(pendingUploadKey),
      cleanupFailed: !cleaned,
    })
  }

  const unusedUpload = pendingUploadKey !== savedKey ? pendingUploadKey : null
  const replacedKey =
    previousKey && previousKey !== savedKey ? previousKey : null
  return { cleanupFailed: !(await discardAll([unusedUpload, replacedKey])) }
}
