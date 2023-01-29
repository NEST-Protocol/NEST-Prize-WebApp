import {Divider, HStack, Select, Stack, Tab, TabList, Tabs, Text} from "@chakra-ui/react";

const IceCream = () => {
  return (
    <Stack maxW={'container.sm'} w={'full'} h={'100vh'} p={'16px'} spacing={'16px'}>
      <Select bg={'#F7F8FA'} borderRadius={'full'} border={'1px solid #EEEEEE'} color={'#878787'}
              boxShadow={'0px 0px 10px 0px #EEEEEE'}>
        <option value='option1'>Feb 1st to 3th</option>
        <option value='option2'>Feb 4st to 6th</option>
        <option value='option3'>Feb 7st to 9th</option>
      </Select>
      <Tabs isFitted>
        <TabList>
          <Tab fontSize={'12.5px'} fontWeight={'bold'}>Trading Ranking</Tab>
          <Tab fontSize={'12.5px'} fontWeight={'bold'}>Profit Ranking</Tab>
        </TabList>
      </Tabs>
      <HStack p={'30px'} justifyContent={'space-around'} border={'2px solid #EEEEEE'} borderRadius={'14px'}>
        <Stack w={'120px'}>
          <Text fontSize={'12.5px'} fontWeight={'bold'}>6433</Text>
          <Text fontSize={'10.5px'} fontWeight={'500'} color={'#878787'}>Transaction amount</Text>
        </Stack>
        <Stack w={'120px'}>
          <Text fontSize={'12.5px'} fontWeight={'bold'}>6433</Text>
          <Text fontSize={'10.5px'} fontWeight={'500'} color={'#878787'}>Bonus pool</Text>
        </Stack>
      </HStack>
      <Stack>
        <Text fontSize={'14px'} fontWeight={'bold'}>Your Ranking</Text>
        <HStack border={'2px solid #EEEEEE'} p={'30px'} borderRadius={'14px'} spacing={'30px'}>
          <Text fontSize={'xl'} fontWeight={'semibold'}>80</Text>
          <Stack fontSize={'12.5px'} fontWeight={'600'} w={'full'}>
            <Text>name</Text>
            <Text color={'#00B7EE'}>address</Text>
            <Divider/>
            <HStack justify={'space-between'} w={'full'} color={'#878787'}>
              <Text w={'100px'}>Trading</Text>
              <Text w={'100px'}>Giveaway</Text>
            </HStack>
            <HStack justify={'space-between'} w={'full'}>
              <Text w={'100px'}>1000 NEST</Text>
              <Text w={'100px'}>999 NEST</Text>
            </HStack>
          </Stack>
        </HStack>
      </Stack>
      <Stack>
        <Text fontSize={'14px'} fontWeight={'bold'}>Ranking</Text>
        <HStack p={'30px'} border={'2px solid #EEEEEE'} borderRadius={'14px'} spacing={'30px'}>
          <Text fontSize={'xl'} fontWeight={'semibold'}>80</Text>
          <Stack fontSize={'12.5px'} fontWeight={'600'} w={'full'}>
            <Text>name</Text>
            <Text color={'#00B7EE'}>address</Text>
            <Divider/>
            <HStack justify={'space-between'} w={'full'} color={'#878787'}>
              <Text w={'100px'}>Trading</Text>
              <Text w={'100px'}>Giveaway</Text>
            </HStack>
            <HStack justify={'space-between'} w={'full'}>
              <Text w={'100px'}>1000 NEST</Text>
              <Text w={'100px'}>999 NEST</Text>
            </HStack>
          </Stack>
        </HStack>
      </Stack>


    </Stack>
  )
}

export default IceCream