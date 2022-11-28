import {
  Button, Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay, Progress,
  Spacer,
  Stack,
  Text, useDisclosure
} from "@chakra-ui/react";

const Prize = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Stack maxW={'container.sm'} w={'full'} h={'100vh'} p={'20px'} spacing={'20px'}>
      <Text textAlign={"center"} fontWeight={'bold'}>Prize TXT</Text>
      {/*<Stack h={'240px'} w={'full'}>*/}

      {/*</Stack>*/}
      <Stack>
        <Text fontWeight={'bold'}>Event Introduction</Text>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl nec ultricies lacinia, nisl nunc
          tincidunt nisl, eget aliquam nisl nisl sit amet dolor. Nulla facilisi. Nulla facilisi. Nulla facilisi. Nulla
        </Text>
      </Stack>

      <Spacer/>
      <Button minH={'44px'} bg={'rgba(255, 0, 0, 0.7)'} color={'white'} onClick={onOpen}>
        Snatch!
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Snatch!</ModalHeader>
          <ModalBody>
            <Stack pb={'20px'}>
              <Text fontSize={'sm'}>
                Please wait for the result...
              </Text>
              <Progress size='xs' isIndeterminate />
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Stack>
  )
}

export default Prize