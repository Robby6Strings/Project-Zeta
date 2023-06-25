import * as Cinnabun from "cinnabun"
import { createSignal, computed } from "cinnabun"
import { setPath } from "cinnabun/router"
import { formatUTCDate, truncateText } from "../../utils"
import { CommunityPostData } from "../../types/post"
import { IconButton } from "../IconButton"
import { ThumbsUpIcon } from "../icons/ThumbsUpIcon"
import { ThumbsDownIcon } from "../icons/ThumbsDownIcon"
import { addPostReaction } from "../../client/actions/posts"
import { pathStore, selectedCommunity, userStore } from "../../state"
import { PostCardComments } from "./PostCardComments"
import "./PostCard.css"

export const PostCard = ({ post }: { post: CommunityPostData }) => {
  const state = createSignal(post)
  const reacting = createSignal(false)

  const hasReacted = (reaction: boolean) => {
    if (!userStore.value) return false
    return state.value.reactions.some(
      (r) => r.ownerId === userStore.value?.userId && r.reaction === reaction
    )
  }
  const addReaction = async (reaction: boolean) => {
    if (reacting.value) return
    if (!userStore.value) return
    if (hasReacted(reaction)) return

    reacting.value = true
    const res = await addPostReaction(post.id, reaction)
    if (res) {
      // find and remove previous reaction
      const prevReaction = state.value.reactions.find((r) => r.ownerId === userStore?.value?.userId)
      if (prevReaction) {
        state.value.reactions.splice(state.value.reactions.indexOf(prevReaction), 1)
      }

      state.value.reactions.push(res)
      state.notify()
    }
    reacting.value = false
  }

  const disableReaction = () => {
    if (reacting.value) return true
    if (!userStore.value) return true
    return false
  }

  const totalReactions = computed(state, () => {
    return state.value.reactions.reduce(
      (acc, reaction) => {
        if (reaction.reaction) {
          acc.positive++
        } else {
          acc.negative++
        }
        return acc
      },
      { positive: 0, negative: 0 }
    )
  })

  return (
    <div className="card post-card flex flex-column" key={post.id}>
      <div className="flex justify-content-between gap">
        <h4 className="m-0 title">
          <a
            href={`/communities/${selectedCommunity.value?.url_title}/${post.id}`}
            onclick={(e: Event) => {
              e.preventDefault()
              setPath(pathStore, `/communities/${selectedCommunity.value?.url_title}/${post.id}`)
            }}
          >
            {post.title}
          </a>
        </h4>
        <small className="author text-muted">
          <span>{post.user.name}</span>
          <span className="created-at">{formatUTCDate(post.createdAt.toString())}</span>
        </small>
      </div>
      <p className="post-card-content">{truncateText(post.content, 256)}</p>
      <div className="flex gap post-reactions">
        <IconButton
          onclick={() => addReaction(true)}
          className="rounded-lg flex align-items-center gap-sm"
          watch={[userStore, reacting]}
          bind:disabled={disableReaction}
        >
          <ThumbsUpIcon
            color="var(--primary)"
            color:hover="var(--primary-light)"
            className="text-lg"
          />
          <small className="text-muted" watch={totalReactions} bind:children>
            {() => totalReactions.value.positive}
          </small>
        </IconButton>
        <IconButton
          onclick={() => addReaction(false)}
          className="rounded-lg flex align-items-center gap-sm"
          watch={[userStore, reacting]}
          bind:disabled={disableReaction}
        >
          <ThumbsDownIcon
            color="var(--primary)"
            color:hover="var(--primary-light)"
            className="text-lg"
          />
          <small className="text-muted" watch={totalReactions} bind:children>
            {() => totalReactions.value.negative}
          </small>
        </IconButton>
      </div>
      <PostCardComments post={state} />
    </div>
  )
}
