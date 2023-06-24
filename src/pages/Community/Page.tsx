import * as Cinnabun from "cinnabun"
import { getCommunity } from "../../client/actions/communities"
import { Community } from "../../db/schema"
import { DefaultLoader } from "../../components/loaders/Default"
import { setPath } from "cinnabun/router"
import { pathStore } from "../../state"
import { CommunityPosts } from "../../components/community/CommunityPosts"
import { CommunityData } from "../../types/community"
import { PostCreator } from "../../components/community/PostCreator"
import "./Page.css"

export default function Communities({
  params,
}: {
  params?: { communityId?: string }
}) {
  if (!params?.communityId) return setPath(pathStore, "/communities")

  const loadCommunity = async (): Promise<Community | undefined> => {
    const res = await getCommunity(params.communityId!)
    if (!res) {
      setPath(pathStore, "/communities")
      return
    }
    console.log("Load community", res)
    return res
  }

  return (
    <Cinnabun.Suspense promise={loadCommunity} cache>
      {(loading: boolean, community: CommunityData | undefined) => {
        if (loading) {
          return (
            <div className="page-body">
              <DefaultLoader />
            </div>
          )
        } else if (!community) {
          return (
            <div className="page-body">
              <div>Community not found 😢</div>
            </div>
          )
        }

        return (
          <>
            <div className="page-title flex-column">
              <h2>{community.title}</h2>
              {community.description && <div>{community.description}</div>}
            </div>
            <div className="page-body">
              <div className="community-page-inner">
                <div className="flex flex-column flex-grow">
                  <div className="section-title">
                    <h3>Posts</h3>
                    <PostCreator communityId={community.id} />
                  </div>
                  <CommunityPosts posts={community.posts} />
                </div>
                <div className="flex flex-column">
                  <h3>Members</h3>
                  <div className="flex-row">
                    {community.members.map((member) => (
                      <div key={member.id} className="flex-column">
                        <div>{member.user.name}</div>
                        <div>{member.memberType}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      }}
    </Cinnabun.Suspense>
  )
}