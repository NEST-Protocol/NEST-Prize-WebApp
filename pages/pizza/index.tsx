import {
  Button,
  Divider,
  chakra,
  HStack,
  Select,
  Spacer,
  Stack,
  Text,
  useClipboard,
  Input,
  Wrap,
  WrapItem
} from "@chakra-ui/react"
import {useRouter} from "next/router";
import {useCallback, useEffect, useMemo, useState} from "react";
import axios from "axios";

type UserInfo = {
  notSettled: number | null,
  recentRewards: number | null,
  tgName: string,
  totalInvitees: number | null,
  totalCount: number,
  totalRewards: number,
  totalTrading: number,
  wallet: string,
}

const Pizza = () => {
  const router = useRouter()
  const chatId = router.query.chatId
  const [data, setData] = useState<{
    user: UserInfo | null,
    details: UserInfo[]
  }>({
    user: {
      notSettled: 0,
      recentRewards: 0,
      tgName: '-',
      totalInvitees: 0,
      totalCount: 0,
      totalRewards: 0,
      totalTrading: 0,
      wallet: ''
    },
    details: [],
  })
  const {onCopy, setValue, hasCopied, value} = useClipboard('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('totalTrading')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [search, setSearch] = useState('')

  const getCode = useCallback(async () => {
    if (chatId) {
      const userReq = await axios(`https://cms.nestfi.net/bot-api/red-bot/user/${chatId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`
        }
      })
      const code = userReq.data?.value?.wallet?.slice(-8)?.toLowerCase()
      if (code) {
        setValue(`https://finance.nestprotocol.org/?a=${code}`)
      }
    }
  }, [chatId])

  useEffect(() => {
    getCode()
  }, [getCode])

  const fetchData = useCallback(async () => {
    if (!chatId) return
    if (from && to) {
      try {
        const res = await axios({
          method: 'GET',
          url: `https://cms.nestfi.net/bot-api/red-bot/s4/invite/info?chatId=${chatId}&from=${from}&to=${to}`,
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
    } else {
      try {
        const res = await axios({
          method: 'GET',
          url: `https://cms.nestfi.net/bot-api/red-bot/s4/invite/info?chatId=${chatId}`,
          headers: {
            'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`
          }
        })
        if (res?.data?.value) {
          console.log(res.data.value)
          setData(res.data.value)
        }
      } catch (e) {
        console.log(e)
      }
    }
  }, [chatId, from, to])

  const showData = useMemo(() => {
    return data?.details.filter((item) => {
      if (filter === 'all') return true
      if (filter === 'recentRewards' && item.recentRewards) return item.recentRewards > 0
      if (filter === 'notSettled' && item.notSettled) return item.notSettled > 0
      if (filter === 'neverTraded') return item.totalTrading === 0
      return false
    }).filter((item) => {
      if (search) {
        return item.tgName?.toLowerCase().includes(search.toLowerCase()) ||
          item.wallet?.toLowerCase().includes(search.toLowerCase())
      } else {
        return true
      }
    }).sort((a, b) => {
      if (sort === 'totalTrading') return b.totalTrading - a.totalTrading
      if (sort === 'totalRewards') return b.totalRewards - a.totalRewards
      if (a.recentRewards && b.recentRewards) {
        if (sort === 'recentRewards') return b.recentRewards - a.recentRewards
      }
      if (a.notSettled && b.notSettled) {
        if (sort === 'notSettled') return b.notSettled - a.notSettled
      }
      return 0
    })
  }, [filter, search, sort, data])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <Stack w={'full'} maxW={'container.sm'} h={'100vh'} p={'20px'} spacing={'8px'} bgImage={'/img/pizzaBg.jpg'} bgSize={'cover'}
           overflow={'scroll'}>
      <HStack pb={'20px'}>
        <Stack spacing={'16px'}>
          <Text fontSize={'16px'} fontWeight={'bold'} color={'#0047BB'}>@{data.user?.tgName || '-'}</Text>
          <Text fontSize={'12.5px'} fontWeight={'600'}
                color={'#00B7EE'}>{data.user?.wallet?.slice(0, 8)}...{data.user?.wallet?.slice(-6)}</Text>
        </Stack>
        <Spacer/>
        <Button colorScheme={'blue'} onClick={onCopy} color={'white'} bg={'#0047BB'} borderRadius={'full'}
                isDisabled={!value} _hover={{bg: '#0047BB'}} _active={{bg: '#0047BB'}}>
          {hasCopied ? 'Copied success!' : 'Copy invitation link'}
        </Button>
      </HStack>
      <HStack>
        <Input fontSize={'12.5px'} value={from} type={'date'} borderRadius={'full'} bg={'#F7F8FA'} boxShadow={'0px 0px 10px 0px #EEEEEE'}
               border={'1px solid #EEEEEE'} onChange={(e) => {
          setFrom(e.target.value)
        }}/>
        <Input fontSize={'12.5px'} value={to} type={'date'} borderRadius={'full'} bg={'#F7F8FA'} boxShadow={'0px 0px 10px 0px #EEEEEE'}
               border={'1px solid #EEEEEE'} onChange={(e) => {
          setTo(e.target.value)
        }}/>
      </HStack>
      <Stack>
        <Wrap justify={'space-between'} border={'2px solid #EEEEEE'} p={4} borderRadius={'14px'} bg={'white'}>
          {
            [
              {
                key: 'Total trading', value: data.user?.totalTrading.toLocaleString('en-US', {
                  maximumFractionDigits: 2
                }) + ' NEST', hidden: !data.user?.totalTrading
              },
              {
                key: 'Total invitees', value: data.user?.totalInvitees?.toLocaleString('en-US', {
                  maximumFractionDigits: 2
                }), hidden: !data.user?.totalInvitees
              },
              {key: 'Total number', value: data.user?.totalCount},
              {
                key: 'Total rewards', value: data.user?.totalRewards.toLocaleString('en-US', {
                  maximumFractionDigits: 2
                }) + ' NEST', hidden: !data.user?.totalRewards
              },
              {
                key: 'Recent rewards', value: data.user?.recentRewards?.toLocaleString('en-US', {
                  maximumFractionDigits: 2
                }) + ' NEST', hidden: !data.user?.recentRewards
              },
              {
                key: 'Not settled', value: data.user?.notSettled?.toLocaleString('en-US', {
                  maximumFractionDigits: 2
                }) + ' NEST', hidden: !data.user?.notSettled
              },
            ].map((item, index) => (
              <WrapItem key={index} minW={'120px'} hidden={item.hidden}>
                <Stack align={"start"} textAlign={"start"} py={'20px'}>
                  <Text fontSize={'12.5px'} color={'black'} fontWeight={"bold"}>{item.value || '-'}</Text>
                  <Text fontSize={'12.5px'} color={'#878787'}>{item.key}</Text>
                </Stack>
              </WrapItem>
            ))
          }
        </Wrap>
      </Stack>
      {
        data?.details.length > 0 ? (
          <>
            <HStack>
              <Select borderRadius={'full'} bg={'#F7F8FA'} boxShadow={'0px 0px 10px 0px #EEEEEE'}
                      border={'1px solid #EEEEEE'}
                      onChange={(e) => {
                        setFrom('')
                        setTo('')
                        setFilter(e.target.value)
                      }} fontSize={'12.5px'}
              >
                <option value='all'>All</option>
                <option value='recentRewards'>Recent Rewards</option>
                <option value='notSettled'>Not Settled</option>
                <option value='neverTraded'>Never Traded</option>
              </Select>
              <Select bg={'#F7F8FA'} borderRadius={'full'} boxShadow={'0px 0px 10px 0px #EEEEEE'}
                      border={'1px solid #EEEEEE'}
                      onChange={(e) => {
                        setFrom('')
                        setTo('')
                        setSort(e.target.value)
                      }} fontSize={'12.5px'}
              >
                <option value='totalTrading'>Total Trading</option>
                <option value='totalRewards'>Total Rewards</option>
                <option value='recentRewards'>Recent Rewards</option>
                <option value='notSettled'>Not Settled</option>
              </Select>
            </HStack>
            <HStack>
              <Input fontSize={'12.5px'} value={search} borderRadius={'full'} bg={'#F7F8FA'} boxShadow={'0px 0px 10px 0px #EEEEEE'}
                     border={'1px solid #EEEEEE'} placeholder={'search'} onChange={(e) => {
                setSearch(e.target.value)
              }}/>
            </HStack>
            {
              showData.map((item: any, index: number) => (
                <Stack key={index} p={'20px'} border={'2px solid #EEEEEE'} borderRadius={'14px'} bg={'white'}>
                  <Text fontSize={'12.5px'} fontWeight={'600'}>@{item.tgName || '-'}</Text>
                  <Text fontSize={'12.5px'} color={'#00B7EE'} fontWeight={'600'}>{item.wallet}</Text>
                  {
                    item.totalTrading > 0 && (
                      <>
                        <Divider/>
                        <Wrap justify={"space-between"}>
                          <WrapItem minW={'100px'} hidden={item.totalTrading == null}>
                            <Stack>
                              <Text color={'#878787'} fontSize={'12.5px'} fontWeight={'600'}>Total trading</Text>
                              <Text color={'black'} fontSize={'12.5px'} fontWeight={'bold'}>{item.totalTrading?.toLocaleString('en-US', {
                                maximumFractionDigits: 2
                              })} NEST</Text>
                            </Stack>
                          </WrapItem>
                          <WrapItem minW={'100px'} hidden={item.totalRewards == null}>
                            <Stack>
                              <Text color={'#878787'} fontSize={'12.5px'} fontWeight={'600'}>Total rewards</Text>
                              <Text color={'black'} fontSize={'12.5px'} fontWeight={'bold'}>{item.totalRewards?.toLocaleString('en-US', {
                                maximumFractionDigits: 2
                              })} NEST</Text>
                            </Stack>
                          </WrapItem>
                          <WrapItem minW={'100px'} hidden={item.recentRewards == null}>
                            <Stack>
                              <Text color={'#878787'} fontSize={'12.5px'} fontWeight={'600'}>Recent rewards</Text>
                              <Text color={'black'} fontSize={'12.5px'} fontWeight={'bold'}>{item.recentRewards?.toLocaleString('en-US', {
                                maximumFractionDigits: 2
                              })} NEST</Text>
                            </Stack>
                          </WrapItem>
                          <WrapItem minW={'100px'} hidden={item.notSettled == null}>
                            <Stack>
                              <Text color={'#878787'} fontSize={'12.5px'} fontWeight={'600'}>Not settled</Text>
                              <Text color={'black'} fontSize={'12.5px'} fontWeight={'bold'}>{item.notSettled?.toLocaleString('en-US', {
                                maximumFractionDigits: 2
                              })} NEST</Text>
                            </Stack>
                          </WrapItem>
                        </Wrap>
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