import {Divider, Heading, Stack, Text} from "@chakra-ui/react"
import {useRouter} from "next/router";
import {useCallback, useEffect, useState} from "react";
import axios from "axios";

const Pizza = () => {
  const router = useRouter()
  const chatId = router.query.chatId
  const [data, setData] = useState<any>({
    tgName: '',
    issued: 0,
    unissued: 0,
    totalTrading: 0,
    details: []
  })

  const fetchData = useCallback(async () => {
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
        setData(res.data.data)
      }
    } catch (e) {
      console.log(e)
    }
  }, [chatId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <Stack w={'full'} p={'20px'}>
      <Heading>Pizza Invite Info</Heading>
      <Stack fontSize={'sm'}>
        <Text>tgName: @{data.tgName}</Text>
        <Text>Issued: {data.issued} NEST</Text>
        <Text>Unissued: {data.unissued} NEST</Text>
        <Text>Total Trading: {data.totalTrading} NEST</Text>
      </Stack>
      <Divider/>
      {
        data?.details.map((item: any, index: number) => (
          <Text key={index}>{index + 1}. @{item.tgName}: {item.positions} NEST</Text>
        ))
      }
    </Stack>
  )
}

export default Pizza