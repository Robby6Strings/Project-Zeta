import * as Cinnabun from "cinnabun"
import { createSignal, useComputed, Cinnabun as cb } from "cinnabun"

import { communityJoinModalOpen, selectedCommunityUrlTitle } from "../../state/community"
import { authModalOpen, authModalState, userStore } from "../../state/global"
import { postModalOpen, selectedPost, postCommentsPage } from "../../state/post"

import { Modal, ModalBody, ModalFooter, ModalHeader } from "../modal/Modal"
import { AuthorTag } from "../AuthorTag"
import { addPostComment, addPostReaction, getPost } from "../../../client/actions/posts"
import { PostComments } from "./PostComments"
import { PostWithMetaWithComments } from "../../../types/post"
import { commentValidation } from "../../../db/validation"
import { Button } from "../../components/Button"
import { EllipsisLoader } from "../loaders/Ellipsis"
import { timeSinceUTCDate } from "../../../utils"
import { IconButton } from "../icons/IconButton"
import { ThumbsUpIcon, ThumbsDownIcon } from "../icons"
import { API_ERROR } from "../../../constants"
import { UserIcon } from "../icons/UserIcon"
import { SkeletonElement } from "../loaders/SkeletonElement"
import { Carousel, CarouselImage } from "../carousel/Carousel"
import "./PostModal.css"

const loading = createSignal(false)
const postImages = createSignal<{
  id: string
  images: CarouselImage[]
}>({
  id: "",
  images: [],
})

const loadPost = async (post_id: string) => {
  if (loading.value) return
  loading.value = true
  const res = await getPost(post_id)
  if (!res) {
    loading.value = false
    return
  }
  if (!postModalOpen.value) return
  if (selectedPost.value) {
    if (selectedPost.value.id === res?.id) {
      selectedPost.value = res ?? null
      if (selectedPost.value.id !== postImages.value.id) {
        postImages.value = {
          id: selectedPost.value.id!,
          images: selectedPost.value?.media?.map((m) => ({ src: m.url, alt: "" })) ?? [],
        }
      }

      if (loading.value) loading.value = false
      return
    }
  }
}

if (cb.isClient) {
  useComputed(() => {
    if (!selectedPost.value?.id && postModalOpen.value) {
      postModalOpen.value = false
      postImages.value = {
        id: "",
        images: [],
      }
    }

    if (!selectedPost.value?.id) return
    if (!postModalOpen.value) postModalOpen.value = true
    loadPost(selectedPost.value.id)
  }, [selectedPost])
}

