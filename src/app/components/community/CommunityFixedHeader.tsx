import * as Cinnabun from "cinnabun"
import { createSignal } from "cinnabun"
import { SlideInOut } from "cinnabun-transitions"
import {
  selectedCommunity,
  isCommunityOwner,
  communityEditorModalOpen,
} from "../../state/community"
import { IconButton } from "../icons/IconButton"
import { EditIcon } from "../../components/icons"
import { AddPostButton } from "./AddPostButton"
export const CommunityFixedHeader = () => {
  const hasScrolled = createSignal(false)

  const onScroll = () => {
    if (hasScrolled.value && window.scrollY > 100) return
    hasScrolled.value = window.scrollY > 100
  }

  const onMounted = () => {
    window.addEventListener("scroll", onScroll)
  }
  const onUnmounted = () => {
    window.removeEventListener("scroll", onScroll)
  }

  return (
    <div onMounted={onMounted} onUnmounted={onUnmounted}>
      <SlideInOut
        className="community-page-fixed-title flex justify-content-between align-items-center"
        settings={{ from: "top" }}
        watch={hasScrolled}
        bind:visible={() => hasScrolled.value}
        cancelExit={() => hasScrolled.value}
      >
        <div className="flex gap-sm align-items-center">
          <h2 className="m-0 text-light" watch={selectedCommunity} bind:children>
            {() => selectedCommunity.value?.title}
          </h2>
          {isCommunityOwner() ? (
            <IconButton onclick={() => (communityEditorModalOpen.value = true)}>
              <EditIcon color="var(--light)" />
            </IconButton>
          ) : (
            <></>
          )}
        </div>
        <AddPostButton />
      </SlideInOut>
    </div>
  )
}
