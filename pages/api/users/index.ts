import {NextApiRequest, NextApiResponse} from "next";
import sql from "../../../lib/sql";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const {id, username, wallet} = req.body;
    try {
      const data = await sql`
          INSERT INTO users (id, username, wallet)
          VALUES (${id}, ${username}, ${wallet})
          ON CONFLICT (id) DO UPDATE SET username  = ${username},
                                         wallet    = ${wallet},
                                         update_at = NOW()
          RETURNING *;
      `;
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

  if (req.method === "GET") {
    return res.status(200).send({
      ok: true,
      data: "TODO: get all users",
    });
  }

  return res.status(405).send({
    ok: false,
    error: "Method not allowed",
  })
}