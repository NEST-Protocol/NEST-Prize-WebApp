import {NextApiRequest, NextApiResponse} from "next";
import sql from "../../lib/sql";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user_id = req.query.id;
  if (!user_id) {
    return
  }
  try {
    const balance = await sql`
        SELECT balance
        FROM "user"
        WHERE id = ${user_id}
    `
    if (balance.length === 0) {
      res.status(404).send({
        ok: false,
        error: "User not found"
      })
    }
    res.status(200).send({
      ok: true,
      data: {
        balance: balance[0].balance
      }
    })
  } catch (e) {
    console.log(e);
    res.status(500).send({
      ok: false,
      error: "Internal server error"
    })
  }
}