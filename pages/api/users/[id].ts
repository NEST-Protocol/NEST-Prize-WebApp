import {NextApiRequest, NextApiResponse} from "next";
import sql from "../../../lib/sql";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const {id} = req.query;
    if (!id) {
      return res.status(400).send({
        ok: false,
        error: "Missing id",
      });
    }
    try {
      const data = await sql`
          SELECT *
          FROM users
          WHERE id = ${id}
      `;
      if (!data[0]) {
        return res.status(404).send({
          ok: false,
          error: "User not found",
        });
      }
      return res.status(200).send({
        ok: true,
        data
      });
    } catch (e) {
      return res.status(500).send({
        ok: false,
        // @ts-ignore
        error: e.message,
      });
    }
  }

  // update user info without balance
  if (req.method === "PUT") {
    const {id, username, wallet, twitter_id, twitter_username} = req.body;
    try {
      const data = await sql`
          UPDATE users
          SET username         = ${username || null},
              wallet           = ${wallet || null},
              twitter_id       = ${twitter_id || null},
              twitter_username = ${twitter_username || null},
              update_at        = NOW()
          WHERE id = ${id}
          RETURNING *;
      `
      return res.status(200).send({
        ok: true,
        data
      })
    } catch (e) {
      return res.status(500).send({
        ok: false,
        // @ts-ignore
        error: e.message,
      });
    }
  }

  return res.status(405).send({
    ok: false,
    error: "Method not allowed",
  })
}