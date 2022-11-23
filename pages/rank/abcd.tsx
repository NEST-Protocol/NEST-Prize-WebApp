import {HStack, Spacer, Stack, Text} from "@chakra-ui/react";
import useTelegramWebApp from "../../hooks/useTelegramWebApp";
import {useCallback, useEffect, useMemo, useState} from "react";
import axios from "axios";

const Abcd = () => {
  const { user, isValid, refresh } = useTelegramWebApp()
  const [data, setData] = useState<{
    integralReward: number,
    total: number,
    wallet: string,
    myTx: number,
    invite: number,
    inviteValid: number,
    tgName: string,
    inviterTx: number,
    chat_id: string,
  }[]>([])

  const fetchData = useCallback(async () => {
    if (!process.env.NEST_API_TOKEN) {
      console.log('NO NEST_API_TOKEN')
      return
    }
    try {
      const res = await axios({
        method: 'get',
        url: `https://work.parasset.top/workbench-api/activity/info/integral/ranking`,
        headers: {
          "Authorization": `Bearer ${process.env.NEST_API_TOKEN}`,
        }
      })
      if (res.data.code === 0) {
        setData(res.data.data)
      }
    } catch (e) {
      console.log(e)
    }
  }, [])

  const userInfo = useMemo(async () => {
    if (!user || data.length === 0) {
      return undefined
    } else {
      // query data while chat_id = user.id
       console.log( data.filter((item) => item.chat_id === String(user.id)))
       return data.filter((item) => item.chat_id === String(user.id))
    }
  }, [data, user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <Stack w={'full'} maxW={'container.sm'} p={'20px'} spacing={'10px'}>
      { user && (
        <>
          <Text fontSize={'20px'} fontWeight={'bold'}>Your Ranking</Text>
          <HStack p={'10px'} bg={'#ECDDDD'} borderRadius={'10px'} spacing={'20px'}>
            <Stack minW={'40px'} minH={'40px'} bg={'red'} align={"center"} justify={"center"} borderRadius={'full'}>
              <Text color={'white'}>1</Text>
            </Stack>
            <Stack w={'full'}>
              <Text fontWeight={'bold'}>address</Text>
              <HStack w={'full'}>
                <Text fontSize={'sm'} color={'gray.800'}>Point: </Text>
                <Spacer/>
                <Text fontSize={'sm'} color={'gray.800'}>Giveaway: </Text>
              </HStack>
            </Stack>
          </HStack>
          <Stack h={'20px'}></Stack>
        </>
      ) }

      <Text fontSize={'20px'} fontWeight={'bold'}>Ranking</Text>
      { data.length > 0 ? data.map((item) => (
        <HStack key={item.chat_id} p={'10px'} bg={'#ECDDDD'} borderRadius={'10px'} spacing={'20px'}>
          <Stack minW={'40px'} minH={'40px'} bg={'red'} align={"center"} justify={"center"} borderRadius={'full'}>
            <Text color={'white'}>1</Text>
          </Stack>
          <Stack w={'full'}>
            <Text fontWeight={'bold'}>address</Text>
            <HStack w={'full'}>
              <Text fontSize={'sm'} color={'gray.800'}>Point: </Text>
              <Spacer/>
              <Text fontSize={'sm'} color={'gray.800'}>Giveaway: </Text>
            </HStack>
          </Stack>
        </HStack>
      )) : (
        <Text fontSize={'sm'}>
          loading...
        </Text>
      ) }
    </Stack>
  );
}

export default Abcd;