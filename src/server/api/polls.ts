import { FastifyInstance } from "fastify"
import { pollService } from "../services/pollService"
import { NewPoll } from "../../db/schema"
import { pollValidation } from "../../db/validation"

export function configurePollRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { page?: number } }>("/api/polls", async (req) => {
    return await pollService.getPage(
      req.query.page,
      req.cookies.user_id ?? null
    )
  })

  app.get<{ Params: { id?: string } }>("/api/polls/:id", async (req) => {
    if (!req.params.id) throw new Error("No id provided")
    return await pollService.getById(req.params.id, req.cookies.user_id ?? null)
  })

  app.post<{ Body: { desc: string; options: string[] } }>(
    "/api/polls",
    async (req) => {
      if (!req.cookies.user_id) throw new Error("Not logged in")
      if (!pollValidation.isPollValid(req.body.desc, req.body.options)) {
        throw new Error("Invalid poll")
      }

      const userId = req.cookies.user_id

      const res = await pollService.save(
        req.body as NewPoll & { options: string[] },
        userId
      )
      app.websocketServer?.clients.forEach(function each(client: any) {
        client.send(JSON.stringify({ type: "+poll", data: res }))
      })
      return res
    }
  )

  app.post<{ Params: { pollId: string; optionId: string } }>(
    "/api/polls/:pollId/vote/:optionId",
    async (req) => {
      if (!req.cookies.user_id) throw new Error("Not logged in")
      const { pollId, optionId } = req.params
      const res = await pollService.vote(pollId, optionId, req.cookies.user_id)
      app.websocketServer?.clients.forEach(function each(client: any) {
        client.send(
          JSON.stringify({
            type: "~voteCounts",
            data: {
              id: pollId,
              voteCounts: res,
            },
          })
        )
      })

      return res
    }
  )

  app.delete<{ Params: { pollId: string } }>(
    "/api/polls/:pollId",
    async (req, res) => {
      if (!req.cookies.user_id) throw new Error("Not logged in")
      const { pollId } = req.params

      const rows = await pollService.delete(pollId, req.cookies.user_id)
      if (!rows.length) {
        throw new Error("Failed to delete poll")
      }
      app.websocketServer?.clients.forEach(function each(client: any) {
        client.send(
          JSON.stringify({
            type: "-poll",
            data: {
              id: pollId,
            },
          })
        )
      })
      res.send(200)
    }
  )
}
