import { NewCommunity, NewPost } from "./schema"

export const userValidation = {
  minUserNameLength: 1,
  maxUserNameLength: 80,
  isUserNameValid: (name: string) => {
    if (
      name.length < userValidation.minUserNameLength ||
      name.length > userValidation.maxUserNameLength
    ) {
      return false
    }
    return true
  },
}

export const pollValidation = {
  minPollDescLength: 1,
  maxPollDescLength: 255,
  minPollOptions: 2,
  minPollOptionDescLength: 1,
  maxPollOptionDescLength: 32,
  isPollValid: (desc: string, options: string[]): boolean => {
    if (
      desc.length < pollValidation.minPollDescLength ||
      desc.length > pollValidation.maxPollDescLength
    ) {
      return false
    }

    if (options.length < pollValidation.minPollOptions) {
      return false
    }
    if (
      options.some(
        (option) =>
          option.length < pollValidation.minPollOptionDescLength ||
          option.length > pollValidation.maxPollOptionDescLength
      )
    ) {
      return false
    }
    return true
  },
}

export const communityValidation = {
  minCommunityNameLength: 6,
  maxCommunityNameLength: 128,
  minCommunityDescLength: 0,
  maxCommunityDescLength: 255,
  isCommunityTitleValid: (name: string | undefined) => {
    if (!name) return false
    if (
      name.length < communityValidation.minCommunityNameLength ||
      name.length > communityValidation.maxCommunityNameLength
    ) {
      return false
    }

    if (!/^[a-zA-Z0-9-_ ()]*$/.test(name)) {
      return false
    }
    return true
  },
  isCommunityValid: (community: Partial<NewCommunity>) => {
    if (!community.description) return false
    if (!communityValidation.isCommunityTitleValid(community.title)) return false
    if (
      community.description.length < communityValidation.minCommunityDescLength ||
      community.description.length > communityValidation.maxCommunityDescLength
    ) {
      return false
    }

    if (community.nsfw && !community.private) return false

    return true
  },
}

export const postValidation = {
  minPostTitleLength: 1,
  maxPostTitleLength: 128,
  minPostContentLength: 1,
  maxPostContentLength: 2048,
  isTitleValid: (title: string) => {
    if (
      title.length < postValidation.minPostTitleLength ||
      title.length > postValidation.maxPostTitleLength
    ) {
      return false
    }
    return true
  },
  isContentValid: (content: string) => {
    if (
      content.length < postValidation.minPostContentLength ||
      content.length > postValidation.maxPostContentLength
    ) {
      return false
    }
    return true
  },
  isPostValid: (post: Partial<NewPost>) => {
    if (!post.title || !post.content) return false
    return postValidation.isTitleValid(post.title) && postValidation.isContentValid(post.content)
  },
}

export const commentValidation = {
  minCommentContentLength: 1,
  maxCommentContentLength: 255,
  isCommentValid: (content: string) => {
    if (
      content.length < commentValidation.minCommentContentLength ||
      content.length > commentValidation.maxCommentContentLength
    ) {
      return false
    }

    return true
  },
}
