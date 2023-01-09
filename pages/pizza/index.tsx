import {Button, Divider, Heading, HStack, Spacer, Stack, Text, useClipboard} from "@chakra-ui/react"
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
    details: [],
    wallet: ''
  })
  const {onCopy, setValue, hasCopied} = useClipboard('')

  useEffect(() => {
    if (chatId) {
      setValue(`https://t.me/NESTRedEnvelopesBot?start=${chatId}`)
    }
  }, [chatId, setValue])

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
      console.log(res.data)
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
    <Stack w={'full'} p={'20px'} spacing={'20px'}>
      <HStack>
        <Stack spacing={0}>
          <Text fontSize={'xl'} fontWeight={'bold'}>@{data.tgName}</Text>
          <Text fontSize={'sm'} fontWeight={'semibold'}>{data.wallet.slice(0, 8)}...{data.wallet.slice(-6)}</Text>
        </Stack>
        <Spacer/>
        <Button colorScheme={'blue'} onClick={onCopy}>
          {hasCopied ? 'Copied success!' : 'Copy invitation link'}
        </Button>
      </HStack>
      <HStack justify={"space-between"} border={'1px'} p={4} borderRadius={'8px'}>
        {
          [
            {key: 'Total trading', value: data.totalTrading},
            {key: 'Received rewards', value: data.issued},
            {key: 'Not settled', value: data.unissued},
          ].map((item, index) => (
            <Stack key={index} align={"center"}>
              <Text fontSize={'xl'} color={'#e1490c'} fontWeight={"bold"}>{item.value} NEST</Text>
              <Text fontSize={'sm'} color={'gray'}>{item.key}</Text>
            </Stack>
          ))
        }
      </HStack>
      {
        data?.details.length > 0 ? (
          <>
            {
              data?.details.map((item: any, index: number) => (
                <Stack key={index}>
                  <Text>@{item.tgName}</Text>
                  <Text>{item.wallet}</Text>
                  <Text>{index + 1}. : {item.positions} NEST</Text>
                </Stack>
              ))
            }
          </>
        ) : (
          <>
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            <Text textAlign={"center"}>You haven't invited yet</Text>
          </>
        )
      }
    </Stack>
  )
}

export default Pizza