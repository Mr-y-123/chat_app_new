import { useEffect, useState, useMemo, useRef } from "react";
import { Box, Icon, IconButton, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import {
  getAllusers,
  sendMessage,
  getAllMessage,
  uploadFile,
  host,
} from "../utils/APIRoutes";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
const Chat = () => {
  const navigate = useNavigate();
  const socket = useMemo(() => io(host), []);
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || ""
  );
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState();
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  //check user login or not and set user in state
  useEffect(() => {
    if (!localStorage.getItem("user")) {
      navigate("/login");
    } else {
      setCurrentUser(JSON.parse(localStorage.getItem("user")));
    }
  }, []);
  //set senderId in socket.io
  useEffect(() => {
    if (currentUser) {
      socket.emit("user-login", currentUser.user._id);
    }
  }, [currentUser]);
  //fetch contact set in state
  useEffect(() => {
    contacts.length === 0 ? getContacts() : null;
  }, [currentUser]);
  // fetch chat and set a chat in state
  useEffect(() => {
    currentChat !== undefined ? getallMessage() : null;
  }, [currentChat]);

  socket.on("receive-msg", (data) => {
    console.log("receive-msg", data);
    setMessages([
      ...messages,
      { fromSelf: false, message: data.message, m_type: data.m_type },
    ]);
  });
  async function reduce_image_file_size(
    base64Str,
    MAX_WIDTH = 1000,
    MAX_HEIGHT = 1000
  ) {
    let resized_base64 = await new Promise((resolve) => {
      let img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL()); // this will return base64 image results after resize
      };
    });
    return resized_base64;
  }

  async function ImageBase64(file) {
    const reader = new FileReader();
    await reader.readAsDataURL(file);
    const data = new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });
    return data;
  }
  const onSubmit = async (e) => {
    e.preventDefault();
    if (image) {
      const base64Str = await ImageBase64(image);
      const reduceSize = await reduce_image_file_size(base64Str);
      const data = await axios.post(sendMessage, {
        from: currentUser.user._id,
        to: currentChat.contact._id,
        message: reduceSize,
        type: 2,
      });
      socket.emit("send-msg", {
        from: currentUser.user._id,
        to: currentChat.contact._id,
        message: reduceSize,
        m_type: 2,
      });
      const msg = [...messages];
      msg.push({
        fromSelf: true,
        message: reduceSize,
        m_type: 2,
      });
      setMessages(msg);
      setImage("");
    } else if (pdf) {
      const base64Strpdf = await ImageBase64(pdf);
      const data = await axios.post(sendMessage, {
        from: currentUser.user._id,
        to: currentChat.contact._id,
        message: base64Strpdf,
        type: 3,
      });
      socket.emit("send-msg", {
        from: currentUser.user._id,
        to: currentChat.contact._id,
        message: base64Strpdf,
        m_type: 3,
      });
      const msg = [...messages];
      msg.push({
        fromSelf: true,
        message: base64Strpdf,
        m_type: 3,
      });
      setMessages(msg);
      setPdf("");
    } else if (message) {
      const data = await axios.post(sendMessage, {
        from: currentUser.user._id,
        to: currentChat.contact._id,
        message,
        type: 1,
      });
      socket.emit("send-msg", {
        from: currentUser.user._id,
        to: currentChat.contact._id,
        message,
        m_type: 1,
      });
      const msg = [...messages];
      msg.push({ fromSelf: true, message, m_type: 1 });
      setMessages(msg);
    } else {
      alert("please enter message!");
    }
    setMessage("");
    e.target.reset();
  };

  const getContacts = async () => {
    if (currentUser) {
      const data = await axios.get(`${getAllusers}/${currentUser?.user._id}`);
      setContacts(data.data);
    }
  };
  const getallMessage = async () => {
    const response = await axios.post(getAllMessage, {
      from: currentUser.user._id,
      to: currentChat.contact._id,
    });
    setMessages(response.data);
  };
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handlDownload = async (base64Data, fileName, contentType) => {
    // const pageImage = new Image();
    // pageImage.src = base64Data;
    // pageImage.onload = function () {
    //   const canvas = document.createElement("canvas");
    //   canvas.width = pageImage.naturalWidth;
    //   canvas.height = pageImage.naturalHeight;
    //   const ctx = canvas.getContext("2d");
    //   ctx.imageSmoothingEnabled = false;
    //   ctx.drawImage(pageImage, 0, 0);
    //   const link = document.createElement("a");
    //   link.download = fileName + ".png";
    //   console.log(canvas);
    //   canvas.toBlob(function (blob) {
    //     console.log(blob);
    //     link.href = URL.createObjectURL(blob);
    //     link.click();
    //   });
    // };

    const base64 = await fetch(base64Data);
    const blob = await base64.blob();
    var url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName + ".png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleDownloadPdf = async (base64PdfStr, pdfName) => {
    const downloadLink = document.createElement("a");
    downloadLink.href = base64PdfStr;
    downloadLink.download = pdfName + ".pdf";
    downloadLink.click();
  };
  const messageRender = messages.map((msg) => {
    if (msg.m_type === 2) {
      return (
        <div className={`message${msg.fromSelf ? "-sended" : "-recieved"}`}>
          {msg.fromSelf ? (
            <div>
              <img src={msg.message} width={"200px"} />
            </div>
          ) : (
            <div className="receiver-image">
              <img src={msg.message} width={"200px"} />
              <button
                onClick={() => {
                  handlDownload(
                    msg.message,
                    `image-${Math.random() * 100}`,
                    "image/png"
                  );
                }}
              >
                download
              </button>
            </div>
          )}
        </div>
      );
    } else if (msg.m_type === 3) {
      return (
        <div className={`message${msg.fromSelf ? "-sended" : "-recieved"}`}>
          <Box
            component="section"
            sx={{
              p: 1,
              border: "1px dashed grey",
              width: "182px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {msg.fromSelf ? (
              <Typography>{msg.message.substring(0, 20)}</Typography>
            ) : (
              <>
                <Typography>{msg.message.substring(0, 20)}</Typography>{" "}
                <IconButton
                  onClick={() =>
                    handleDownloadPdf(msg.message, `pdf-${Math.random() * 100}`)
                  }
                >
                  <DownloadIcon />
                </IconButton>
              </>
            )}
          </Box>
        </div>
      );
    } else if (msg.m_type === 1) {
      return (
        <div className={`message${msg.fromSelf ? "-sended" : "-recieved"}`}>
          <p>{msg.message}</p>
        </div>
      );
    }
  });
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  console.log("messages", messages);
  return (
    <div className="chat-container">
      <div className="user-list">
        {contacts.map((contact, index) => (
          <div
            className={index === currentChat?.index ? "selected" : "user-info"}
            key={contact._id}
            onClick={() => setCurrentChat({ contact, index })}
          >
            <p>{contact.username}</p>
          </div>
        ))}
      </div>
      <div className="chat-list">
        {!currentChat ? (
          <h1>Welocome to chat</h1>
        ) : (
          <>
            <div className="chat-header">
              <h3>{currentChat.contact.username}</h3>
              <button onClick={handleLogout}>logout</button>
            </div>
            <div
              className="chat-box"
              ref={scrollRef}
              key={currentChat.contact._id}
            >
              {messageRender}
            </div>
            <div className="chat-send-box">
              <form onSubmit={onSubmit}>
                <input
                  type="text"
                  value={message}
                  placeholder="Message"
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={pdf || image ? true : false}
                />
                <input
                  type="file"
                  placeholder="select image"
                  onChange={(e) => setImage(e.target.files[0])}
                  disabled={message || pdf ? true : false}
                  name="file"
                />
                <input
                  type="file"
                  placeholder="select pdf"
                  disabled={message || image ? true : false}
                  onChange={(e) => setPdf(e.target.files[0])}
                  name="file"
                />
                <button type="submit">send</button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default Chat;
