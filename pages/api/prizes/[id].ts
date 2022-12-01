import {NextApiRequest, NextApiResponse} from "next";
import sql from "../../../lib/sql";
import redisClient from "../../../lib/redisClient";

// GET /api/prizes/:id
// get prize info

// POST /api/prizes/:id
// snatch prize

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET prize info
  if (req.method === "GET") {
    const {id} = req.query;
    if (!id) {
      return res.status(400).send({
        ok: false,
        error: "Missing id",
      });
    }
    try {
      // query redis first
      // if not found, query db
      await redisClient.connect()
      const data = await redisClient.HGETALL(`prize:${id}`)
      if (data && Object.keys(data).length > 0) {
        await redisClient.disconnect();
        return res.status(200).send({
          ok: true,
          cache: true, // indicate this data is from redis
          data: [
            {
              id,
              max: data.max,
              min: data.min,
              quantity: data.quantity,
              text: data.text,
              image: data.image || null,
              auth: data.auth || null,
              balance: 0,
            }
          ]
        });
      } else {
        const data = await sql`
            SELECT *
            FROM prizes
            WHERE id = ${id}
        `;
        if (!data[0]) {
          return res.status(404).send({
            ok: false,
            error: "Prize not found",
          });
        }
        // update redis record for this prize
        await Promise.all([
          redisClient.HSET(`prize:${id}`, 'max', data[0].max),
          redisClient.HSET(`prize:${id}`, 'min', data[0].min),
          redisClient.HSET(`prize:${id}`, 'text', data[0].text),
          redisClient.HSET(`prize:${id}`, 'auth', data[0].auth || ""), // auth is a string, not an array
          redisClient.HSET(`prize:${id}`, 'image', data[0].image || ""),
          redisClient.HSET(`prize:${id}`, 'quantity', data[0].quantity),
          redisClient.HSET(`prize:${id}`, 'balance', data[0].balance),
        ])
        // set TTL 30 days
        await redisClient.EXPIRE(`prize:${id}`, 30 * 24 * 60 * 60)
        await redisClient.disconnect();
        return res.status(200).send({
          ok: true,
          data
        });
      }
    } catch (e) {
      return res.status(500).send({
        ok: false,
        // @ts-ignore
        error: e.message,
      });
    }
  }

  // snatch prize
  if (req.method === "POST") {
    const {id} = req.query;
    const {user_id} = req.body;

    if (!id || !user_id) {
      return res.status(400).send({
        ok: false,
        error: "Missing prize id or user id",
      });
    }
    try {
      // query redis directly to check if prize is available
      // TODO
      await redisClient.connect()
      const data = await redisClient.HGETALL(`prize:${id}`)
      if (data && Object.keys(data).length > 0) {

      }
      // return error if prize is not available
      return res.status(404).send({
        ok: false,
        error: "Prize not found",
      });
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