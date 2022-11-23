import '../styles/globals.css'
import type {AppProps} from 'next/app'
import {ChakraProvider} from "@chakra-ui/react";
import Script from "next/script";
import Head from "next/head";

export default function App({Component, pageProps}: AppProps) {
  return (
    <ChakraProvider>
      <Head>
        <title>NEST Prize WebApp</title>
        <meta
          name="description"
          content="NEST Prize WebApp for Telegram Bot"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
        <link rel="icon" href="/favicon.svg"/>
      </Head>
      <Script id={"telegram-web-app"} async={true} src={"https://telegram.org/js/telegram-web-app.js"}></Script>
      <Script src={"https://www.googletagmanager.com/gtag/js?id=G-BE17GNN7CH"}></Script>
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                
                gtag('config', 'G-BE17GNN7CH');
              `}
      </Script>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}
