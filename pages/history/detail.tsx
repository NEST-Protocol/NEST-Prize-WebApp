import {Stack, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr} from "@chakra-ui/react";
import {useRouter} from "next/router";

const Detail = () => {
  const route = useRouter();

  return (
    <Stack maxW={'container.sm'} w={'full'} h={'100vh'} p={'20px'} spacing={'20px'}>
      <Text fontSize={'sm'} fontWeight={'bold'} cursor={"pointer"}
            onClick={() => {
              route.push({
                pathname: '/history',
                query: {
                  ...route.query
                }
              })
            }}>« Back</Text>
      <Text textAlign={"center"} fontWeight={'bold'}>Winning Prize List</Text>
      <Text>@username have got 100 NEST!</Text>

      <Text textAlign={"center"} fontWeight={'bold'}>Full List</Text>

      <TableContainer>
        <Table variant='striped'>
          <Thead>
            <Tr>
              <Th>id</Th>
              <Th>username</Th>
              <Th isNumeric>amount</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>1</Td>
              <Td>@username</Td>
              <Td isNumeric>25.4 NEST</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </Stack>
  )
}

export default Detail