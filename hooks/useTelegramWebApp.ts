import {useCallback, useEffect, useState} from "react";
import axios from "axios";
import qs from "qs";

interface TelegramUser {
  id: number
  first_name: string
  last_name: string
  username: string
  language_code: string
}

const useTelegramWebApp = () => {
  const [initData, setInitData] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<TelegramUser | undefined>(undefined)
  const [isValid, setIsValid] = useState<boolean>(false)

  const valid = useCallback(async () => {
    if (initData) {
      const res = await axios("/api/telegram", {
        method: "GET",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: qs.stringify({
          _auth: initData,
        }),
      });
      if (res.status === 200) {
        setIsValid(true)
      }
    }
  }, [initData])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window?.Telegram?.WebApp.ready();
      // @ts-ignore
      const initData = window?.Telegram?.WebApp?.initData || "";
      // @ts-ignore
      const initDataUnsafe = window?.Telegram?.WebApp?.initDataUnsafe || {};
      setInitData(initData);
      setUser(initDataUnsafe?.user || undefined)
    }
  }, [])

  useEffect(() => {
    valid()
  }, [valid])

  return {
    user,
    isValid,
  }
}

export default useTelegramWebApp