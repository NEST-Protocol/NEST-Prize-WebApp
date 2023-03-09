import {Button, Divider, HStack, Link, Stack, Text, chakra, Avatar, Badge} from "@chakra-ui/react";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useRouter} from "next/router";
import {FaTelegramPlane} from "react-icons/fa";

type TelegramData = {
  hash: string,
  id: number,
  photo_url: string,
  first_name?: string,
  last_name?: string,
  username: string,
  auth_date: number,
}

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

const Rank = () => {
  const router = useRouter()
  const [userData, setUserData] = useState<TelegramData | undefined>(undefined)
  const [rank, setRank] = useState<RankType | undefined>({
    txTotalAmount: 2000,
    rewardsTotal: 200,
    txTotalUsers: 5,
    kol: {
      code: "71a91c10",
      address: "0x3B00ce7E2d0E0E905990f9B09A1F515C71a91C10",
      tgName: "tunogya",
      chatId: "2130493951",
    },
    ranking: [
      {
        chatId: "2130493951",
        txAmount: 200,
        wallet: "0x3B00ce7E2d0E0E905990f9B09A1F515C71a91C10",
        rewards: 20,
        tgName: "tunogya",
      },
      {
        chatId: "552791389",
        txAmount: 300,
        wallet: "0x481a74d43ae3A7BdE38B7fE36E46CF9a6cbb4F39",
        rewards: 30,
        tgName: "kingtin007",
      },
      {
        chatId: "3",
        txAmount: 400,
        wallet: "0x03",
        rewards: 40,
        tgName: "User3",
      },
      {
        chatId: "4",
        txAmount: 500,
        wallet: "0x04",
        rewards: 50,
        tgName: "User3",
      },
      {
        chatId: "5",
        txAmount: 600,
        wallet: "0x05",
        rewards: 60,
        tgName: "User3",
      },
    ],
  })

  const loginTelegram = () => {
    // @ts-ignore
    window?.Telegram.Login.auth({
      bot_id: process.env.BOT_TOKEN || '',
      request_access: 'write',
      embed: 1
    }, async (data: TelegramData) => {
      if (!data) {
        return
      }
      setUserData(data)
    });
  };

  const fetchRank = useCallback(async () => {
    // const res = await fetch('https://')
    // const data = await res.json()
    // setRank(data)
  }, [])

  useEffect(() => {
    fetchRank()
  }, [fetchRank])

  const myInfo = useMemo(() => {
    if (!rank || !userData) {
      return undefined
    }
    return rank.ranking?.sort((a, b) => b.txAmount - a.txAmount).find(item => String(item.chatId) === String(userData.id))
  }, [rank, userData])

  const myRanking = useMemo(() => {
    if (!rank || !userData) {
      return undefined
    }
    return rank.ranking?.sort((a, b) => b.txAmount - a.txAmount).findIndex(item => String(item.chatId) === String(userData.id)) + 1
  }, [rank, userData])

  if (router.query.code !== '71a91c10') {
    return (
      <Stack maxW={'container.sm'} w={'full'} h={'100vh'} overflow={'scroll'} p={'16px'} bgImage={'/img/pizzaBg.jpg'} bgSize={'cover'} spacing={'16px'}
             justifyContent={"center"} alignItems={"center"}
      >
        <Text fontSize={'lg'} fontWeight={'500'}>Your kol is not open for activities, you can not participate</Text>
      </Stack>
    )
  }

  return (
    <Stack maxW={'container.sm'} w={'full'} h={'100vh'} overflow={'scroll'} p={'16px'} bgImage={'/img/pizzaBg.jpg'} bgSize={'cover'} spacing={'16px'}>
      <Stack align={"center"} fontSize={'lg'} fontWeight={'500'}>
        {
          rank?.kol.tgName ? (
            <Link href={`https://t.me/${rank?.kol.tgName}`} isExternal><Badge colorScheme={'telegram'}>KOL</Badge> {rank?.kol.tgName}</Link>
          ) : (
            <Text>Code: {rank?.kol.code}</Text>
          )
        }
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
        userData ? (
          myInfo ? (
            <HStack bg={'white'} border={'2px solid #EEEEEE'} p={'20px'} borderRadius={'14px'} spacing={'24px'}>
              <Stack>
                <Avatar src={userData.photo_url}
                        name={userData.username ? userData.username : `${userData.first_name} ${userData.last_name}` }/>
                <Text fontSize={'xl'} fontWeight={'semibold'}>NO.{myRanking}</Text>
              </Stack>
              <Stack fontSize={'12.5px'} fontWeight={'600'} w={'full'}>
                <Text>{userData.username ? userData.username : `${userData.first_name} ${userData.last_name}` }</Text>
                <Text color={'#00B7EE'} pr={'30px'}>{myInfo.wallet}</Text>
                <Divider/>
                <HStack justify={'space-between'} w={'full'} color={'#878787'}>
                  <Text w={'full'} fontSize={'xs'}>Tx amount</Text>
                  <Text w={'full'} fontSize={'xs'}>Bonus</Text>
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
        ) : (
          <HStack justifyContent={"center"} h={'80px'}>
            <Button onClick={loginTelegram} size={'lg'} variant={userData ? 'ghost' : 'solid'}
                    leftIcon={<FaTelegramPlane/>} colorScheme={'telegram'}
            >
              Continue with telegram
            </Button>
          </HStack>
         )
      }
      </Stack>
      <Stack>
        <Text fontSize={'14px'} fontWeight={'bold'}>Ranking</Text>
        {
          rank && rank.ranking?.sort((a, b) => b.txAmount - a.txAmount).map((item, index) => (
            <HStack bg={'white'} key={index} p={'20px'} border={'2px solid #EEEEEE'} borderRadius={'14px'} spacing={'24px'}>
              <Text fontSize={'xl'} fontWeight={'semibold'}>NO.{index + 1}</Text>
              <Stack fontSize={'12.5px'} fontWeight={'600'} w={'full'}>
                <Text>@{item.tgName}</Text>
                <Text color={'#00B7EE'} pr={'30px'} maxW={'250px'}>{item.wallet}</Text>
                <Divider/>
                <HStack justify={'space-between'} w={'full'} color={'#878787'}>
                  <Text w={'full'} fontSize={'xs'}>Tx amount</Text>
                  <Text w={'full'} fontSize={'xs'}>Bonus</Text>
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

export default Rank