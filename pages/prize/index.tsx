import {
  Button, Modal,
  ModalContent,
  ModalOverlay,
  Stack, useToast,
  Text, useDisclosure, Link, ModalCloseButton, Badge
} from "@chakra-ui/react";
import {useCallback, useEffect, useState} from "react";
import {useRouter} from "next/router";
import axios from "axios";
import useTelegramAuth from "../../hooks/useTelegramAuth";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Head from "next/head";
import Image from "next/image";
import {env} from "telegraf/typings/util";

const Prize = () => {
  const {user} = useTelegramAuth()
  const {isOpen, onOpen, onClose} = useDisclosure()
  const router = useRouter()
  const [prize, setPrize] = useState({
    id: 0,
    text: 'loading...',
    status: '',
    quantity: 0,
    max: 0,
    min: 0,
    balance: 0,
    createTime: '',
  })
  const [status, setStatus] = useState('IDLE')
  const [checkMsg, setCheckMsg] = useState('')
  const [valid, setValid] = useState(false)
  const toast = useToast()
  const [timer, setTimer] = useState(3)

  const fetchPrize = useCallback(async () => {
    // router.query.code should be integer
    if (!router.query.code || Number.isNaN(Number(router.query.code))) {
      return
    }
    try {
      const res = await axios({
        method: 'get',
        url: `https://cms.nestfi.net/bot-api/red-bot/prizes/${router.query.code}`,
        headers: {
          'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`
        }
      })
      if (res.data.value) {
        setPrize(res.data.value)
      }
    } catch (e) {
      console.log(e)
    }
  }, [router])

  const check = useCallback(async () => {
    if (!router.query.code || Number.isNaN(Number(router.query.code)) || !user) {
      return
    }
    const res = await axios({
      method: 'POST',
      url: `https://cms.nestfi.net/bot-api/red-bot/prizes/${router.query.code}/verify?chatId=${user.id}`,
      headers: {
        'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`
      }
    })
    if (res.data.errorCode === 0 && res.data.value) {
      setValid(true)
    } else {
      setCheckMsg(res.data.message)
      setValid(false)
    }
  }, [router.query.code, user])

  useEffect(() => {
    check()
  }, [check])

  const snatch = async () => {
    if (!router.query.code || Number.isNaN(Number(router.query.code)) || !user) {
      setStatus('ERROR')
      return
    }
    setStatus('PROCESSING')
    const res = await axios({
      method: 'POST',
      url: `https://cms.nestfi.net/bot-api/red-bot/prizes/${router.query.code}?chatId=${user.id}`,
      headers: {
        'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`
      }
    })
    if (res.data.errorCode === 0 && res.data.value) {
      setStatus('SUCCESS')
      toast({
        title: 'Success',
        description: "You have snatched success!",
        status: 'success',
        position: 'top-right',
      })
      setTimeout(() => {
        router.push({
          pathname: '/history',
          query: {
            ...router.query
          }
        })
      }, 3_000)
    } else {
      toast({
        title: 'Error',
        description: res.data.message,
        status: 'error',
        position: 'top-right',
      })
      setStatus('ERROR')
    }
  }

  useEffect(() => {
    if (timer > 0) {
      onOpen()
      setTimeout(() => {
        setTimer(timer - 1)
      }, 1_000)
    }
  }, [onOpen, timer])

  useEffect(() => {
    fetchPrize()
  }, [fetchPrize])

  return (
    <Stack maxW={'container.sm'} w={'full'} h={'100vh'} p={'16px'} spacing={'16px'}>
      <Head>
        <title>Snatch NEST Prize</title>
      </Head>
      <Stack minH={'200px'}>
        <Text fontWeight={'bold'}>Event Introduction</Text>
        {/* eslint-disable-next-line react/no-children-prop */}
        <ReactMarkdown children={prize.text} remarkPlugins={[remarkGfm]} className={'markdown-body'}/>
        <Stack pt={'20px'}>
          <Text fontSize={'xs'} color={'blue'}
                fontWeight={'bold'}>Tips: {user ? '@' + user?.username : 'Login First'} {checkMsg}</Text>
          <Button minH={'44px'} fontSize={'sm'} bg={'rgba(255, 0, 0, 0.7)'} color={'white'} _hover={{bg: ""}}
                  _active={{bg: ""}} isDisabled={valid}
                  disabled={prize.balance <= 0 || prize.status === 'DISABLED' || prize.status === 'CANCLE' || !valid}
                  borderRadius={'0px'} loadingText={'Snatching...'} isLoading={status === 'Snatching...'}
                  onClick={snatch}>
            Snatch!
          </Button>
          <Button minH={'44px'} variant={"outline"} fontSize={'sm'} _hover={{bg: ""}} _active={{bg: ""}}
                  borderRadius={'0px'} onClick={() => {
            router.push({
              pathname: '/history',
              query: {
                ...router.query
              }
            })
          }}>
            Full List
          </Button>
        </Stack>
      </Stack>
      <Stack border={'1px solid'} p={'16px'} bg={'black'} color={'white'}>
        <Image src={"/svg/github-mark-white.svg"} width={24} height={24} alt={""}/>
        <Link isExternal href={'https://github.com/NEST-Protocol/NEST-Prize-WebApp'} fontSize={'sm'}
              fontWeight={'bold'}>Star this project, or new issues!</Link>
      </Stack>
      <Modal isOpen={isOpen} onClose={onClose} closeOnEsc={!timer} closeOnOverlayClick={!timer} autoFocus={false}
             size={'sm'}>
        <ModalOverlay bg='blackAlpha.300' backdropFilter='blur(10px) hue-rotate(90deg)'/>
        <ModalContent>
          <Stack p={'12px'}>
            <Text fontSize={'xs'}>{timer ? `Ads can be closed after ${timer} seconds` : 'Ads'}</Text>
            {
              !timer && (
                <ModalCloseButton position={'absolute'} top={'-4px'} right={'4px'}/>
              )
            }
            <Stack>
              <Link isExternal href={'https://www.nestprotocol.org/developers/bug'}>
                <Text fontSize={'xl'} fontWeight={'bold'} color={'red'}>Earn up to $200,000 NEST!</Text>
                <Text fontSize={'sm'}>
                  for finding related bugs affecting the NEST Protocol.
                </Text>
              </Link>
              <Badge fontWeight={'bold'} bg={'black'} color={'white'} textAlign={"end"}>Bug Bounty Program</Badge>
              <Badge fontWeight={'bold'} bg={'red'} color={'white'}>Submit low risk bug</Badge>
              <Badge fontWeight={'bold'} bg={'blue'} color={'white'}>Submit medium risk bug</Badge>
              <Badge fontWeight={'bold'} bg={'green'} color={'white'}>Submit high risk bug</Badge>
              <Badge fontWeight={'bold'} bg={'yellow'} color={'black'}>Submit critical risk bug</Badge>
            </Stack>
          </Stack>
        </ModalContent>
      </Modal>
    </Stack>
  )
}

export default Prize