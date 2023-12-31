import * as Cinnabun from "cinnabun"
import { createSignal } from "cinnabun"
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../modal/Modal"
import { Button } from "../../components/Button"
import { joinCommunity } from "../../../client/actions/communities"
import { addNotification } from "../notifications/Notifications"
import { JoinResultType } from "../../../types/community"
import { EllipsisLoader } from "../loaders/Ellipsis"
import {
  selectedCommunity,
  communityJoinModalOpen,
  selectedCommunityUrlTitle,
} from "../../state/community"
import { pathStore } from "../../state/global"

export const CommunityJoinPrompt = () => {
  const loading = createSignal(false)

  const isPrivate = () => selectedCommunity.value?.private ?? false

  const reloadCommmunity = () => {
    const communityTitle = selectedCommunity.value?.url_title
    window.history.pushState({}, "", `/communities/${communityTitle}`)
    pathStore.value = `/communities/${communityTitle}`
    communityJoinModalOpen.value = false
  }

  const join = async () => {
    const communityId = selectedCommunityUrlTitle.value
    if (!communityId) return addNotification({ type: "error", text: "No community selected." })
    loading.value = true
    const res = await joinCommunity(communityId)
    loading.value = false
    if (!res) return

    switch (res.type) {
      case JoinResultType.AlreadyJoined:
        addNotification({ type: "error", text: "You are already a member of this community." })
        reloadCommmunity()
        break
      case JoinResultType.Error:
        addNotification({ type: "error", text: "An error occurred while joining the community." })
        break
      case JoinResultType.Success:
        addNotification({ type: "success", text: "You have joined the community." })
        reloadCommmunity()
        break
      case JoinResultType.Banned:
        addNotification({ type: "error", text: "You are banned from this community." })
        break
      case JoinResultType.Pending:
        addNotification({
          type: "success",
          text: "You have requested to join the community. Sit tight!",
        })
        break
      default:
        break
    }
  }

  return (
    <Modal toggle={() => (communityJoinModalOpen.value = false)} visible={communityJoinModalOpen}>
      <ModalHeader>
        <h2>Join Community</h2>
      </ModalHeader>
      <ModalBody>
        <div className="flex flex-column gap">
          <p className="text-muted m-0">
            <small watch={selectedCommunity} bind:children>
              {() =>
                isPrivate() ? (
                  <i>This private community requires membership to view information.</i>
                ) : (
                  <i>Joining this community will allow you to post.</i>
                )
              }
            </small>
          </p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          watch={loading}
          bind:disabled={() => loading.value}
          onclick={() => (communityJoinModalOpen.value = false)}
          className="btn btn-secondary hover-animate"
        >
          Cancel
        </Button>
        <Button
          watch={loading}
          bind:disabled={() => loading.value}
          onclick={join}
          className="btn btn-primary hover-animate"
        >
          Join
          <EllipsisLoader watch={loading} bind:visible={() => loading.value} />
        </Button>
      </ModalFooter>
    </Modal>
  )
}