export const PostModal = () => {
  const reacting = createSignal(false)

  const state = Cinnabun.computed(selectedPost, () => {
    return selectedPost.value
  })

  const handleClose = () => {
    loading.value = false
    selectedPost.value = null
    postModalOpen.value = false
    postCommentsPage.value = 0
    window.history.pushState(null, "", window.location.pathname)
  }

  const addReaction = async (reaction: boolean) => {
    if (reacting.value) return
    if (!selectedPost.value?.id) return
    if (!userStore.value) {
      authModalState.value = {
        title: "Log in to interact with this post",
        message: "You must be logged in to interact with community posts.",
        callbackState: {
          post: selectedPost.value.id,
          community: selectedCommunityUrlTitle.value ?? undefined,
        },
      }
      authModalOpen.value = true
      return
    }

    if (selectedPost.value.userReaction === reaction) return

    reacting.value = true
    const res = await addPostReaction(selectedPost.value.id, reaction)
    if (!selectedPost.value) {
      reacting.value = false
      return
    }

    if ("message" in res) {
      if (res.message === API_ERROR.UNAUTHORIZED) {
        communityJoinModalOpen.value = true
        reacting.value = false
        return
      }
    } else {
      if (!selectedPost.value.reactions)
        selectedPost.value.reactions = {
          positive: 0,
          negative: 0,
        }

      if (selectedPost.value.userReaction === true) {
        selectedPost.value.reactions.positive--
      } else if (selectedPost.value.userReaction === false) {
        selectedPost.value.reactions.negative--
      }
      if (reaction === true) {
        selectedPost.value.reactions.positive++
      } else {
        selectedPost.value.reactions.negative++
      }
      selectedPost.value.userReaction = reaction
      state.notify()
    }

    reacting.value = false
  }

  return (
    <Modal size="lg" visible={postModalOpen} toggle={handleClose}>
      <ModalHeader className="modal-header flex flex-column gap-lg">
        <div watch={loading} bind:children className="flex gap-lg align-items-start">
          {() =>
            selectedPost.value?.title ? (
              <h2>{selectedPost.value.title}</h2>
            ) : (
              <SkeletonElement tag="h2" style="height:2.5rem; width:100%;" />
            )
          }
          <div watch={loading} bind:children className="ml-auto">
            {() =>
              selectedPost.value?.user && selectedPost.value.createdAt ? (
                <AuthorTag
                  user={selectedPost.value.user!}
                  date={timeSinceUTCDate(selectedPost.value.createdAt)}
                />
              ) : (
                <SkeletonElement
                  tag="div"
                  className="rounded-full"
                  style="height:2.5rem; min-width: 2.5rem;"
                />
              )
            }
          </div>
        </div>
        <div className="post-content" watch={loading} bind:children>
          {() =>
            selectedPost.value?.content ? (
              <p className="m-0">{selectedPost.value.content}</p>
            ) : (
              <SkeletonElement tag="p" style="min-height:1.5rem; width:100%;" />
            )
          }
        </div>
        <div watch={postImages} bind:children>
          {() =>
            postImages.value.images.length > 0 ? (
              <div className="post-media">
                <Carousel
                  images={postImages.value.images.map((m) => ({ src: m.src, alt: m.alt }))}
                />
              </div>
            ) : (
              <></>
            )
          }
        </div>
        <div watch={loading} bind:children className="flex justify-content-end">
          <div className="flex gap post-reactions">
            {() =>
              loading.value ? (
                <>
                  <SkeletonElement
                    tag="div"
                    className="rounded-sm"
                    style="height:1.5rem; min-width: 2.5rem;"
                  />
                  <SkeletonElement
                    tag="div"
                    className="rounded-sm"
                    style="height:1.5rem; min-width: 2.5rem;"
                  />
                </>
              ) : (
                <>
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
                </>
              )
            }
          </div>
        </div>
        <div watch={loading} bind:children className="flex gap ">
          {() =>
            loading.value ? (
              <>
                <SkeletonElement
                  tag="div"
                  className="rounded-full"
                  style="height:2.5rem; min-width: 2.5rem;"
                />
                <SkeletonElement tag="p" style="min-height:3rem; width:100%;" />
              </>
            ) : (
              <NewCommentForm post={selectedPost} />
            )
          }
        </div>
      </ModalHeader>

      <ModalBody>
        <PostComments />
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
  post: Cinnabun.Signal<Partial<PostWithMetaWithComments> | null>
}) => {
  const newComment = createSignal("")
  const loading = createSignal(false)

  const handleSubmit = async (e: Event) => {
    if (!post.value) return
    if (!post.value.communityId || !post.value.id) return
    e.preventDefault()
    if (!userStore.value) {
      authModalState.value = {
        title: "Log in to interact with this post",
        message: "You must be logged in to interact with community posts.",
        callbackState: {
          post: post.value.id,
          community: selectedCommunityUrlTitle.value ?? undefined,
        },
      }
      authModalOpen.value = true
      return
    }
    e.preventDefault()
    loading.value = true
    const res = await addPostComment(post.value.id, newComment.value)
    if (res && "message" in res) {
      if (res.message === API_ERROR.UNAUTHORIZED) {
        communityJoinModalOpen.value = true
        loading.value = false
        return
      }
    } else if (res) {
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
        {userStore.value?.picture ? (
          <div className="avatar-wrapper sm">
            <img className="avatar" src={userStore.value?.picture} alt={userStore.value?.name} />
          </div>
        ) : (
          <div className="avatar-wrapper sm">
            <UserIcon className="avatar" />
          </div>
        )}
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
