import {
  Button, Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay, Progress,
  Spacer,
  Stack, useToast,
  Text, useDisclosure, chakra
} from "@chakra-ui/react";
import {useCallback, useEffect, useState} from "react";
import {useRouter} from "next/router";
import axios from "axios";
import useTelegramAuth from "../../hooks/useTelegramAuth";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const Prize = () => {
  const { user } = useTelegramAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const router = useRouter()
  const [prize, setPrize] = useState({
    id: 0,
    text: 'loading...',
    status: '',
    quantity: 0,
    max: 0,
    min: 0,
    image: '',
    balance: 0,
    createTime: '',
  })
  const [status, setStatus] = useState('IDLE')
  const [msg, setMsg] = useState('')
  const [valid, setValid] = useState(false)
  const toast = useToast()

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
      setMsg(res.data.message)
      setValid(false)
    }
  }, [router.query.code, user])

  useEffect(() => {
    check()
  }, [check])

  const snatch = async () => {
    onOpen()
    if (!router.query.code || Number.isNaN(Number(router.query.code)) || !user) {
      setStatus('ERROR')
      return
    }
    setStatus('PROCESSING')
    const res = await axios({
      method: 'POST',
      url: `https://cms.nestfi.net/bot-api/red-bot/prizes/${router.query.code}`,
      data: {
        chatId: user?.id || 0,
      },
      headers: {
        'Authorization': `Bearer ${process.env.NEST_API_TOKEN}`
      }
    })
    if (res.data.errorCode === 0) {
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
        description: "You have snatched error!",
        status: 'error',
        position: 'top-right',
      })
      setStatus('ERROR')
    }
    console.log(res)
  }

  useEffect(() => {
    fetchPrize()
  }, [fetchPrize])

  return (
    <Stack maxW={'container.sm'} w={'full'} h={'100vh'} p={'20px'} spacing={'20px'}>
      <Text textAlign={"center"} fontWeight={'bold'}>NEST Prize</Text>
      {
        prize.image && (
          <Stack h={'240px'} w={'full'}>
            <chakra.img src={prize.image} w={'full'} h={'full'} objectFit={'cover'}/>
          </Stack>
        )
      }

      <Stack>
        <Text fontWeight={'bold'}>Event Introduction</Text>
        {/* eslint-disable-next-line react/no-children-prop */}
        <ReactMarkdown children={prize.text} remarkPlugins={[remarkGfm]} className={'markdown-body'}/>
      </Stack>

      <Spacer/>
      <Stack pb={'40px'}>
        <Text textAlign={"center"} fontWeight={"bold"} color={'blue'}>{user ? '@' + user?.username : 'Login first'} {msg}</Text>
        { valid && (
          <Button minH={'44px'} bg={'rgba(255, 0, 0, 0.7)'} color={'white'} _hover={{ bg: "" }} _active={{ bg: "" }}
                  disabled={prize.balance <= 0 || prize.status === 'DISABLED' || prize.status === 'CANCLE' || !valid}
                  onClick={snatch}>
            Snatch!
          </Button>
        ) }
        <Button variant={"outline"} _hover={{ bg: "" }} _active={{ bg: "" }} onClick={() => {
          router.push({
            pathname: '/history',
            query: {
              ...router.query
            }
          })}
        }>
          Full List
        </Button>
      </Stack>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Snatch!</ModalHeader>
          <ModalBody>
            <Stack pb={'20px'}>
              <Text>{user?.username}</Text>
              <Text fontSize={'sm'}>
                { status === 'PROCESSING' && 'Please wait for the result...' }
                { status === 'SUCCESS' && 'Congratulations! You have successfully snatched the prize!' }
                { status === 'ERROR' && 'Sorry, you have failed to snatch the prize.' }
              </Text>
              {
                status === 'PROCESSING' && (
                  <Progress size='xs' isIndeterminate />
                )
              }
              {
                !user && (
                  <Text fontSize={'sm'} color={'red.500'} fontWeight={"bold"}>Please login first.</Text>
                )
              }
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Stack>
  )
}

export default Prize