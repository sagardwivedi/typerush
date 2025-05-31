import { ModeToggle } from "./components/mode-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">🚀 TypeRush</h1>
        <ModeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border shadow-lg bg-card">
          <Tabs defaultValue="solo" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="solo">Solo</TabsTrigger>
              <TabsTrigger value="friend">Friend</TabsTrigger>
            </TabsList>

            <TabsContent value="solo" className="p-4 w-full text-sm">
              <p className="text-muted-foreground">Start a solo typing challenge to test your speed and accuracy!</p>
              <button className="mt-4 w-full bg-primary text-white rounded-lg py-2 hover:bg-primary/90 transition">
                Start Solo Game
              </button>
            </TabsContent>

            <TabsContent value="friend" className="p-4 w-full text-sm">
              <p className="text-muted-foreground">Invite a friend and race each other in real-time!</p>
              <button className="mt-4 w-full bg-secondary text-black rounded-lg py-2 hover:bg-secondary/80 transition">
                Invite Friend
              </button>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
