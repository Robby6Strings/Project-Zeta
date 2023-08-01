import * as Cinnabun from "cinnabun"
import { createSignal } from "cinnabun"
import {
  selectedCommunityPost,
  postModalOpen,
  communityJoinModalOpen,
  isCommunityMember,
  postCommentsPage,
} from "../../state/community"
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../modal/Modal"
import { AuthorTag } from "../AuthorTag"
import { addPostComment, addPostReaction, getPost } from "../../client/actions/posts"
import { PostComments } from "./PostComments"
import { CommunityPostDataWithComments } from "../../types/post"
import { authModalOpen, authModalState, userStore } from "../../state/global"
import { commentValidation } from "../../db/validation"
import { AuthModalCallback } from "../../types/auth"
import { Button } from "../Button"
import { EllipsisLoader } from "../loaders/Ellipsis"
import { timeSinceUTCDate } from "../../utils"
import { IconButton } from "../IconButton"
import { ThumbsUpIcon, ThumbsDownIcon } from "../icons"

const loading = createSignal(false)

const loadPost = async (postId: string) => {
  if (loading.value) return
  if (!postModalOpen.value) return
  loading.value = true
  const res = await getPost(postId)
  if (!postModalOpen.value) return
  if (selectedCommunityPost.value) {
    if (selectedCommunityPost.value.id === res?.id) {
      selectedCommunityPost.value = res ?? null
      loading.value = false
      return
    }
  }
}

selectedCommunityPost.subscribe((post) => {
  if (post?.id && !postModalOpen.value) {
    postModalOpen.value = true
    loadPost(post.id)
  } else if (!post?.id && postModalOpen.value) {
    postModalOpen.value = false
  }
})

