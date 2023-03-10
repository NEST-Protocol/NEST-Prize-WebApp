import {Button, Divider, HStack, Link, Stack, Text, Avatar, Badge, Spinner} from "@chakra-ui/react";
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
    rate: number,
    endTime: string,
    startTime: string,
  },
  rankings: {
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
  const [rank, setRank] = useState<RankType | undefined>(undefined)
  const [invalid, setInvalid] = useState<boolean>(false)
  const [myCode, setMyCode] = useState<string | undefined>(undefined)

  const code = useMemo(() => {
    return router.query.code?.[0].toLowerCase()
  }, [router])

  useEffect(() => {
    if (router.query.chatId) {
      setUserData({
        hash: '',
        id: Number(router.query.chatId),
        photo_url: '',
        username: '',
        auth_date: 0,
      })
    }
  }, [router])

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
    if (!code) {
      return
    }
    try {
      const res = await fetch(`https://cms.nestfi.net/bot-api/kol/ranking/info?code=${code}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`,
        }
      })
      const data = await res.json()
      if (data.value) {
        setRank(data.value)
      } else {
        setInvalid(true)
      }
    } catch (e) {
      setInvalid(true)
    }
  }, [code])

  const fetchMyCode = useCallback(async () => {
    if (!userData) {
      return
    }
    const res = await fetch(`https://cms.nestfi.net/bot-api/kol/code/by/chatId?chatId=${userData.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`,
      }
    })
    const data = await res.json()
    if (data.value) {
      setMyCode(data.value.toLowerCase())
    }
  }, [userData])

  useEffect(() => {
    fetchMyCode()
  }, [fetchMyCode])

  useEffect(() => {
    fetchRank()
  }, [fetchRank])

  const myInfo = useMemo(() => {
    if (!rank || !userData) {
      return undefined
    }
    return rank.rankings?.sort((a, b) => b.txAmount - a.txAmount).find(item => String(item.chatId) === String(userData.id))
  }, [rank, userData])

  const myRanking = useMemo(() => {
    if (!rank || !userData) {
      return undefined
    }
    return rank.rankings?.sort((a, b) => b.txAmount - a.txAmount).findIndex(item => String(item.chatId) === String(userData.id)) + 1
  }, [rank, userData])

  if (invalid) {
    return (
      <Stack maxW={'container.sm'} w={'full'} h={'100vh'} overflow={'scroll'} p={'16px'} bgImage={'/img/pizzaBg.jpg'}
             bgSize={'cover'} spacing={'16px'}
             justifyContent={"center"} alignItems={"center"}
      >
        <Text fontSize={'lg'} fontWeight={'500'}>Your kol is not open for activities, you can not participate</Text>
      </Stack>
    )
  }

  if (!rank) {
    return (
      <Stack maxW={'container.sm'} w={'full'} h={'100vh'} overflow={'scroll'} p={'16px'} bgImage={'/img/pizzaBg.jpg'}
             bgSize={'cover'} spacing={'16px'}
             justifyContent={"center"} alignItems={"center"}
      >
        <Spinner/>
        <Text fontSize={'lg'} fontWeight={'500'}>Loading...</Text>
      </Stack>
    )
  }

  return (
    <Stack maxW={'container.sm'} w={'full'} h={'100vh'} overflow={'scroll'} p={'16px'} bgImage={'/img/pizzaBg.jpg'}
           bgSize={'cover'} spacing={'16px'}>
      <Stack align={"center"} fontSize={'lg'} fontWeight={'500'}>
        {
          rank?.kol.tgName ? (
            <Text><Badge colorScheme={'telegram'}>KOL</Badge> {rank?.kol.tgName}</Text>
          ) : (
            <Text>Code: {rank?.kol.code}</Text>
          )
        }
        <Text fontSize={'xs'} fontWeight={'500'}>{rank.kol.startTime.slice(0, 10)} ~ {rank.kol.endTime.slice(0, 10)}</Text>
      </Stack>
      <HStack p={'30px'} bg={'white'} justifyContent={'space-around'} border={'2px solid #EEEEEE'}
              borderRadius={'14px'}>
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
                          name={myInfo.tgName}/>
                  <Text fontSize={'xl'} fontWeight={'semibold'}>NO.{myRanking}</Text>
                </Stack>
                <Stack fontSize={'12.5px'} fontWeight={'600'} w={'full'}>
                  <Text>{myInfo.tgName}</Text>
                  <Text color={'#00B7EE'} pr={'30px'} maxW={'250px'}>{myInfo.wallet}</Text>
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
              <Stack bg={'white'} border={'2px solid #EEEEEE'} p={'20px'} borderRadius={'14px'} spacing={'20px'}>
                <Text fontSize={'12.5px'} fontWeight={'500'}>You are not yet eligible to participate in the event</Text>
                {
                  myCode === undefined && (
                    <HStack spacing={'20px'}>
                      <Link href={`https://finance.nestprotocol.org/?a=${code}`} isExternal fontSize={'xs'}
                            color={'#00B7EE'} fontWeight={'500'}>{`https://finance.nestprotocol.org/?a=${code}`}</Link>
                      <Button variant={'outline'} size={'sm'}
                              onClick={() => {
                                // copy code to clipboard
                                if (code) {
                                  navigator.clipboard.writeText(`https://finance.nestprotocol.org/?a=${code}`)
                                }
                              }}
                      >
                        Copy Link
                      </Button>
                    </HStack>
                  )
                }
              </Stack>
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
          rank && rank.rankings?.sort((a, b) => b.txAmount - a.txAmount).map((item, index) => (
            <HStack bg={'white'} key={index} p={'20px'} border={'2px solid #EEEEEE'} borderRadius={'14px'}
                    spacing={'24px'}>
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