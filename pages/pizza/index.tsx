import {Button, Divider, chakra, HStack, Select, Spacer, Stack, Text, useClipboard} from "@chakra-ui/react"
import {useRouter} from "next/router";
import {useCallback, useEffect, useState} from "react";
import axios from "axios";

type UserInfo = {
  notSettled: number,
  recentRewards: number,
  tgName: string,
  totalRewards: number,
  totalTrading: number,
  wallet: string,
}

const Pizza = () => {
  const router = useRouter()
  const chatId = router.query.chatId
  const [data, setData] = useState<{
    user: UserInfo,
    details: UserInfo[]
  }>({
    user: {
      notSettled: 0,
      recentRewards: 0,
      tgName: '-',
      totalRewards: 0,
      totalTrading: 0,
      wallet: '-'
    },
    details: [],
  })
  const {onCopy, setValue, hasCopied} = useClipboard('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('totalTrading')

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
        url: `https://cms.nestfi.net/bot-api/red-bot/s4/invite/info?chatId=${chatId}`,
        headers: {
          'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`
        }
      })
      if (res?.data?.value) {
        setData(res.data.value)
      }
    } catch (e) {
      console.log(e)
    }
  }, [chatId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <Stack w={'full'} h={'100vh'} p={'20px'} spacing={'8px'} bgImage={'/img/invite_bg.jpg'} bgSize={'cover'} overflow={'scroll'}>
      <HStack pb={'20px'}>
        <Stack spacing={'16px'}>
          <Text fontSize={'16px'} fontWeight={'bold'} color={'#0047BB'}>@{data.user.tgName || '-'}</Text>
          <Text fontSize={'12.5px'} fontWeight={'600'} color={'#00B7EE'}>{data.user.wallet?.slice(0, 8)}...{data.user.wallet?.slice(-6)}</Text>
        </Stack>
        <Spacer/>
        <Button colorScheme={'blue'} onClick={onCopy} color={'white'} bg={'#0047BB'} borderRadius={'full'} _hover={{ bg: '#0047BB' }} _active={{ bg: '#0047BB' }} >
          {hasCopied ? 'Copied success!' : 'Copy invitation link'}
        </Button>
      </HStack>
      <HStack justify={"space-between"} border={'2px solid #EEEEEE'} p={4} borderRadius={'14px'} bg={'white'}>
        {
          [
            {key: 'Total rewards', value: data.user.totalRewards},
            {key: 'Recent rewards', value: data.user.recentRewards},
            {key: 'Not settled', value: data.user.notSettled},
          ].map((item, index) => (
            <Stack key={index} align={"start"} textAlign={"start"} py={'20px'}>
              <Text fontSize={'11px'} color={'black'} fontWeight={"bold"}>{item.value?.toLocaleString('en-US', {
                maximumFractionDigits: 2
              }) || '-'} NEST</Text>
              <Text fontSize={'10px'} color={'#878787'}>{item.key}</Text>
            </Stack>
          ))
        }
      </HStack>
      {
        data?.details.length > 0 ? (
          <>
            <HStack>
              <Select borderRadius={'full'} bg={'#F7F8FA'} boxShadow={'0px 0px 10px 0px #EEEEEE'} border={'1px solid #EEEEEE'}
                      onChange={(e) => setFilter(e.target.value)} fontSize={'12.5px'}
              >
                <option value='all'>All</option>
                <option value='recentRewards'>Recent Rewards</option>
                <option value='notSettled'>Not Settled</option>
                <option value='neverTraded'>Never Traded</option>
              </Select>
              <Select bg={'#F7F8FA'}  borderRadius={'full'} boxShadow={'0px 0px 10px 0px #EEEEEE'} border={'1px solid #EEEEEE'}
                      onChange={(e) => setSort(e.target.value)} fontSize={'12.5px'}
              >
                <option value='totalTrading'>Total Trading</option>
                <option value='totalRewards'>Total Rewards</option>
                <option value='recentRewards'>Recent Rewards</option>
                <option value='notSettled'>Not Settled</option>
              </Select>
            </HStack>
            {
              data?.details.filter((item) => {
                if (filter === 'all') return true
                if (filter === 'recentRewards') return item.recentRewards > 0
                if (filter === 'notSettled') return item.notSettled > 0
                if (filter === 'neverTraded') return item.totalTrading === 0
                return false
              }).sort((a, b) => {
                if (sort === 'totalTrading') return b.totalTrading - a.totalTrading
                if (sort === 'totalRewards') return b.totalRewards - a.totalRewards
                if (sort === 'recentRewards') return b.recentRewards - a.recentRewards
                if (sort === 'notSettled') return b.notSettled - a.notSettled
                return 0
              }).map((item: any, index: number) => (
                <Stack key={index} p={'20px'} border={'2px solid #EEEEEE'} borderRadius={'14px'} bg={'white'}>
                  <Text fontSize={'12.5px'} fontWeight={'600'}>@{item.tgName || '-'}</Text>
                  <Text fontSize={'12.5px'} color={'#00B7EE'} fontWeight={'600'}>{item.wallet.slice(0, 8)}...{item.wallet.slice(-6)}</Text>
                  {
                    item.totalTrading > 0 && (
                    <>
                      <Divider/>
                      <HStack justify={"space-between"} color={'#878787'} fontSize={'12.5px'} fontWeight={'600'}>
                        <Text>Total trading</Text>
                        <Text>Total rewards</Text>
                      </HStack>
                      <HStack justify={"space-between"} color={'black'} fontSize={'12.5px'} fontWeight={'bold'}>
                        <Text>{item.totalTrading?.toLocaleString('en-US', {
                          maximumFractionDigits: 2
                        })} NEST</Text>
                        <Text>{item.totalRewards?.toLocaleString('en-US', {
                          maximumFractionDigits: 2
                        })} rewards</Text>
                      </HStack>
                      <Divider/>
                      <HStack justify={"space-between"} color={'#878787'} fontSize={'12.5px'} fontWeight={'600'}>
                        <Text>Recent rewards</Text>
                        <Text>Not settled</Text>
                      </HStack>
                      <HStack justify={"space-between"} color={'black'} fontSize={'12.5px'} fontWeight={'bold'}>
                        <Text>{item.recentRewards?.toLocaleString('en-US', {
                          maximumFractionDigits: 2
                        })} NEST</Text>
                        <Text>{item.notSettled?.toLocaleString('en-US', {
                          maximumFractionDigits: 2
                        })} rewards</Text>
                      </HStack>
                    </>
                    )
                  }
                </Stack>
              ))
            }
          </>
        ) : (
          <Stack align={"center"} pt={'40px'}>
            <chakra.img src={'/svg/invite_icon.svg'} alt={'empty'} w={'120px'} h={'120px'}/>
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            <Text fontSize={'16px'} fontWeight={'600'} color={'#878787'}>You haven't invited yet</Text>
          </Stack>
        )
      }
    </Stack>
  )
}

export default Pizza