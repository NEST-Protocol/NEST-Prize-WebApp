import {Divider, HStack, Select, Stack, Tab, TabList, Tabs, Text} from "@chakra-ui/react";
import {useCallback, useEffect, useMemo, useState} from "react";
import axios from "axios";
import {useRouter} from "next/router";

type RankType = {
  bonusPool: number,
  myRanking: number | null,
  ranking: {
    address: string,
    amount: number,
    bonusPool: number,
    chatId: string,
    ranking: number,
    reward: number,
    tgName: string,
    tradingPool: number,
  }[],
  tradingPool: number,
}

const IceCream = () => {
  const router = useRouter()
  const [options, setOptions] = useState([])
  const [rank, setRank] = useState<RankType | undefined>(undefined)
  const [code, setCode] = useState('')
  const [type, setType] = useState('trading')

  useEffect(() => {
    if (options.length > 0) {
      setCode(options[0])
    }
  }, [options])

  const fetchOptions = useCallback(async () => {
    const res = await axios({
      method: 'get',
      url: `https://cms.nestfi.net/bot-api/red-bot/s4/options/list`,
      headers: {
        'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`
      }
    })
    if (res.data.errorCode === 0) {
      setOptions(res.data.value)
    }
  }, [])

  const fetchRank = useCallback(async () => {
    const chatId = router.query.chatId
    if (!chatId || !code) {
      return
    }
    const res = await axios({
      method: 'get',
      url: `https://cms.nestfi.net/bot-api/red-bot/s4/ranking/${type}?chatId=${chatId}&code=${code}`,
      headers: {
        'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`
      }
    })
    if (res.data.errorCode === 0) {
      setRank(res.data.value)
    }
  }, [type, router, code])

  useEffect(() => {
    fetchOptions()
  }, [fetchOptions])

  useEffect(() => {
    fetchRank()
  }, [fetchRank])

  const myRank = useMemo(() => {
    if (!rank || !rank?.myRanking) {
      return undefined
    }
    return rank.ranking.find(item => item.ranking === rank.myRanking)
  }, [rank])

  console.log(myRank)

  return (
    <Stack maxW={'container.sm'} w={'full'} h={'100vh'} p={'16px'} spacing={'16px'}>
      <Select bg={'#F7F8FA'} borderRadius={'full'} border={'1px solid #EEEEEE'} color={'#878787'}
              onChange={(e) => setCode(e.target.value)}
              boxShadow={'0px 0px 10px 0px #EEEEEE'}>
        {
          options.map((item, index) => (
            <option key={index} value={item}>{item}</option>
          ))
        }
      </Select>
      <Tabs isFitted>
        <TabList>
          <Tab fontSize={'12.5px'} fontWeight={'bold'} onClick={() => setType('trading')}>Trading Ranking</Tab>
          <Tab fontSize={'12.5px'} fontWeight={'bold'} onClick={() => setType('profit')}>Profit Ranking</Tab>
        </TabList>
      </Tabs>
      <HStack p={'30px'} justifyContent={'space-around'} border={'2px solid #EEEEEE'} borderRadius={'14px'}>
        <Stack w={'120px'}>
          <Text fontSize={'12.5px'} fontWeight={'bold'}>{rank?.tradingPool?.toLocaleString() || '-'}</Text>
          <Text fontSize={'10.5px'} fontWeight={'500'} color={'#878787'}>Transaction amount</Text>
        </Stack>
        <Stack w={'120px'}>
          <Text fontSize={'12.5px'} fontWeight={'bold'}>{rank?.bonusPool?.toLocaleString() || '-'}</Text>
          <Text fontSize={'10.5px'} fontWeight={'500'} color={'#878787'}>Bonus pool</Text>
        </Stack>
      </HStack>
      <Stack>
        <Text fontSize={'14px'} fontWeight={'bold'}>Your Ranking</Text>
        {
          myRank ? (
            <HStack border={'2px solid #EEEEEE'} p={'20px'} borderRadius={'14px'} spacing={'20px'}>
              <Text fontSize={'xl'} fontWeight={'semibold'}>{myRank.ranking}</Text>
              <Stack fontSize={'12.5px'} fontWeight={'600'} w={'full'}>
                <Text>{myRank.tgName}</Text>
                <Text color={'#00B7EE'}>{myRank.address.slice(0, 6)}...{myRank.address.slice(-4)}</Text>
                <Divider/>
                <HStack justify={'space-between'} w={'full'} color={'#878787'}>
                  <Text w={'100px'}>Trading</Text>
                  <Text w={'100px'}>Giveaway</Text>
                </HStack>
                <HStack justify={'space-between'} w={'full'}>
                  <Text w={'100px'}>{myRank.amount} NEST</Text>
                  <Text w={'100px'}>{myRank.reward} NEST</Text>
                </HStack>
              </Stack>
            </HStack>
          ) : (
            <HStack border={'2px solid #EEEEEE'} p={'20px'} borderRadius={'14px'} spacing={'20px'}>
              <Text fontSize={'12.5px'}>Not in ranking</Text>
            </HStack>
          )
        }
      </Stack>
      <Stack>
        <Text fontSize={'14px'} fontWeight={'bold'}>Ranking</Text>
        {
          rank && rank.ranking.map((item, index) => (
            <HStack key={index} p={'20px'} border={'2px solid #EEEEEE'} borderRadius={'14px'} spacing={'20px'}>
              <Text fontSize={'xl'} fontWeight={'semibold'}>{item.ranking}</Text>
              <Stack fontSize={'12.5px'} fontWeight={'600'} w={'full'}>
                <Text>@{item.tgName}</Text>
                <Text color={'#00B7EE'}>{item.address.slice(0, 6)}...{item.address.slice(-4)}</Text>
                <Divider/>
                <HStack justify={'space-between'} w={'full'} color={'#878787'}>
                  <Text w={'full'}>Trading</Text>
                  <Text w={'full'}>Giveaway</Text>
                </HStack>
                <HStack justify={'space-between'} w={'full'}>
                  <Text w={'full'}>{item.amount.toLocaleString()} NEST</Text>
                  <Text w={'full'}>{item.reward.toLocaleString()} NEST</Text>
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