import {Stack, Text} from "@chakra-ui/react";
import Link from "next/link";

export default function Home() {
  return (
    <Stack maxW={'container.sm'} w={'full'} h={'full'} textAlign={"center"}>
      <Text>Welcome to NEST Prize!</Text>
      <Link href={'/prize?code=abcd'}>
        Snatch Prize
      </Link>
      <Link href={'/history?code=abcd'}>
        History
      </Link>
    </Stack>
  )
}
