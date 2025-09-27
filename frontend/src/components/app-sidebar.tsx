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
import { WalletClient } from "viem"
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
    title: "ASI Help",
    color: "bg-myellow"
  }
]


const NFTsSection = () => (
  <div className="p-4 space-y-4">
    <h3 className="text-lg font-semibold">NFTs</h3>
    <div className="space-y-2">
      <div className="p-3 border rounded">
        <div className="font-medium">Property Token #1</div>
        <div className="text-sm text-gray-600">Boardwalk Property</div>
        <div className="text-sm text-green-600">Owned</div>
      </div>
      <div className="p-3 border rounded">
        <div className="font-medium">Property Token #2</div>
        <div className="text-sm text-gray-600">Park Place</div>
        <div className="text-sm text-blue-600">Available</div>
      </div>
    </div>
  </div>
)

// ...removed static ASIHelpSection...

export function AppSidebar({ participants, sendMessage, messages, state, isSendingMessage } : { participants: string[], sendMessage: (msg: string) => Promise<void>, messages: ChatMessage[], state: string, isSendingMessage: boolean }) {
  const [activeTab, setActiveTab] = useState("Chat")

  const renderTabContent = () => {
    switch (activeTab) {
      case "Play":
        return <PlaySection />
      case "Chat":
        return <ChatSection sendMessage={sendMessage} messages={messages} state={state} isSendingMessage={isSendingMessage} />
      case "Players":
        return <PlayersSection participants={participants} />
      case "ASI Help":
        // For now, pass a stub getGameState. You can wire up real state as needed.
        return <ASIHelpSection getGameState={() => ({})} />
      default:
        return <ChatSection sendMessage={sendMessage} messages={messages} state={state} isSendingMessage={isSendingMessage} />
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