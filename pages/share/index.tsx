import {Button, HStack, Stack, Text, Image} from "@chakra-ui/react";
import {useCallback, useEffect, useState} from "react";
import domtoimage from "../../utils/dom-to-image";
import {useRouter} from "next/router";
import QRCode from 'qrcode';
import b64toBlob from 'b64-to-blob';


const Share = () => {
  const [qr, setQr] = useState('')
  const router = useRouter()
  const { from, rate, orientation, level, token, open_price, now_price } = router.query
  const [hasCopied, setHasCopied] = useState(false)

  const buildQrCode = useCallback(async () => {
    const qr = await QRCode.toDataURL(`https://t.me/NESTRedEnvelopesBot?start=${from}`, {
      errorCorrectionLevel: 'L',
      margin: 0,
      color: {
        dark: '#000000ff',
        light: '#0000',
      }
    });
    setQr(qr)
  }, [from])

  useEffect(()=> {
    buildQrCode()
  }, [buildQrCode])

  const download = () => {
    const node = document.getElementById('my-share');
    if (node) {
      domtoimage.toPng(node, {
        bgcolor: '#fff',
        width: node.clientWidth || 360,
        height: node.clientHeight || 640,
        quality: 1,
        scale: 2,
      })
        .then(function (dataUrl) {
          const link = document.createElement('a');
          link.download = `${from}.png`;
          link.href = dataUrl;
          link.click();
        })
    }
  }

  const copy = () => {
    const node = document.getElementById('my-share');
    if (node) {
      domtoimage.toPng(node, {
        bgcolor: '#fff',
        width: node.clientWidth || 360,
        height: node.clientHeight || 640,
        quality: 1,
        scale: 2,
      })
        .then(function (dataUrl) {
          const blob = b64toBlob(dataUrl.split(',')[1], 'image/png')
          const input = new window.ClipboardItem({ "image/png": blob });
          navigator.clipboard.write([input]).then(() => {
            setHasCopied(true)
            setTimeout(() => {
              setHasCopied(false)
            }, 2000)
          })
        })
    }
  }

  return (
    <>
      <Stack maxW={'container.sm'} w={'full'} spacing={'16px'}>
        <Stack p={'16px'}>
          <Stack id={'my-share'} p={'16px'} bgImage={'/img/shareOrder.png'} bgSize={'cover'} borderRadius={'20px'}>
            <HStack justify={"center"} spacing={'10px'} pt={'8px'} pb={'20px'}>
              <Image src={'/svg/NEST_LOGO.svg'} alt={'logo'}/>
              <Text fontSize={'12.5px'} fontWeight={'500'} color={'#2F759D'}>Share</Text>
            </HStack>
            <HStack justify={"space-around"} h={'40px'} borderTop={'1px solid #CCDDF4'} borderBottom={'1px solid #CCDDF4'}>
              <Stack w={'80px'} align={"center"}>
                <Image src={`/svg/${String(orientation || 'long').toLowerCase()}.svg`} h={'12px'} alt={'orientation'}/>
              </Stack>
              <Stack w={'60px'} textAlign={"center"}>
                <Text  color={'#2F759D'} fontSize={'12.5px'} fontWeight={'700'}>{level}X</Text>
              </Stack>
              <HStack w={'80px'} justifyContent={"center"} spacing={-2}>
                <Image src={`/svg/${String(token)?.toLowerCase()?.split('/')[0]}.svg`} h={'20px'} zIndex={10} alt={''}/>
                <Image src={`/svg/${String(token)?.toLowerCase().split('/')[1]}.svg`} h={'20px'} alt={''}/>
              </HStack>
            </HStack>
            <Stack spacing={'24px'} py={'80px'}>
              <Stack spacing={'4px'} textAlign={"center"}>
                <Text fontSize={'12.5px'} fontWeight={'500'} color={'#2F759D'}>Total Profit</Text>
                <Text fontSize={'24px'} fontWeight={'500'} color={'#0047BB'}>{Number(rate) > 0 ? '+' : ''}{rate || '-'}%</Text>
              </Stack>
              <Stack spacing={'4px'} textAlign={"center"}>
                <Text fontSize={'12.5px'} fontWeight={'500'} color={'#2F759D'}>Last price</Text>
                <Text fontSize={'24px'} fontWeight={'500'} color={'#003232'}>{now_price || '-'}</Text>
              </Stack>
              <Stack spacing={'4px'} textAlign={"center"}>
                <Text fontSize={'12.5px'} fontWeight={'500'} color={'#2F759D'}>Avg Open Price</Text>
                <Text fontSize={'24px'} fontWeight={'500'} color={'#003232'}>{open_price || '-'}</Text>
              </Stack>
            </Stack>
            <Stack align={"center"} pb={'80px'}>
              <Image src={qr} h={'80px'} w={'80px'} alt={'url'} />
            </Stack>
          </Stack>
        </Stack>
      </Stack>
      <HStack w={'full'} maxW={'container.sm'} zIndex={100} position={'absolute'} px={'32px'} bottom={'48px'}>
        <Button width={"full"} minH={'34px'} borderRadius={'full'} color={'white'} fontWeight={'700'} fontSize={'12.5px'}
                background={'linear-gradient(90deg, #8BB7FF 0%, #0061FF 100%)'} _hover={{opacity: "0.8"}} _active={{opacity: "0.8"}}
                onClick={copy}
                boxShadow={'0px 4px 4px rgba(0, 0, 0, 0.25)'}>
          { hasCopied ? 'Copied' : 'Copy' }
        </Button>
        <Button width={"full"} minH={'34px'} borderRadius={'full'} color={'white'} fontWeight={'700'} fontSize={'12.5px'}
                background={'linear-gradient(90deg, #8BB7FF 0%, #0061FF 100%)'} _hover={{opacity: "0.8"}} _active={{opacity: "0.8"}}
                onClick={download}
                boxShadow={'0px 4px 4px rgba(0, 0, 0, 0.25)'}>Download</Button>
        <Button width={"full"} minH={'34px'} borderRadius={'full'} color={'white'} fontWeight={'700'} fontSize={'12.5px'}
                background={'linear-gradient(90deg, #8BB7FF 0%, #0061FF 100%)'} _hover={{opacity: "0.8"}} _active={{opacity: "0.8"}}
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?text=hello&url=https://t.me/NESTRedEnvelopesBot?start=${from}&hashtags=NEST,NESTFinance,NESTRedEnvelopes`)
                }}
                boxShadow={'0px 4px 4px rgba(0, 0, 0, 0.25)'}>Twitter</Button>
      </HStack>
    </>
  )
}

export default Share