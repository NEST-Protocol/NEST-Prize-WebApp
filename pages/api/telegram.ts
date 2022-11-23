import { NextApiRequest, NextApiResponse } from "next";

const { subtle } = require("crypto").webcrypto;

type TransformInitData = {
  [k: string]: string;
};

function transformInitData(initData: string): TransformInitData {
  return Object.fromEntries(new URLSearchParams(initData));
}

async function validate(data: TransformInitData, botToken: string) {
  const encoder = new TextEncoder();

  const checkString = Object.keys(data)
    .filter((key) => key !== "hash")
    .map((key) => `${key}=${data[key]}`)
    .sort()
    .join("\n");

  const secretKey = await subtle.importKey(
    "raw",
    encoder.encode("WebAppData"),
    { name: "HMAC", hash: "SHA-256" },
    true,
    ["sign"]
  );
  const secret = await subtle.sign("HMAC", secretKey, encoder.encode(botToken));
  const signatureKey = await subtle.importKey(
    "raw",
    secret,
    { name: "HMAC", hash: "SHA-256" },
    true,
    ["sign"]
  );
  const signature = await subtle.sign(
    "HMAC",
    signatureKey,
    encoder.encode(checkString)
  );

  // @ts-ignore
  const hex = [...new Uint8Array(signature)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return data.hash === hex;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const initData = req.body._auth;

  if (!initData) {
    res.status(400);
    return;
  }

  const data = transformInitData(initData);
  const isOk = await validate(
    data,
    process.env.BOT_TOKEN!
  );

  if (isOk) {
    res.status(200).send({
      ok: isOk,
    });
  } else {
    res.status(403).send({
      error: "Invalid hash",
    });
  }
}