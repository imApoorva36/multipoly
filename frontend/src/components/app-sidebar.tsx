import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"

const items = [
  {
    title: "Chat",
    color: "bg-mred"
  },
  {
    title: "Players",
    color: "bg-mgreen"
  },
  {
    title: "NFTs",
    color: "bg-mpurple"
  },
  {
    title: "ASI Help",
    color: "bg-myellow"
  }
]

// Tab content components
const ChatSection = () => (
  <div className="p-4 space-y-4">
    <h3 className="text-lg font-semibold">Game Chat</h3>
    <div className="space-y-2">
      <div className="p-2 bg-gray-100 rounded text-sm">
        Player1: Ready to start the game!
      </div>
      <div className="p-2 bg-gray-100 rounded text-sm">
        Player2: Let&apos;s go!
      </div>
    </div>
    <div className="flex space-x-2">
      <input 
        type="text" 
        placeholder="Type a message..." 
        className="flex-1 p-2 border rounded"
      />
      <Button size="sm">Send</Button>
    </div>
  </div>
)

const PlayersSection = () => (
  <div className="p-4 space-y-4">
    <h3 className="text-lg font-semibold">Players</h3>
    <div className="space-y-2">
      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
        <span>Player 1</span>
        <span className="text-green-600 text-sm">Online</span>
      </div>
      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
        <span>Player 2</span>
        <span className="text-green-600 text-sm">Online</span>
      </div>
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
        <span>Player 3</span>
        <span className="text-gray-500 text-sm">Offline</span>
      </div>
    </div>
  </div>
)

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

const ASIHelpSection = () => (
  <div className="p-4 space-y-4">
    <h3 className="text-lg font-semibold">ASI Help</h3>
    <div className="space-y-3">
      <div className="p-3 bg-blue-50 rounded">
        <div className="font-medium text-blue-800">Game Rules</div>
        <div className="text-sm text-blue-600">Learn how to play Multipoly</div>
      </div>
      <div className="p-3 bg-purple-50 rounded">
        <div className="font-medium text-purple-800">Strategy Tips</div>
        <div className="text-sm text-purple-600">AI-powered suggestions</div>
      </div>
      <div className="p-3 bg-green-50 rounded">
        <div className="font-medium text-green-800">Market Analysis</div>
        <div className="text-sm text-green-600">Property value insights</div>
      </div>
    </div>
  </div>
)

export function AppSidebar() {
  const [activeTab, setActiveTab] = useState("Chat")

  const renderTabContent = () => {
    switch (activeTab) {
      case "Chat":
        return <ChatSection />
      case "Players":
        return <PlayersSection />
      case "NFTs":
        return <NFTsSection />
      case "ASI Help":
        return <ASIHelpSection />
      default:
        return <ChatSection />
    }
  }

  return (
    <Sidebar className="border-r-4 border-black">
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