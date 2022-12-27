import {Heading, Stack, Text} from "@chakra-ui/react"
import {useRouter} from "next/router";
import {useCallback, useEffect, useState} from "react";
import axios from "axios";

const Pizza = () => {
  const router = useRouter()
  const chatId = router.query.chatId
  const [data, setData] = useState<any[]>([])

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

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <Stack>
      <Heading>Pizza Invite Info</Heading>
      {
        data.map((item, index) => (
          <Text key={index}>@{item.tgName}: {item.position} NEST</Text>
        ))
      }
    </Stack>
  )
}

export default Pizza