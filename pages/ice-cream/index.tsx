import {Divider, HStack, Stack, Text} from "@chakra-ui/react";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useRouter} from "next/router";

type RankType = {
  txTotalAmount: number,
  rewardsTotal: number,
  txTotalUsers: number,
  kol: {
    code: string,
    address: string,
    tgName: string,
    chatId: string,
  },
  ranking: {
    chatId: string,
    txAmount: number,
    wallet: string,
    rewards: number,
    tgName: string,
  }[],
}

const IceCream = () => {
  const router = useRouter()
  const [rank, setRank] = useState<RankType | undefined>({
    txTotalAmount: 1000,
    rewardsTotal: 200,
    txTotalUsers: 11,
    kol: {
      code: "ICECREAM",
      address: "0x0000000",
      tgName: "@kolname",
      chatId: "12345678",
    },
    ranking: [
      {
        chatId: "1",
        txAmount: 200,
        wallet: "0x00001",
        rewards: 20,
        tgName: "User1",
      },
      {
        chatId: "2",
        txAmount: 300,
        wallet: "0x00002",
        rewards: 30,
        tgName: "User2",
      },
      {
        chatId: "3",
        txAmount: 400,
        wallet: "0x00003",
        rewards: 40,
        tgName: "User3",
      },
    ],
  })

  const fetchRank = useCallback(async () => {
    // const res = await fetch('https://')
    // const data = await res.json()
    // setRank(data)
  }, [])

  useEffect(() => {
    fetchRank()
  }, [fetchRank])

  const myInfo = useMemo(() => {
    if (!rank) {
      return undefined
    }
    return rank.ranking?.sort((a, b) => b.txAmount - a.txAmount).find(item => item.chatId === router.query.chatId)
  }, [rank, router.query.chatId])

  const myRanking = useMemo(() => {
    if (!rank) {
      return undefined
    }
    return rank.ranking?.sort((a, b) => b.txAmount - a.txAmount).findIndex(item => item.chatId === router.query.chatId) + 1
  }, [rank, router.query.chatId])

  return (
    <Stack maxW={'container.sm'} w={'full'} h={'100vh'} overflow={'scroll'} p={'16px'} bgImage={'/img/pizzaBg.jpg'} bgSize={'cover'} spacing={'16px'}>
      <Stack align={"center"} fontSize={'lg'} fontWeight={'500'}>
        <Text>KOL: {rank?.kol.tgName}</Text>
      </Stack>
      <HStack p={'30px'} bg={'white'} justifyContent={'space-around'} border={'2px solid #EEEEEE'} borderRadius={'14px'}>
        <Stack w={'120px'}>
          <Text fontSize={'12.5px'} fontWeight={'bold'}>{rank?.txTotalAmount?.toLocaleString('en-US', {
            maximumFractionDigits: 2,
          }) || '-'}</Text>
          <Text fontSize={'10.5px'} fontWeight={'500'} color={'#878787'}>Transaction amount</Text>
        </Stack>
        <Stack w={'120px'}>
          <Text fontSize={'12.5px'} fontWeight={'bold'}>{rank?.rewardsTotal?.toLocaleString('en-US', {
            maximumFractionDigits: 2,
          }) || '-'}</Text>
          <Text fontSize={'10.5px'} fontWeight={'500'} color={'#878787'}>Bonus pool</Text>
        </Stack>
      </HStack>
      <Stack>
        <Text fontSize={'14px'} fontWeight={'bold'}>Your Ranking</Text>
        {
          myInfo ? (
            <HStack bg={'white'} border={'2px solid #EEEEEE'} p={'20px'} borderRadius={'14px'} spacing={'20px'}>
              <Text fontSize={'xl'} fontWeight={'semibold'}>NO.{myRanking}</Text>
              <Stack fontSize={'12.5px'} fontWeight={'600'} w={'full'}>
                <Text>{myInfo.tgName}</Text>
                <Text color={'#00B7EE'} pr={'30px'}>{myInfo.wallet}</Text>
                <Divider/>
                <HStack justify={'space-between'} w={'full'} color={'#878787'}>
                  <Text w={'full'}>Giveaway</Text>
                  <Text w={'full'}>Bonus</Text>
                </HStack>
                <HStack justify={'space-between'} w={'full'}>
                  <Text w={'full'}>{myInfo.txAmount.toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                  })} NEST</Text>
                  <Text w={'full'}>{myInfo.rewards.toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                  })} NEST</Text>
                </HStack>
              </Stack>
            </HStack>
          ) : (
            <HStack bg={'white'} border={'2px solid #EEEEEE'} p={'20px'} borderRadius={'14px'} spacing={'20px'}>
              <Text fontSize={'12.5px'}>You are not yet eligible to participate in the event</Text>
            </HStack>
          )
        }
      </Stack>
      <Stack>
        <Text fontSize={'14px'} fontWeight={'bold'}>Ranking</Text>
        {
          rank && rank.ranking?.sort((a, b) => b.txAmount - a.txAmount).map((item, index) => (
            <HStack bg={'white'} key={index} p={'20px'} border={'2px solid #EEEEEE'} borderRadius={'14px'} spacing={'20px'}>
              <Text fontSize={'xl'} fontWeight={'semibold'}>NO.{index + 1}</Text>
              <Stack fontSize={'12.5px'} fontWeight={'600'} w={'full'}>
                <Text>@{item.tgName}</Text>
                <Text color={'#00B7EE'} pr={'30px'}>{item.wallet}</Text>
                <Divider/>
                <HStack justify={'space-between'} w={'full'} color={'#878787'}>
                  <Text w={'full'}>Giveaway</Text>
                  <Text w={'full'}>Bonus</Text>
                </HStack>
                <HStack justify={'space-between'} w={'full'}>
                  <Text w={'full'}>{item.txAmount.toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                  })} NEST</Text>
                  <Text w={'full'}>{item.rewards.toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                  })} NEST</Text>
                </HStack>
              </Stack>
            </HStack>
          ))
        }
      </Stack>
    </Stack>
  )
}

export default IceCream