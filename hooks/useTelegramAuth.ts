import {useCallback, useEffect, useState} from "react";

interface TelegramUser {
  id: number
  first_name: string
  last_name: string
  username: string
  language_code: string
}

const useTelegramAuth = () => {
  const [user, setUser] = useState<TelegramUser | undefined>(undefined)

  const getUser = useCallback(async () => {
    if (typeof window !== 'undefined' && !user) {
      // @ts-ignore
      window?.Telegram?.WebApp.ready();
      // @ts-ignore
      const initDataUnsafe = window?.Telegram?.WebApp?.initDataUnsafe || {};
      setUser(initDataUnsafe?.user || undefined)
    }
  }, [user])

  useEffect(() => {
    getUser();
    const interval = setInterval(() => {
      getUser();
    }, 3000);
    return () => clearInterval(interval);
  }, [getUser])

  return {
    user,
  }
}

export default useTelegramAuth