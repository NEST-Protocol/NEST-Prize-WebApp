import {Stack, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr} from "@chakra-ui/react";
import {useRouter} from "next/router";
import {useCallback, useEffect, useState} from "react";
import axios from "axios";
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
  const [myAmount, setMyAmount] = useState(0)

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

  const fetchMyAmount = useCallback(async () => {
    const index = list.findIndex((item) => item.chat_id === user?.id)
    if (index >= 0) {
      setMyAmount(list[index].amount)
    }
  }, [list, user])

  useEffect(() => {
    fetchMyAmount()
  }, [fetchMyAmount])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  return (
    <Stack maxW={'container.sm'} w={'full'} h={'100vh'} p={'20px'} spacing={'20px'}>
      <Text fontSize={'sm'} fontWeight={'bold'} cursor={"pointer"}
            onClick={() => {
              router.push({
                pathname: '/prize',
                query: {
                  ...router.query
                }
              })
            }}>« Back</Text>
      <Text textAlign={"center"} fontWeight={'bold'}>Winning Prize List</Text>
      {
        user && myAmount > 0 && (
          <Text>@{user?.username} have got {myAmount} NEST!</Text>
        )
      }

      <Text textAlign={"center"} fontWeight={'bold'}>Full List</Text>
      <TableContainer>
        <Table variant='striped'>
          <Thead>
            <Tr>
              <Th>username</Th>
              <Th isNumeric>amount</Th>
            </Tr>
          </Thead>
          <Tbody>
            { list.map((item) => (
              <Tr key={item.chat_id}>
                <Td>@{item.tgName}</Td>
                <Td isNumeric>{item.amount} NEST</Td>
              </Tr>
            )) }
          </Tbody>
        </Table>
      </TableContainer>
    </Stack>
  )
}

export default Detail