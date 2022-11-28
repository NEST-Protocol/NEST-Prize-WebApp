import {Button, Stack, Text} from "@chakra-ui/react";
import Link from "next/link";
import {useRouter} from "next/router";

const History = () => {
  const route  = useRouter();

  return (
    <Stack maxW={'container.sm'} w={'full'} h={'100vh'} p={'20px'} spacing={'20px'}>
      <Text textAlign={"center"}>Completed</Text>
      <Link href={'/prize'}/>
      <Button onClick={() => {
        route.push({
          pathname: '/history/detail',
          query: {
            ...route.query
          }
        })
      }}>
        Winning Prize List
      </Button>
    </Stack>
  )
}

export default History