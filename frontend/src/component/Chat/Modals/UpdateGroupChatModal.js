import { ViewIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";
import { ChatState } from "../../../context/ChatProvider";
import {
  chatUserSearch,
  groupAdd,
  groupRemove,
  groupRename,
} from "../../../utils/APIRoutes";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { selectedChat, setSelectedChat, user } = ChatState();

  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const toast = useToast();

  const handleRemove = async (user1) => {
    const isAdmin = selectedChat?.groupAdmin?._id === user._id;
    const isSelf = user1._id === user._id;

    if (!isAdmin && !isSelf) {
      toast({
        title: "Permission Denied",
        description: "Only admin can remove others",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token is missing");

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const { data } = await axios.put(
        groupRemove,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      if (isSelf && selectedChat.groupAdmin._id === user._id) {
        // Admin leaving: delete group or handle appropriately
        setSelectedChat();
        // Optionally call an API to delete the group permanently
      } else {
        setSelectedChat(data);
      }

      setFetchAgain(!fetchAgain);
      fetchMessages();
    } catch (e) {
      console.log(e);
      toast({
        title: "Error",
        description: "Error removing user",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast({
        title: "User already added",
        description: "User is already in the group",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Permission Denied",
        description: "Only admin can add users",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.put(
        groupAdd,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
    } catch (e) {
      toast({
        title: "Error",
        description: e.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setLoading(false);
      setSearch([]);
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return;
    try {
      setRenameLoading(true);
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.put(
        groupRename,
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error renaming group";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setRenameLoading(false);
      setGroupChatName("");
    }
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.get(
        `${chatUserSearch}?search=${query}`,
        config
      );
      const filtered = data.filter(
        (u) => !selectedChat.users.find((chatUser) => chatUser._id === u._id)
      );
      setSearchResult(filtered);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load search results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      <IconButton
        onClick={onOpen}
        display={{ base: "flex" }}
        icon={<ViewIcon />}
      />
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedChat.chatName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box width="100%" display="flex" flexWrap="wrap" pb={3}>
              {selectedChat.users.map((user1) => (
                <UserBadgeItem
                  key={user1._id}
                  user={user1}
                  handleFunction={() => handleRemove(user1)}
                />
              ))}
            </Box>

            <FormControl display="flex">
              <Input
                placeholder="Chat Name"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
                mb={3}
              />
              <Button
                colorScheme="teal"
                variant="solid"
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>

            <FormControl>
              <Input
                placeholder="Add Users eg: Chirag, John..."
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>

            {loading ? (
              <Spinner size="lg" />
            ) : (
              searchResult
                .slice(0, 4)
                .map((user1) => (
                  <UserListItem
                    key={user1._id}
                    user={user1}
                    handleFunction={() => handleAddUser(user1)}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={() => handleRemove(user)}>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
