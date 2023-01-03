import {FormControl, Input, Stack, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr,} from "@chakra-ui/react";
import {useRouter} from "next/router";
import {useCallback, useEffect, useState} from "react";
import axios from "axios";
import Head from "next/head";

const Detail = () => {
  const router = useRouter();
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
        <Input placeholder={'search...'} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
      </FormControl>
      <TableContainer>
        <Table variant='striped'>
          <Thead>
            <Tr>
              <Th>index</Th>
              <Th>username</Th>
              <Th isNumeric>amount</Th>
            </Tr>
          </Thead>
          <Tbody>
            { list.filter((item) => item.tgName?.toLowerCase().startsWith(searchText.replaceAll('@', '').toLowerCase())).map((item, index) => (
              <Tr key={item.chat_id}>
                <Td fontSize={'sm'}>{index + 1}</Td>
                <Td fontSize={'sm'}>@{item.tgName}</Td>
                <Td fontSize={'sm'} isNumeric>{item.amount} NEST</Td>
              </Tr>
            )).reverse() }
          </Tbody>
        </Table>
      </TableContainer>
    </Stack>
  )
}

export default Detail