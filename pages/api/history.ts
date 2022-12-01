import {NextApiRequest, NextApiResponse} from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // TODO: fetch prize log from db
  res.status(200).send({
    ok: true,
  });
}