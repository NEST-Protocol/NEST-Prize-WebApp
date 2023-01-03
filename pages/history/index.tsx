import {Badge, Box, FormControl, HStack, Input, Link, Stack, Table, Tbody, Td, Text, Tr,} from "@chakra-ui/react";
import {useRouter} from "next/router";
import {useCallback, useEffect, useState} from "react";
import axios from "axios";
import Head from "next/head";
import useTelegramAuth from "../../hooks/useTelegramAuth";

const Detail = () => {
  const router = useRouter();
  const {user} = useTelegramAuth()
  const [list, setList] = useState<{
    amount: number,
    wallet: string,
    twitterName: string,
    updateTime: string,
    tgName: string,
    chat_id: number,
    status: string,
  }[]>([])
  const [searchText, setSearchText] = useState('')

  const fetchList = useCallback(async () => {
    if (!router.query.code || Number.isNaN(Number(router.query.code))) {
      return
    }
    try {
      const res = await axios({
        method: 'get',
        url: `https://cms.nestfi.net/bot-api/red-bot/prizes-logs/${router.query.code}`,
        headers: {
          'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`
        }
      })
      if (res.data.errorCode === 0) {
        setList(res.data.value)
      }
    } catch (e) {
      console.log(e)
    }
  }, [router.query.code])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  return (
    <Stack maxW={'container.sm'} w={'full'} p={'20px'} spacing={'10px'} overflow={"scroll"}>
      <Head>
        <title>Winning Prize Full List</title>
      </Head>
      <HStack justify={'space-between'}>
        <Text fontSize={'sm'} fontWeight={'bold'} cursor={"pointer"} w={'20px'}
              onClick={() => {
                router.push({
                  pathname: '/prize',
                  query: {
                    ...router.query
                  }
                })
              }}>«</Text>
        <Text textAlign={"center"} fontWeight={'bold'}>Winning Prize Full List</Text>
        <Box w={'20px'}></Box>
      </HStack>
      <FormControl>
        <Input placeholder={'search name or wallet...'} value={searchText} fontSize={'xs'} borderRadius={'0'}
               onChange={(e) => setSearchText(e.target.value)}/>
      </FormControl>
      <Text fontSize={'xs'} color={'gray'}>{list.length} users snatched success</Text>
      <Table variant='striped' w={'full'}>
        <Tbody>
          <Tr fontWeight={'bold'} fontSize={'xs'}>
            <Td>
              <Badge variant={'outline'}>AD</Badge>
              <Link> Star this project, or new issues on GitHub!</Link>
            </Td>
            <Td isNumeric>
              NEST-Protocol
            </Td>
          </Tr>
          {list.filter((item) => item.tgName?.toLowerCase().startsWith(searchText.replaceAll('@', '').toLowerCase()) || item.wallet?.toLowerCase().startsWith(searchText.replaceAll('@', '').toLowerCase())).map((item) => (
            <Tr key={item.chat_id} fontSize={'xs'} fontWeight={user?.id === item.chat_id ? 'bold' : ''} color={user?.id === item.chat_id ? 'red' : 'black'}>
              <Td>@{item.tgName || '-'}<br/>{item.wallet.slice(0, 8)}...{item.wallet.slice(-6)}</Td>
              <Td isNumeric>{item.amount} NEST</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Stack>
  )
}

export default Detail