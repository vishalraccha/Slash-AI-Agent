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
      <div className="bg-[#0d1117] border border-[#30363d] text-white rounded-lg p-4 font-mono text-sm">
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
    <main className="h-screen w-screen flex bg-[#1e1e1e] text-white overflow-hidden">
      {/* Chat Section - Left Panel */}
      <section className="flex flex-col w-96 bg-[#252526] border-r border-[#2d2d30] shadow-2xl">
        {/* Chat Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-[#2d2d30] border-b border-[#3e3e42] shadow-sm">
          <button 
            className="flex items-center gap-2 text-[#cccccc] hover:text-white transition-colors" 
            onClick={() => setIsModalOpen(true)}
          >
            <div className="w-2 h-2 bg-[#00d4aa] rounded-full shadow-sm shadow-[#00d4aa]/50"></div>
            <span className="font-medium text-sm">Slash Playground</span>
          </button>
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="p-2 hover:bg-[#37373d] rounded-md transition-colors text-[#cccccc] hover:text-white"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </header>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div
            ref={messageBox}
            className="flex-1 px-4 py-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-track-[#2d2d30] scrollbar-thumb-[#424242] hover:scrollbar-thumb-[#4f4f4f]"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg?.sender?._id === user._id?.toString() ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] ${msg?.sender?._id === user._id?.toString() 
                  ? "bg-[#0969da] rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md" 
                  : "bg-[#21262d] border border-[#30363d] rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-md"
                } p-4 shadow-lg`}>
                  <div className="text-xs text-[#8c8c8c] mb-2 font-medium">
                    {msg?.sender?.email || "Unknown"}
                  </div>
                  <div className="text-sm leading-relaxed">
                    {msg?.sender?._id === "ai" ? (
                      WriteAiMessage(msg.message)
                    ) : (
                      <p className="text-white break-words">{msg.message}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="px-4 py-4 bg-[#2d2d30] border-t border-[#3e3e42]">
            <div className="flex gap-3 items-end">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-[#1e1e1e] text-white px-4 py-3 border border-[#424242] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] rounded-lg outline-none text-sm placeholder-[#8c8c8c] transition-all"
                type="text"
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && send()}
              />
              <button 
                onClick={send} 
                className="px-4 py-3 bg-[#0969da] hover:bg-[#0860ca] text-white rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#0969da]/25 active:scale-95"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Code Editor Section - Right Panel */}
      <section className="flex-1 flex bg-[#1e1e1e]">
        {/* File Explorer */}
        <div className="w-64 bg-[#252526] border-r border-[#2d2d30] flex flex-col">
          {/* Explorer Header */}
          <div className="px-4 py-3 bg-[#2d2d30] border-b border-[#3e3e42]">
            <h2 className="text-xs font-semibold text-[#cccccc] uppercase tracking-wider">Explorer</h2>
          </div>

          {/* File Tree */}
          <div className="flex-1 overflow-y-auto py-2">
            {Object.keys(fileTree).length === 0 ? (
              <div className="px-4 py-8 text-center text-[#8c8c8c] text-sm">
                <div className="mb-2">📁</div>
                <div>No files</div>
              </div>
            ) : (
              Object.keys(fileTree).map((file, index) => (
                <button
                  key={file}
                  onClick={() => {
                    setCurrentFile(file);
                    setOpenFiles([...new Set([...openFiles, file])]);
                  }}
                  className={`w-full text-left px-4 py-2 flex items-center gap-3 text-sm hover:bg-[#2a2d2e] transition-colors ${
                    currentFile === file ? "bg-[#37373d] text-white border-r-2 border-[#0969da]" : "text-[#cccccc]"
                  }`}
                >
                  <span className="text-[#519aba]">📄</span>
                  <span className="truncate">{file}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Bar */}
          <div className="flex bg-[#2d2d30] border-b border-[#3e3e42] min-h-[40px] items-center">
            <div className="flex flex-1">
              {openFiles.map((file, index) => (
                <div
                  key={index}
                  className={`flex items-center group border-r border-[#3e3e42] ${
                    currentFile === file ? "bg-[#1e1e1e]" : "bg-[#2d2d30] hover:bg-[#37373d]"
                  }`}
                >
                  <button
                    onClick={() => setCurrentFile(file)}
                    className="px-4 py-2.5 text-sm flex items-center gap-2 transition-colors"
                  >
                    <span className="text-[#519aba]">📄</span>
                    <span className={`truncate max-w-32 ${currentFile === file ? "text-white" : "text-[#cccccc]"}`}>
                      {file}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      const newFiles = openFiles.filter(f => f !== file);
                      setOpenFiles(newFiles);
                      if (currentFile === file) {
                        setCurrentFile(newFiles[newFiles.length - 1] || null);
                      }
                    }}
                    className="px-2 py-2.5 hover:bg-[#464647] opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg className="w-3 h-3 text-[#cccccc]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center px-4">
              <button
                onClick={() => downloadProject("APG-Project", fileTree)}
                className="px-4 py-2 bg-[#0969da] hover:bg-[#0860ca] text-white rounded-md text-xs font-medium transition-all duration-200 hover:shadow-lg hover:shadow-[#0969da]/25 active:scale-95 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download
              </button>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 bg-[#1e1e1e] overflow-auto">
            {fileTree[currentFile] ? (
              <div className="h-full">
                <pre className="h-full m-0 p-6 overflow-auto text-sm font-mono leading-relaxed">
                  <code
                    className="hljs block w-full min-h-full outline-none bg-transparent text-white"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updatedContent = e.target.innerText;
                      const ft = {
                        ...fileTree,
                        [currentFile]: {
                          file: {
                            contents: updatedContent
                          }
                        }
                      }
                      setFileTree(ft)
                      saveFileTree(ft)
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: hljs.highlight('javascript', fileTree[currentFile].file.contents).value 
                    }}
                    style={{
                      whiteSpace: 'pre-wrap',
                      paddingBottom: '25rem',
                      counterSet: 'line-numbering',
                      lineHeight: '1.6',
                    }}
                  />
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-[#8c8c8c]">
                <div className="text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-medium mb-2 text-[#cccccc]">Welcome to Code Editor</h3>
                  <p className="text-sm">Select a file from the explorer to start coding</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal remains the same but with updated styling */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#252526] border border-[#3e3e42] rounded-xl w-96 max-w-full shadow-2xl">
            <header className="flex justify-between items-center p-4 border-b border-[#3e3e42]">
              <h2 className="text-lg font-semibold text-white">Select Collaborators</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 hover:bg-[#37373d] rounded-lg transition-colors text-[#cccccc] hover:text-white"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </header>
            
            <div className="max-h-96 overflow-auto p-4">
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-[#37373d] ${
                      Array.from(selectedUserId).indexOf(user._id) !== -1
                        ? "bg-[#0969da]/20 border border-[#0969da]/30"
                        : "bg-[#2d2d30]"
                    }`}
                    onClick={() => handleUserClick(user._id)}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#424242] flex items-center justify-center text-white font-medium">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white text-sm">{user.email}</h3>
                    </div>
                    {Array.from(selectedUserId).indexOf(user._id) !== -1 && (
                      <svg className="w-5 h-5 text-[#0969da]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-[#3e3e42]">
              <button
                onClick={addCollaborators}
                className="w-full py-3 bg-[#0969da] hover:bg-[#0860ca] text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-[#0969da]/25"
              >
                Add Collaborators
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
