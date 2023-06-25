import { eq } from "drizzle-orm"
import { db } from "../../db"
import { Post, posts, postReactions, PostReaction, NewPost } from "../../db/schema"

export const postService = {
  async getPost(postId: string): Promise<Post | undefined> {
    try {
      return (await db.select().from(posts).where(eq(posts.id, postId))).at(0)
    } catch (error) {
      console.error(error)
      return
    }
  },

  async addPostReaction(
    postId: string,
    userId: string,
    reaction: boolean
  ): Promise<PostReaction | undefined> {
    try {
      return (
        await db
          .insert(postReactions)
          .values({
            postId,
            ownerId: userId,
            reaction,
          })
          .returning()
      ).at(0)
    } catch (error) {
      console.error(error)
      return
    }
  },

  async getPosts(communityId: string, offset: number = 0): Promise<Post[] | undefined> {
    try {
      return await db
        .select()
        .from(posts)
        .where(eq(posts.communityId, communityId))
        .offset(offset)
        .limit(10)
        .orderBy(posts.createdAt)
    } catch (error) {
      console.error(error)
      return
    }
  },
  async createPost(post: NewPost): Promise<Post | undefined> {
    try {
      return (await db.insert(posts).values(post).returning()).at(0)
    } catch (error) {
      console.error(error)
      return
    }
  },
}
