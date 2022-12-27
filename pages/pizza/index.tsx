import {Heading, Stack, Text} from "@chakra-ui/react"
import {useRouter} from "next/router";
import {useCallback, useEffect, useState} from "react";
import axios from "axios";

const Pizza = () => {
  const router = useRouter()
  const chatId = router.query.chatId
  const [data, setData] = useState<any[]>([])
  const [data2, setData2] = useState<any>({
    issued: 0,
    unissued: 0,
    totalTrading: 0,
  })

  const fetchData = useCallback(async () => {
    if (!chatId) return
    try {
      const res = await axios({
        method: 'GET',
        url: `https://work.parasset.top/workbench-api/activity/user/invite/list?chatId=${chatId}`,
        headers: {
          'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`
        }
      })
      if (res?.data?.data) {
        setData(res.data.data)
      }
    } catch (e) {
      console.log(e)
    }
  }, [chatId])

  const fetchData2 = useCallback(async () => {
    if (!chatId) return
    try {
      const res = await axios({
        method: 'GET',
        url: `https://work.parasset.top/workbench-api/activity/user/invite/info?chatId=${chatId}`,
        headers: {
          'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`
        }
      })
      if (res?.data?.data) {
        setData2(res.data.data)
      }
    } catch (e) {
      console.log(e)
    }
  }, [chatId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    fetchData2()
  }, [fetchData2])

  return (
    <Stack>
      <Heading>Pizza Invite Info</Heading>
      <Stack fontSize={'sm'}>
        <Text>Issued: {data2.issued} NEST</Text>
        <Text>Unissued: {data2.unissued} NEST</Text>
        <Text>Total Trading: {data2.totalTrading} NEST</Text>
      </Stack>
      {
        data.map((item, index) => (
          <Text key={index}>@{item.tgName}: {item.position} NEST</Text>
        ))
      }
    </Stack>
  )
}

export default Pizza