export const PostModal = () => {
  const reacting = createSignal(false)

  const state = Cinnabun.computed(selectedCommunityPost, () => {
    return selectedCommunityPost.value
  })

  const handleClose = () => {
    if (authModalOpen.value) {
      authModalOpen.value = false
      return
    } else if (communityJoinModalOpen.value) {
      communityJoinModalOpen.value = false
      return
    }
    loading.value = false
    selectedCommunityPost.value = null
    postModalOpen.value = false
    postCommentsPage.value = 0
    window.history.pushState(null, "", window.location.pathname)
  }

  const addReaction = async (reaction: boolean) => {
    if (reacting.value) return
    if (!selectedCommunityPost.value?.id) return
    if (!userStore.value) {
      authModalState.value = {
        title: "Log in to interact with this post",
        message: "You must be logged in to interact with community posts.",
        callbackAction: AuthModalCallback.ViewCommunity,
      }
      authModalOpen.value = true
      return
    }
    if (!isCommunityMember()) {
      communityJoinModalOpen.value = true
      return
    }

    reacting.value = true
    const res = await addPostReaction(selectedCommunityPost.value.id, reaction)
    if (res) {
      if (!selectedCommunityPost.value) {
        reacting.value = false
        return
      }
      if (!selectedCommunityPost.value.reactions)
        selectedCommunityPost.value.reactions = {
          positive: 0,
          negative: 0,
        }

      if (selectedCommunityPost.value.userReaction === true) {
        selectedCommunityPost.value.reactions.positive--
      } else if (selectedCommunityPost.value.userReaction === false) {
        selectedCommunityPost.value.reactions.negative--
      }
      if (reaction === true) {
        selectedCommunityPost.value.reactions.positive++
      } else {
        selectedCommunityPost.value.reactions.negative++
      }
      selectedCommunityPost.value.userReaction = reaction
      state.notify()
    }
    reacting.value = false
  }

  return (
    <Modal large visible={postModalOpen} toggle={handleClose}>
      <ModalHeader
        className="modal-header flex flex-column gap-lg"
        watch={selectedCommunityPost}
        bind:children
      >
        <div className="flex gap-lg align-items-start">
          <h2>{() => selectedCommunityPost.value?.title ?? ""}</h2>
          {() =>
            selectedCommunityPost.value?.user && selectedCommunityPost.value.createdAt ? (
              <div className="ml-auto">
                <AuthorTag
                  user={selectedCommunityPost.value.user!}
                  date={timeSinceUTCDate(selectedCommunityPost.value.createdAt)}
                />
              </div>
            ) : (
              <></>
            )
          }
        </div>
        <div className="post-content">
          <p watch={selectedCommunityPost} bind:children className="m-0">
            {() => selectedCommunityPost.value?.content ?? ""}
          </p>
        </div>
        <div
          watch={selectedCommunityPost}
          bind:visible={() => typeof selectedCommunityPost.value?.userReaction !== "undefined"}
          className="flex justify-content-end"
        >
          <div className="flex gap post-reactions">
            <IconButton
              onclick={() => addReaction(true)}
              bind:className={() =>
                `icon-button flex align-items-center gap-sm ${
                  state.value?.userReaction === true ? "selected" : ""
                }`
              }
              watch={[userStore, reacting, state]}
              bind:disabled={() => reacting.value}
            >
              <ThumbsUpIcon
                color="var(--primary)"
                color:hover="var(--primary-light)"
                className="text-rg"
              />
              <small className="text-muted" watch={state} bind:children>
                {() => state.value?.reactions?.positive ?? 0}
              </small>
            </IconButton>
            <IconButton
              onclick={() => addReaction(false)}
              bind:className={() =>
                `icon-button flex align-items-center gap-sm ${
                  state.value?.userReaction === false ? "selected" : ""
                }`
              }
              watch={[userStore, reacting, state]}
              bind:disabled={() => reacting.value}
            >
              <ThumbsDownIcon
                color="var(--primary)"
                color:hover="var(--primary-light)"
                className="text-rg"
              />
              <small className="text-muted" watch={state} bind:children>
                {() => state.value?.reactions?.negative ?? 0}
              </small>
            </IconButton>
          </div>
        </div>
        <div
          watch={selectedCommunityPost}
          bind:visible={() => !!selectedCommunityPost.value?.comments}
        >
          <NewCommentForm post={selectedCommunityPost} />
        </div>
      </ModalHeader>
      <ModalBody>
        <PostComments post={selectedCommunityPost} />
      </ModalBody>
      <ModalFooter className="modal-footer p-2">
        <Button
          className="btn w-100 flex justify-content-center py-3 text-muted text-rg"
          onclick={handleClose}
        >
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
}

const NewCommentForm = ({
  post,
}: {
  post: Cinnabun.Signal<Partial<CommunityPostDataWithComments> | null>
}) => {
  const newComment = createSignal("")
  const loading = createSignal(false)

  const handleSubmit = async (e: Event) => {
    if (!post.value) return
    if (!post.value.communityId || !post.value.id) return
    e.preventDefault()
    if (!userStore.value) {
      if (!userStore.value) {
        authModalState.value = {
          title: "Log in to interact with this post",
          message: "You must be logged in to interact with community posts.",
          callbackAction: AuthModalCallback.ViewCommunity,
        }
        authModalOpen.value = true
        return
      }
      return
    }
    if (!isCommunityMember()) {
      communityJoinModalOpen.value = true
      return
    }
    e.preventDefault()
    loading.value = true
    const res = await addPostComment(post.value.id, newComment.value)
    if (res) {
      if (!post.value.comments) post.value.comments = []
      post.value.comments.unshift(res)
      post.value.totalComments = (parseInt(post.value.totalComments ?? "0") + 1).toString()
      post.notify()
      newComment.value = ""
    }
    loading.value = false
  }

  const handleInput = (e: Event) => {
    e.preventDefault()
    newComment.value = (e.target as HTMLInputElement).value
  }

  return (
    <form
      className="flex-grow flex align-items-center gap flex-wrap justify-content-end"
      onsubmit={handleSubmit}
    >
      <div className="flex align-items-center gap flex-wrap flex-grow">
        <div className="avatar-wrapper sm">
          <img className="avatar" src={userStore.value?.picture} alt={userStore.value?.name} />
        </div>
        <div className="flex-grow">
          <textarea
            className="form-control"
            placeholder="Write a comment..."
            watch={newComment}
            bind:value={() => newComment.value}
            oninput={handleInput}
          />
        </div>
      </div>
      <Button
        watch={[loading, newComment]}
        bind:disabled={() => loading.value || !commentValidation.isCommentValid(newComment.value)}
        type="submit"
        className="btn btn-primary hover-animate"
      >
        Add Comment
        <EllipsisLoader watch={loading} bind:visible={() => loading.value} />
      </Button>
    </form>
  )
}
