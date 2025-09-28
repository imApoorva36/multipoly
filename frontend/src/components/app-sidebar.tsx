import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import ChatSection from "./sidebar/chat"
import PlayersSection from "./sidebar/players"
import PlaySection from "./sidebar/play"
import ASIHelpSection from "./sidebar/ASIHelpSection"
import { ChatMessage } from "@/hooks/useHuddleRoom"

const items = [
  {
    title: "Play",
    color: "bg-mpurple"
  },
  {
    title: "Chat",
    color: "bg-mred"
  },
  {
    title: "Players",
    color: "bg-mgreen"
  },
  {
    title: "Learn",
    color: "bg-myellow"
  }
]


// ...removed static ASIHelpSection...

export function AppSidebar({ 
  participants, 
  sendMessage, 
  messages, 
  state, 
  isSendingMessage,
  isJoiningRoom,
  isFetchingToken,
  tokenError,
  joinError,
  peerId 
} : { 
  participants: string[], 
  sendMessage: (msg: string) => Promise<void>, 
  messages: ChatMessage[], 
  state: string, 
  isSendingMessage: boolean,
  isJoiningRoom?: boolean,
  isFetchingToken?: boolean,
  tokenError?: Error | null,
  joinError?: Error | null,
  peerId?: string | null
}) {
  const [activeTab, setActiveTab] = useState("Chat")

  const renderTabContent = () => {
    switch (activeTab) {
      case "Play":
        return <PlaySection />
      case "Chat":
        return <ChatSection 
          sendMessage={sendMessage} 
          messages={messages} 
          state={state} 
          isSendingMessage={isSendingMessage}
          isJoiningRoom={isJoiningRoom}
          isFetchingToken={isFetchingToken}
          tokenError={tokenError}
          joinError={joinError}
          peerId={peerId}
        />
      case "Players":
        return <PlayersSection participants={participants} />
      case "Learn":
        return <ASIHelpSection getGameState={() => ({})} />
      default:
        return <ChatSection 
          sendMessage={sendMessage} 
          messages={messages} 
          state={state} 
          isSendingMessage={isSendingMessage}
          isJoiningRoom={isJoiningRoom}
          isFetchingToken={isFetchingToken}
          tokenError={tokenError}
          joinError={joinError}
          peerId={peerId}
        />
    }
  }

  return (
    <Sidebar className="border-r-4 h-full border-black">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-row mx-auto justify-center">
              {items.map((item) => (
                <Button 
                  variant="bordered" 
                  className={activeTab === item.title ? item.color : ""}
                  key={item.title}
                  onClick={() => setActiveTab(item.title)}
                >
                  {item.title}
                </Button>
              ))}
            </SidebarMenu>
            {renderTabContent()}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
