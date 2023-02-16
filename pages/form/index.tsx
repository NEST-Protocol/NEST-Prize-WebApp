import {Button, FormControl, FormLabel, Input, Stack, chakra} from "@chakra-ui/react";
import {FaTelegramPlane} from "react-icons/fa";
import {useState} from "react";

type TelegramData = {
  hash: string,
  id: string,
  photo_url: string,
  first_name: string,
  last_name: string,
  username: string,
  auth_date: number,
}

type FormData = {
  channelName: string,
  platform: string,
  link: string,
  subscribers: string,
  country: string,
  reason: string,
}

const Form = () => {
  const [userData, setUserData] = useState<TelegramData | undefined>(undefined)
  const [data, setData] = useState<FormData>({
    channelName: '',
    platform: '',
    link: '',
    subscribers: '',
    country: '',
    reason: '',
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

  return (
    <Stack w={['full', 'full', 'container.sm']} p={4}>
      <Stack spacing={2}>
        <FormControl>
          <FormLabel fontSize={'sm'}>
            Channel Name
          </FormLabel>
          <Input size={'lg'} value={data.channelName} onChange={(e) => setData({...data, channelName: e.target.value})}/>
        </FormControl>
        <FormControl>
          <FormLabel fontSize={'sm'}>
            Platform
          </FormLabel>
          <Input size={'lg'} value={data.platform} onChange={(e) => setData({...data, platform: e.target.value})}/>
        </FormControl>
        <FormControl>
          <FormLabel fontSize={'sm'}>
            Link
          </FormLabel>
          <Input size={'lg'} value={data.link} onChange={(e) => setData({...data, link: e.target.value})} />
        </FormControl>
        <FormControl>
          <FormLabel fontSize={'sm'}>
            Subscribers
          </FormLabel>
          <Input size={'lg'} type={'number'} value={data.subscribers} onChange={(e) => setData({...data, subscribers: e.target.value})} />
        </FormControl>
        <FormControl>
          <FormLabel fontSize={'sm'}>
            Country
          </FormLabel>
          <Input size={'lg'} value={data.country} onChange={(e) => setData({...data, country: e.target.value})}/>
        </FormControl>
        <FormControl>
          <FormLabel fontSize={'sm'}>
            Reason for recommendation
          </FormLabel>
          <Input size={'lg'} value={data.reason} onChange={(e) => setData({...data, reason: e.target.value})}/>
        </FormControl>
      </Stack>
      <Stack pt={'20px'} spacing={'20px'}>
        <Button onClick={loginTelegram} size={'lg'} variant={userData ? 'ghost' : 'solid'}
                leftIcon={userData ? <chakra.img src={userData.photo_url} w={'32px'} h={'32px'} borderRadius={'full'} alt={userData?.username}/> : <FaTelegramPlane/>}
                colorScheme={'telegram'}>
          {userData ? (userData.username || userData.first_name) : 'login with telegram'}
        </Button>
        <Button colorScheme={'whatsapp'} size={'lg'}>
          Submit
        </Button>
      </Stack>
    </Stack>
  )
}

export default Form