import * as Cinnabun from "cinnabun"
import { createSignal, computed } from "cinnabun"
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../modal/Modal"
import { communityEditorModalOpen, selectedCommunity } from "../../state/community"
import { Button } from "../../components/Button"
import { communityValidation } from "../../../db/validation"
import { updateCommunity } from "../../../client/actions/communities"
import { addNotification } from "../notifications/Notifications"
import { EllipsisLoader } from "../loaders/Ellipsis"

export const CommunityEditor = () => {
  const loading = createSignal(false)

  const state = computed(selectedCommunity, () => {
    return {
      title: selectedCommunity.value?.title ?? "",
      description: selectedCommunity.value?.description ?? "",
      private: selectedCommunity.value?.private ?? false,
      nsfw: selectedCommunity.value?.nsfw ?? false,
    }
  })

  const saveCommunity = async (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
    if (!selectedCommunity.value) return
    loading.value = true

    const res = await updateCommunity({
      ...state.value,
      id: selectedCommunity.value.id,
    })
    loading.value = false
    if (res) {
      const titleChanged = state.value.title !== selectedCommunity.value.title
      if (titleChanged) {
        setTimeout(() => {
          window.location.pathname = `/communities/${res.url_title}`
        }, 1500)
      }
      addNotification({
        text: "Community updated" + (titleChanged ? " - redirecting..." : ""),
        type: "success",
      })
      Object.assign(selectedCommunity.value, res)
      communityEditorModalOpen.value = false
    }
  }

  const reset = () => {
    state.value = {
      title: selectedCommunity.value?.title ?? "",
      description: selectedCommunity.value?.description ?? "",
      private: selectedCommunity.value?.private ?? false,
      nsfw: selectedCommunity.value?.nsfw ?? false,
    }
  }

  const hasChanged = () => {
    return (
      state.value.title !== selectedCommunity.value?.title ||
      state.value.description !== selectedCommunity.value?.description ||
      state.value.private !== selectedCommunity.value?.private ||
      state.value.nsfw !== selectedCommunity.value?.nsfw
    )
  }

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    const value = target.type === "checkbox" ? target.checked : target.value

    //@ts-ignore
    state.value[target.id as keyof typeof state.value] = value
    state.notify()
  }

  return (
    <Modal
      visible={communityEditorModalOpen}
      toggle={() => (communityEditorModalOpen.value = false)}
      onclose={reset}
    >
      <form onsubmit={saveCommunity}>
        <ModalHeader>
          <h2>Edit Community</h2>
        </ModalHeader>
        <ModalBody>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              className="form-control"
              watch={state}
              bind:value={() => state.value.title}
              oninput={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="desc">Description</label>
            <textarea
              id="description"
              className="form-control"
              watch={state}
              bind:value={() => state.value.description}
              oninput={handleChange}
            />
          </div>
          <div className="form-group flex-row">
            <label htmlFor="private">Private</label>
            <input
              id="private"
              type="checkbox"
              className="form-control"
              watch={state}
              bind:checked={() => state.value.private}
              oninput={handleChange}
            />
          </div>
          <div className="form-group flex-row">
            <label htmlFor="private">NSFW </label>
            <input
              id="nsfw"
              type="checkbox"
              className="form-control"
              watch={state}
              bind:checked={() => state.value.nsfw}
              oninput={handleChange}
            />
          </div>
          <div
            watch={state}
            bind:visible={() => state.value.nsfw && !state.value.private}
            className="form-error"
          >
            <p>NSFW communities must be private.</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            type="button"
            className="btn btn-secondary hover-animate"
            watch={loading}
            bind:disabled={() => loading.value}
            onclick={() => (communityEditorModalOpen.value = false)}
          >
            Cancel
          </Button>
          <Button
            watch={[loading, state]}
            bind:disabled={() =>
              loading.value || !communityValidation.isCommunityValid(state.value) || !hasChanged()
            }
            className="btn btn-primary hover-animate"
          >
            Save
            <EllipsisLoader watch={loading} bind:visible={() => loading.value} />
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
