import * as Cinnabun from "cinnabun"
import { createSignal } from "cinnabun"
import { timeSinceUTCDate, truncateText } from "../../../utils"
import { PostWithMeta } from "../../../types/post"
import { IconButton } from "../icons/IconButton"
import { ThumbsUpIcon } from "../icons/ThumbsUpIcon"
import { ThumbsDownIcon } from "../icons/ThumbsDownIcon"
import { addPostReaction } from "../../../client/actions/posts"
import { communityJoinModalOpen, selectedCommunityUrlTitle } from "../../state/community"
import { userStore, authModalState, authModalOpen } from "../../state/global"

import { AuthorTag } from "../AuthorTag"
import "./PostCard.css"
import { CommentIcon } from "../icons/CommentIcon"
import { API_ERROR } from "../../../constants"
import { selectedPost } from "../../state/post"
import { Carousel } from "../carousel/Carousel"

export const PostCard = ({ post }: { post: PostWithMeta }) => {
  const state = createSignal(post)
  const reacting = createSignal(false)

  const addReaction = async (reaction: boolean) => {
    if (reacting.value) return
    if (!userStore.value) {
      authModalState.value = {
        title: "Log in to interact with this post",
        message: "You must be logged in to interact with community posts.",
        callbackState: {
          post: post.id,
          community: selectedCommunityUrlTitle.value ?? undefined,
        },
      }
      authModalOpen.value = true
      return
    }

    if (state.value.userReaction === reaction) return

    reacting.value = true
    const res = await addPostReaction(post.id, reaction)
    if (res && "message" in res) {
      if (res.message === API_ERROR.UNAUTHORIZED) {
        communityJoinModalOpen.value = true
        reacting.value = false
        return
      }
    } else if (res) {
      if (state.value.userReaction === true) {
        state.value.reactions.positive--
      } else if (state.value.userReaction === false) {
        state.value.reactions.negative--
      }
      if (reaction === true) {
        state.value.reactions.positive++
      } else {
        state.value.reactions.negative++
      }
      state.value.userReaction = reaction
      state.notify()
    }
    reacting.value = false
  }

  const viewPost = () => {
    selectedPost.value = post
    window.history.pushState(null, "", `${window.location.pathname}?post=${post.id}`)
  }

  return (
    <div className="card post-card flex flex-column" key={post.id}>
      <div className="flex justify-content-between gap align-items-start">
        <h4 className="m-0 title">
          <a href="javascript:void(0)" onclick={viewPost}>
            {post.title}
          </a>
        </h4>
        <AuthorTag user={post.user} date={timeSinceUTCDate(post.createdAt)} />
      </div>
      <p className="post-card-content">{truncateText(post.content, 256)}</p>
      {post.media.length > 0 ? (
        <div>
          <Carousel images={post.media.map((m) => ({ src: m.url, alt: "" }))} />
        </div>
      ) : (
        <></>
      )}

      <div className="flex justify-content-between">
        <button type="button" className="btn text-sm p-0" onclick={viewPost}>
          <span className="text-muted flex gap-sm align-items-center justify-content-center">
            <CommentIcon />
            {post.totalComments ?? 0}
          </span>
        </button>
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
              {() => state.value.reactions.positive ?? 0}
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
              {() => state.value.reactions.negative ?? 0}
            </small>
          </IconButton>
        </div>
      </div>
    </div>
  )
}
