import {NextApiRequest, NextApiResponse} from "next";
import sql from "../../../lib/sql";
import redisClient from "../../../lib/redisClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const {max, min, quantity, text, image, auth, balance} = req.body;
    // parse auth to array
    const auths = auth?.split(",") || null;
    try {
      // create a random string， only a-z, A-Z, not 0-9
      const randomString = (n: number) => {
        const str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let result = "";
        for (let i = 0; i < n; i++) {
          result += str.charAt(Math.floor(Math.random() * str.length));
        }
        return result;
      }
      const id = randomString(12);
      const data = await sql`
          INSERT INTO prizes (id, max, min, quantity, text, image, auth, balance)
          VALUES (${id}, ${max || 1}, ${min || 0.01}, ${quantity || 1}, ${text || "NEST Prize"}, ${image || null},
                  ${auths || null}, ${balance || 0})
          RETURNING *;
      `;
      // update redis record for this prize, set quantity as the initial value
      await redisClient.connect()
      await Promise.all([
        redisClient.HSET(`prize:${id}`, 'max', max || 1),
        redisClient.HSET(`prize:${id}`, 'min', min || 0.01),
        redisClient.HSET(`prize:${id}`, 'text', text || "NEST Prize"),
        redisClient.HSET(`prize:${id}`, 'auth', auth || ""), // auth is a string, not an array
        redisClient.HSET(`prize:${id}`, 'image', image || ""),
        redisClient.HSET(`prize:${id}`, 'quantity', quantity || 1),
        redisClient.HSET(`prize:${id}`, 'balance', balance || 0),
      ])
      // set TTL 30 days
      await redisClient.EXPIRE(`prize:${id}`, 30 * 24 * 60 * 60)
      await redisClient.disconnect();

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
      data: "TODO: get all prizes",
    });
  }

  return res.status(405).send({
    ok: false,
    error: "Method not allowed",
  })
}