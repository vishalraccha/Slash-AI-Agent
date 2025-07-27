import React, { useState, useEffect, useContext, useRef } from "react";
import { UserContext } from "../context/user.context";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../config/axios";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";
import Markdown from "markdown-to-jsx";
import hljs from "highlight.js";

import JSZip from "jszip";
import { saveAs } from "file-saver";

function SyntaxHighlightedCode(props) {
  const ref = useRef(null);

  React.useEffect(() => {
    if (ref.current && props.className?.includes("lang-") && window.hljs) {
      window.hljs.highlightElement(ref.current);

      // hljs won't reprocess the element unless this attribute is removed
      ref.current.removeAttribute("data-highlighted");
    }
  }, [props.className, props.children]);

  return <code {...props} ref={ref} />;
}

const Project = () => {
  const location = useLocation();

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set()); // Initialized as Set
  const [project, setProject] = useState(location.state.project);
  const [message, setMessage] = useState("");
  const { user } = useContext(UserContext);
  const messageBox = React.createRef();

  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]); // New state variable for messages
  const [fileTree, setFileTree] = useState({});

  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);

  const handleUserClick = (id) => {
    setSelectedUserId((prevSelectedUserId) => {
      const newSelectedUserId = new Set(prevSelectedUserId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }

      return newSelectedUserId;
    });
  };

  const downloadProject = async (projectName, fileTree) => {
    const zip = new JSZip();
  
    const addFilesToZip = (fileTree, path = "") => {
      Object.keys(fileTree).forEach((key) => {
        const current = fileTree[key];
        const currentPath = path ? `${path}/${key}` : key;
  
        if (current.file) {
          zip.file(currentPath, current.file.contents); // Include full path
        } else {
          // It's a folder, create the folder in the zip
          zip.folder(currentPath);
          addFilesToZip(current, currentPath); // Recursive for nested folders
        }
      });
    };
  
    addFilesToZip(fileTree);
  
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${projectName}.zip`);
  };
  

  function addCollaborators() {
    axios
      .put("/projects/add-user", {
        projectId: location.state.project._id,
        users: Array.from(selectedUserId),
      })
      .then((res) => {
        console.log(res.data);
        setIsModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const send = () => {
    sendMessage("project-message", {
      message,
      sender: user,
    });
    setMessages((prevMessages) => [...prevMessages, { sender: user, message }]); // Update messages state
    setMessage("");
  };

  function WriteAiMessage(message) {
    const messageObject = JSON.parse(message);
    console.log(messageObject);
    

    return (
      <div className="overflow bg-slate-950 text-white rounded-sm p-2">
        <Markdown
          children={messageObject.text}
          options={{
            overrides: {
            code: SyntaxHighlightedCode,
            },
          }}
        />
      </div>
    );
  }

  useEffect(() => {
    initializeSocket(project._id);

    receiveMessage("project-message", (data) => {
      console.log("The data is ", data);

      if (data.sender._id === "ai") {
        let message;
        try {
          // Attempt to parse the message as JSON
          message = JSON.parse(data.message);
        } catch (error) {
          console.error("Failed to parse JSON:", error);
          console.error("Invalid message content:", data.message);
          // Handle invalid JSON gracefully
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              sender: data.sender,
              message: "Error: Received invalid JSON from AI.",
            },
          ]);
          return; // Exit the function if JSON parsing fails
        }

        console.log("Incoming message:", message);

        // Handle file tree updates if present in the message
        if (message.fileTree) {
          setFileTree(message.fileTree || {});
        }

        // Add the parsed message to the chat
        setMessages((prevMessages) => [...prevMessages, data]);
      } else {
        // Add non-AI messages to the chat
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    });

    axios
      .get(`/projects/get-project/${location.state.project._id}`)
      .then((res) => {
        console.log(res.data.project);

        setProject(res.data.project);
        setFileTree(res.data.project.fileTree || {});
      });

    axios
      .get("/users/all")
      .then((res) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function saveFileTree(ft) {
    axios
      .put("/projects/update-file-tree", {
        projectId: project._id,
        fileTree: ft,
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function scrollToBottom() {
    messageBox.current.scrollTop = messageBox.current.scrollHeight;
  }

  return (
    <main className="h-screen w-screen flex">
      <section className="left relative flex flex-col h-screen min-w-96 bg-[#1e1e1e]">
        <header className="flex justify-center items-center p-2 px-4 w-full text-white absolute z-10 ">
          <button className="flex gap-2" onClick={() => setIsModalOpen(true)}>
            {/* <i className="ri-add-fill mr-1"></i> */}
            <p>Slash Playground</p>
          </button>
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="p-2"
          >
            {/* <i className="ri-group-fill"></i> */}
          </button>
        </header>
        <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">
          <div
            ref={messageBox}
            className="message-box p-1 flex-grow flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${
                  msg?.sender?._id === user._id?.toString() ? "ml-auto" : ""
                } max-w-80 message flex flex-col p-2 bg-slate-50 w-fit rounded-md`}
              >
                <small className="opacity-65 text-xs">
                  {msg?.sender?.email || "Unknown"}
                </small>
                <div className="text-sm">
                  {msg?.sender?._id === "ai" ? (
                    WriteAiMessage(msg.message)
                  ) : (
                    <p>{msg.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="inputField w-full flex absolute bottom-0">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="p-2  px-4 mb-1 border-none outline-none flex-grow bg-[#181818] text-white rounded-lg"
              type="text"
              placeholder="Enter message"
            />
            <button onClick={send} className="px-4 bg-[#181818] rounded-3xl mx-2 mb-1 text-white">
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>
        {/* <div
          className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0`}
        >
          <header className="flex justify-between items-center px-4 p-2 bg-slate-200">
            <h1 className="font-semibold text-lg">Collaborators</h1>

            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="p-2"
            >
              <i className="ri-close-fill"></i>
            </button>
          </header>
          <div className="users flex flex-col gap-2">
            {project.users &&
              project.users.map((user) => {
                return (
                  <div
                    key={user._id}
                    className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center"
                  >
                    <div className="aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600">
                      <i className="ri-user-fill absolute"></i>
                    </div>
                    <h1 className="font-semibold text-lg">{user.email}</h1>
                  </div>
                );
              })}

             
              </div>
            </div> */}
            </section>

            <section className="right bg-[#1e1e1e] flex-grow h-full flex">
            <div className="explorer h-full max-w-64 min-w-52 bg-[#181818]">
              <div className="file-tree w-full">
              {Object.keys(fileTree).map((file, index) => (
                <button
                key={file}
                onClick={() => {
                  setCurrentFile(file);
                  setOpenFiles([...new Set([...openFiles, file])]);
                }}
                className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 text-white  w-full"
                >
                <p className="font-semibold text-lg">{file}</p>
                </button>
              ))}
              </div>
            </div>

            <div className="code-editor flex flex-col flex-grow h-full shrink">
              <div className="top flex justify-between w-full">
              <div className="files flex">
                {openFiles.map((file, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFile(file)}
                  className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 text-white  ${
                  currentFile === file ? "bg-[#181818]" : ""
                  }`}
                >
                  <p className="font-semibold text-lg">{file}</p>
                </button>
                ))}
              </div>

              <div className="actions flex gap-2">
                <button
                onClick={() => downloadProject("APG-Project",fileTree)}
                className="px-4 py-2 m-2 bg-[#181818] text-white rounded"
                >
                Download
                </button>
                </div>
          </div>
          <div className="bottom flex flex-grow max-w-full shrink overflow-auto p-2 text-white">
          {
                            fileTree[ currentFile ] && (
                                <div className="code-editor-area h-full overflow-auto flex-grow ">
                                    <pre
                                        className="hljs h-full">
                                        <code
                                            className="hljs h-full outline-none"
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => {
                                                const updatedContent = e.target.innerText;
                                                const ft = {
                                                    ...fileTree,
                                                    [ currentFile ]: {
                                                        file: {
                                                            contents: updatedContent
                                                        }
                                                    }
                                                }
                                                setFileTree(ft)
                                                saveFileTree(ft)
                                            }}
                                            dangerouslySetInnerHTML={{ __html: hljs.highlight('javascript', fileTree[ currentFile ].file.contents).value }}
                                            style={{
                                                whiteSpace: 'pre-wrap',
                                                paddingBottom: '25rem',
                                                counterSet: 'line-numbering',
                                            }}
                                        />
                                    </pre>
                                </div>
                            )
                        }
          </div>
        </div>

      </section>

      {/* {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md w-96 max-w-full relative">
            <header className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Select User</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2">
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`user cursor-pointer hover:bg-slate-200 ${
                    Array.from(selectedUserId).indexOf(user._id) != -1
                      ? "bg-slate-200"
                      : ""
                  } p-2 flex gap-2 items-center`}
                  onClick={() => handleUserClick(user._id)}
                >
                  <div className="aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600">
                    <i className="ri-user-fill absolute"></i>
                  </div>
                  <h1 className="font-semibold text-lg">{user.email}</h1>
                </div>
              ))}
            </div>
            <button
              onClick={addCollaborators}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Add Collaborators
            </button>
          </div>
        </div>
      )} */}
    </main>
  );
};

export default Project;
