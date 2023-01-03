import {FormControl, Input, Stack, Table, Tbody, Td, Text, Th, Thead, Tr,} from "@chakra-ui/react";
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
    <Stack maxW={'container.sm'} w={'full'} p={'20px'} spacing={'20px'} overflow={"scroll"}>
      <Head>
        <title>Prize History</title>
      </Head>
      <Text fontSize={'sm'} fontWeight={'bold'} cursor={"pointer"}
            onClick={() => {
              router.push({
                pathname: '/prize',
                query: {
                  ...router.query
                }
              })
            }}>« Back</Text>
      <Text textAlign={"center"} fontWeight={'bold'}>Winning Prize Full List</Text>
      <FormControl>
        <Input placeholder={'search name or wallet...'} value={searchText}
               onChange={(e) => setSearchText(e.target.value)}/>
      </FormControl>
      <Table variant='striped' w={'full'}>
        <Thead>
          <Tr>
            <Th fontSize={'xs'}>index</Th>
            <Th fontSize={'xs'}>username</Th>
            <Th fontSize={'xs'} isNumeric>amount</Th>
          </Tr>
        </Thead>
        <Tbody>
          {list.filter((item) => item.tgName?.toLowerCase().startsWith(searchText.replaceAll('@', '').toLowerCase()) || item.wallet?.toLowerCase().startsWith(searchText.replaceAll('@', '').toLowerCase())).map((item, index) => (
            <Tr key={item.chat_id}>
              <Td fontSize={'xs'} fontWeight={user?.id === item.chat_id ? 'bold' : ''}
                  color={user?.id === item.chat_id ? 'red' : 'black'}>{index + 1}</Td>
              <Td fontSize={'xs'} fontWeight={user?.id === item.chat_id ? 'bold' : ''}
                  color={user?.id === item.chat_id ? 'red' : 'black'}>@{item.tgName} ({item.wallet.slice(0, 6)}...{item.wallet.slice(-4)})</Td>
              <Td fontSize={'xs'} fontWeight={user?.id === item.chat_id ? 'bold' : ''}
                  color={user?.id === item.chat_id ? 'red' : 'black'} isNumeric>{item.amount} NEST</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Stack>
  )
}

export default Detail