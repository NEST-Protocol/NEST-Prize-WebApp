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

const Form = () => {
  const [data, setData] = useState<TelegramData | undefined>(undefined)
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
      setData(data)
    });
  };

  return (
    <Stack w={['full', 'full', 'container.sm']} p={4}>
      <Stack spacing={2}>
        <FormControl>
          <FormLabel fontSize={'sm'}>
            Channel Name
          </FormLabel>
          <Input size={['lg', 'lg', 'md']}/>
        </FormControl>
        <FormControl>
          <FormLabel fontSize={'sm'}>
            Platform
          </FormLabel>
          <Input size={['lg', 'lg', 'md']}/>
        </FormControl>
        <FormControl>
          <FormLabel fontSize={'sm'}>
            Link
          </FormLabel>
          <Input size={['lg', 'lg', 'md']}/>
        </FormControl>
        <FormControl>
          <FormLabel fontSize={'sm'}>
            Subscribers
          </FormLabel>
          <Input size={['lg', 'lg', 'md']}/>
        </FormControl>
        <FormControl>
          <FormLabel fontSize={'sm'}>
            Country
          </FormLabel>
          <Input size={['lg', 'lg', 'md']}/>
        </FormControl>
        <FormControl>
          <FormLabel fontSize={'sm'}>
            Reason for recommendation
          </FormLabel>
          <Input size={['lg', 'lg', 'md']}/>
        </FormControl>
      </Stack>
      <Stack pt={'20px'} spacing={'20px'}>
        <Button onClick={loginTelegram} size={'lg'}
                leftIcon={data ? <chakra.img src={data.photo_url} alt={data.username}/> : <FaTelegramPlane/>}
                colorScheme={'telegram'}>
          {data ? (data.username || data.first_name) : 'login with telegram'}
        </Button>
        <Button colorScheme={'whatsapp'} size={'lg'}>
          Submit
        </Button>
      </Stack>
    </Stack>
  )
}

export default Form