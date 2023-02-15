import {Button, Stack} from "@chakra-ui/react";
import {FaTelegramPlane} from "react-icons/fa";

const Form = () => {

  const loginTelegram = () => {
    // @ts-ignore
    window?.Telegram.Login.auth({ bot_id: process.env.BOT_TOKEN || '', request_access: 'write', embed: 1 }, (data) => {
      console.log(data);
      if (!data) {
      }
    });
  };

  return (
    <Stack>
      <Button onClick={loginTelegram} leftIcon={<FaTelegramPlane/>} colorScheme={'telegram'}>
        login with telegram
      </Button>

    </Stack>
  )
}

export default Form