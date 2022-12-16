import {Stack, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr} from "@chakra-ui/react";
import {useRouter} from "next/router";
import {useCallback, useEffect, useState} from "react";
import axios from "axios";

const Detail = () => {
  const router = useRouter();
  const [list, setList] = useState([])


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
      console.log(res.data)
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
      <Text>@username have got 100 NEST!</Text>

      <Text textAlign={"center"} fontWeight={'bold'}>Full List</Text>
      <TableContainer>
        <Table variant='striped'>
          <Thead>
            <Tr>
              <Th>id</Th>
              <Th>username</Th>
              <Th isNumeric>amount</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>1</Td>
              <Td>@username</Td>
              <Td isNumeric>25.4 NEST</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </Stack>
  )
}

export default Detail