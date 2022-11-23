import {HStack, Spacer, Stack, Text} from "@chakra-ui/react";
import useTelegramWebApp from "../../hooks/useTelegramWebApp";
import {useCallback, useEffect, useMemo, useState} from "react";
import axios from "axios";

const Abcd = () => {
  const {user} = useTelegramWebApp()
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

  const userIndex = useMemo(() => {
    if (!user || data.length === 0) {
      return undefined
    } else {
      return data.findIndex((item) => item.chat_id === String(user.id))
    }
  }, [data, user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <Stack w={'full'} maxW={'container.sm'} p={'20px'} spacing={'10px'}>
      {user ? (
        <>
          <Text fontSize={'20px'} fontWeight={'bold'}>Your Ranking {user && ", @" + user.username}</Text>
          {userIndex && userIndex > 0 ? (
            <HStack p={'10px'} bg={userIndex < 3 ? '#ECDDDD' : '#F2F2F2'} borderRadius={'10px'} spacing={'20px'}>
              <Stack minW={'40px'} minH={'40px'} bg={'red'} align={"center"} justify={"center"} borderRadius={'full'}>
                <Text color={'white'}>{userIndex + 1}</Text>
              </Stack>
              <Stack w={'full'}>
                <Text fontWeight={'bold'}>{data[userIndex].wallet}</Text>
                <HStack w={'full'}>
                  <Text fontSize={'sm'} color={'gray.800'}>Point: {data[userIndex].total}</Text>
                  <Spacer/>
                  <Text fontSize={'sm'} color={'gray.800'}>Giveaway: {data[userIndex].integralReward}</Text>
                </HStack>
              </Stack>
            </HStack>
          ) : (
            <Text fontSize={'xs'}>You are not in list.</Text>
          )}
          <Stack h={'20px'}></Stack>
        </>
      ) : (
        <Text fontSize={'xs'}>No telegram user</Text>
      )}
      <Text fontSize={'20px'} fontWeight={'bold'}>Ranking</Text>
      {data.length > 0 ? data.slice(0, 50).map((item, index) => (
        <HStack key={item.chat_id} p={'10px'} bg={index < 3 ? '#ECDDDD' : '#F2F2F2'} borderRadius={'10px'} spacing={'20px'}>
          <Stack minW={'40px'} minH={'40px'} bg={'red'} align={"center"} justify={"center"} borderRadius={'full'}>
            <Text color={'white'}>{index + 1}</Text>
          </Stack>
          <Stack w={'full'}>
            <Text fontWeight={'bold'}>{item.wallet.slice(0, 10)}...{item.wallet.slice(-8)}</Text>
            <HStack w={'full'}>
              <Text fontSize={'sm'} color={'gray.800'}>Point: {item.total}</Text>
              <Spacer/>
              <Text fontSize={'sm'} color={'gray.800'}>Giveaway: {item.integralReward} NEST</Text>
            </HStack>
          </Stack>
        </HStack>
      )) : (
        <Text fontSize={'sm'}>
          loading...
        </Text>
      )}
    </Stack>
  );
}

export default Abcd;