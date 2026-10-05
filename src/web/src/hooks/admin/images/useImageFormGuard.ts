import { useCallback, useEffect, useState } from 'react'
import { useBlocker } from 'react-router'

import { discardUploadedImage } from './useImageUpload'

// What a page needs to know about its open image form.
export type ImageFormState = {
  // Unsaved input or an unsaved upload; leaving should be confirmed.
  dirty: boolean
  // An upload made in this form that the database does not reference yet.
  pendingUploadKey: string | null
  // A save is in flight; its own success or failure handling owns the upload.
  saving: boolean
  // A save or upload is in flight; the form must not be closed.
  busy: boolean
}

const idleFormState: ImageFormState = {
  dirty: false,
  pendingUploadKey: null,
  saving: false,
  busy: false,
}

// Guards an image form dialog: asks before leaving with unsaved input (in-app navigation
// through the router blocker, tab close or reload through `beforeunload`) and removes the
// form's unsaved upload when it is closed or left.
export function useImageFormGuard(isFormOpen: boolean) {
  const [formState, setFormState] = useState(idleFormState)
  const hasUnsavedChanges = isFormOpen && formState.dirty

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (!hasUnsavedChanges) return
    const warnBeforeUnload = (event: BeforeUnloadEvent) =>
      event.preventDefault()
    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [hasUnsavedChanges])

  const trackFormState = useCallback(
    (state: ImageFormState) => setFormState(state),
    [],
  )
  const resetFormState = useCallback(() => setFormState(idleFormState), [])

  // Best-effort; resolves false when the upload could not be removed.
  async function discardPendingUpload() {
    // An in-flight save cleans up its own upload if it fails; deleting it here could
    // remove a file the saved record now points at.
    const key = formState.saving ? null : formState.pendingUploadKey
    return key ? discardUploadedImage(key) : true
  }

  return {
    isBusy: formState.busy,
    blocker,
    trackFormState,
    resetFormState,
    discardPendingUpload,
  }
}
