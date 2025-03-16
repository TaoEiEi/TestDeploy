"use client"

import { useState, useEffect } from "react"
import { Plus, Settings, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

// Types
interface Player {
  id: string
  name: string
  status: "available" | "playing"
  gamesPlayed: number
  shuttlecocksUsed: number
}

interface Court {
  id: string
  name: string
  status: "available" | "occupied"
  players: string[] // Player IDs
}

interface PriceSettings {
  shuttlecockPrice: number
  courtRentalFee: number
}

export default function BadmintonCourtManagement() {
  // State
  const [courts, setCourts] = useState<Court[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [priceSettings, setPriceSettings] = useState<PriceSettings>({
    shuttlecockPrice: 20,
    courtRentalFee: 0,
  })

  // Modal states
  const [isAddCourtOpen, setIsAddCourtOpen] = useState(false)
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Form states
  const [newCourtName, setNewCourtName] = useState("")
  const [newPlayerName, setNewPlayerName] = useState("")
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [tempSettings, setTempSettings] = useState<PriceSettings>(priceSettings)

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedCourts = localStorage.getItem("courts")
    const savedPlayers = localStorage.getItem("players")
    const savedShuttlecockPrice = localStorage.getItem("shuttlecockPrice")
    const savedCourtRentalFee = localStorage.getItem("courtRentalFee")

    if (savedCourts) setCourts(JSON.parse(savedCourts))
    if (savedPlayers) setPlayers(JSON.parse(savedPlayers))
    if (savedShuttlecockPrice || savedCourtRentalFee) {
      setPriceSettings({
        shuttlecockPrice: savedShuttlecockPrice ? Number.parseFloat(savedShuttlecockPrice) : 20,
        courtRentalFee: savedCourtRentalFee ? Number.parseFloat(savedCourtRentalFee) : 0,
      })
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("courts", JSON.stringify(courts))
  }, [courts])

  useEffect(() => {
    localStorage.setItem("players", JSON.stringify(players))
  }, [players])

  useEffect(() => {
    localStorage.setItem("shuttlecockPrice", priceSettings.shuttlecockPrice.toString())
    localStorage.setItem("courtRentalFee", priceSettings.courtRentalFee.toString())
  }, [priceSettings])

  // Handlers
  const handleAddCourt = () => {
    if (!newCourtName.trim()) return

    const newCourt: Court = {
      id: Date.now().toString(),
      name: newCourtName,
      status: "available",
      players: [],
    }

    setCourts([...courts, newCourt])
    setNewCourtName("")
    setIsAddCourtOpen(false)
    toast({
      title: "Court Added",
      description: `${newCourtName} has been added successfully.`,
    })
  }

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return

    const newPlayer: Player = {
      id: Date.now().toString(),
      name: newPlayerName,
      status: "available",
      gamesPlayed: 0,
      shuttlecocksUsed: 0,
    }

    setPlayers([...players, newPlayer])
    setNewPlayerName("")
    setIsAddPlayerOpen(false)
    toast({
      title: "Player Added",
      description: `${newPlayerName} has been added to the roster.`,
    })
  }

  const handleSaveSettings = () => {
    setPriceSettings(tempSettings)
    setIsSettingsOpen(false)
    toast({
      title: "Settings Saved",
      description: "Price settings have been updated.",
    })
  }

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      setCourts([])
      setPlayers([])
      localStorage.removeItem("courts")
      localStorage.removeItem("players")
      toast({
        title: "Data Cleared",
        description: "All court and player data has been reset.",
      })
    }
  }

  const handleEndGame = (courtId: string) => {
    setCourts(
      courts.map((court) => {
        if (court.id === courtId) {
          // Update player statuses
          setPlayers(
            players.map((player) => {
              if (court.players.includes(player.id)) {
                return { ...player, status: "available" }
              }
              return player
            }),
          )

          return { ...court, status: "available", players: [] }
        }
        return court
      }),
    )

    toast({
      title: "Game Ended",
      description: "The court is now available.",
    })
  }

  const handleAddShuttlecock = (courtId: string) => {
    const court = courts.find((c) => c.id === courtId)
    if (!court) return

    setPlayers(
      players.map((player) => {
        if (court.players.includes(player.id)) {
          return { ...player, shuttlecocksUsed: player.shuttlecocksUsed + 1 }
        }
        return player
      }),
    )

    toast({
      title: "Shuttlecock Added",
      description: "Shuttlecock count has been updated for all players in this court.",
    })
  }

  const handleTogglePlayerSelection = (playerId: string) => {
    setSelectedPlayers((prev) => (prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]))
  }

  const handleAddSelectedPlayers = () => {
    if (selectedPlayers.length === 0) {
      toast({
        title: "No Players Selected",
        description: "Please select at least one player.",
        variant: "destructive",
      })
      return
    }

    // Find an available court
    const availableCourt = courts.find((court) => court.players.length < 4 && court.status === "available")

    if (!availableCourt) {
      toast({
        title: "No Available Courts",
        description: "There are no available courts to add players to.",
        variant: "destructive",
      })
      return
    }

    // Update court with selected players
    setCourts(
      courts.map((court) => {
        if (court.id === availableCourt.id) {
          const updatedPlayers = [...court.players]
          let addedCount = 0

          selectedPlayers.forEach((playerId) => {
            const player = players.find((p) => p.id === playerId)
            if (player && player.status === "available" && updatedPlayers.length < 4) {
              updatedPlayers.push(playerId)
              addedCount++
            }
          })

          return {
            ...court,
            players: updatedPlayers,
            status: updatedPlayers.length > 0 ? "occupied" : "available",
          }
        }
        return court
      }),
    )

    // Update player statuses and game counts
    setPlayers(
      players.map((player) => {
        if (selectedPlayers.includes(player.id) && player.status === "available") {
          const isAdded =
            !availableCourt.players.includes(player.id) &&
            availableCourt.players.length +
              selectedPlayers.filter((id) => !availableCourt.players.includes(id)).length <=
              4

          if (isAdded) {
            return {
              ...player,
              status: "playing",
              gamesPlayed: player.gamesPlayed + 1,
              shuttlecocksUsed: player.shuttlecocksUsed + 1,
            }
          }
        }
        return player
      }),
    )

    // Clear selection
    setSelectedPlayers([])

    toast({
      title: "Players Added",
      description: "Selected players have been added to an available court.",
    })
  }

  // Calculate player cost
  const calculatePlayerCost = (player: Player) => {
    return (
      player.shuttlecocksUsed * priceSettings.shuttlecockPrice +
      (player.status === "playing" ? priceSettings.courtRentalFee : 0)
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold">Badminton Court Management</h1>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setTempSettings(priceSettings)
                setIsSettingsOpen(true)
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              Price Settings
            </Button>
            <Button variant="destructive" onClick={handleClearAll}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Data
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Court Management Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Courts</h2>
            <Button onClick={() => setIsAddCourtOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Court
            </Button>
          </div>

          {courts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-muted-foreground mb-4">No courts available</p>
                <Button onClick={() => setIsAddCourtOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Court
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courts.map((court) => (
                <Card key={court.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{court.name}</CardTitle>
                      <Badge variant={court.status === "available" ? "success" : "secondary"}>
                        {court.status === "available" ? "Available" : "Occupied"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Players:</h4>
                      {court.players.length > 0 ? (
                        <div className="space-y-1">
                          {court.players.map((playerId) => {
                            const player = players.find((p) => p.id === playerId)
                            return player ? (
                              <div key={playerId} className="text-sm px-2 py-1 bg-muted rounded-sm">
                                {player.name}
                              </div>
                            ) : null
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No players assigned</p>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleEndGame(court.id)}
                        disabled={court.status === "available"}
                      >
                        End Game
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddShuttlecock(court.id)}
                        disabled={court.players.length === 0}
                      >
                        Add Shuttlecock
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Player Management Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Players</h2>
            <Button onClick={() => setIsAddPlayerOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Player
            </Button>
          </div>

          <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Button
              onClick={handleAddSelectedPlayers}
              disabled={selectedPlayers.length === 0}
              className="w-full sm:w-auto"
            >
              <Users className="mr-2 h-4 w-4" />
              Add Selected Players to Available Court
            </Button>

            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <div className="flex items-center">
                <span className="font-medium mr-2">Court Fee:</span>
                <Badge variant="outline">{priceSettings.courtRentalFee} ฿</Badge>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">Shuttlecock Price:</span>
                <Badge variant="outline">{priceSettings.shuttlecockPrice} ฿</Badge>
              </div>
            </div>
          </div>

          {players.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-muted-foreground mb-4">No players available</p>
                <Button onClick={() => setIsAddPlayerOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Player
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Select</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Games Played</TableHead>
                    <TableHead className="text-right">Shuttlecocks Used</TableHead>
                    <TableHead className="text-right">Cost (฿)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players
                    .sort((a, b) => (a.status === "available" ? -1 : 1))
                    .map((player) => (
                      <TableRow key={player.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedPlayers.includes(player.id)}
                            onCheckedChange={() => handleTogglePlayerSelection(player.id)}
                            disabled={player.status === "playing"}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{player.name}</TableCell>
                        <TableCell>
                          <Badge variant={player.status === "available" ? "success" : "secondary"}>
                            {player.status === "available" ? "Available" : "Playing"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{player.gamesPlayed}</TableCell>
                        <TableCell className="text-right">{player.shuttlecocksUsed}</TableCell>
                        <TableCell className="text-right">{calculatePlayerCost(player)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      {/* Add Court Modal */}
      <Dialog open={isAddCourtOpen} onOpenChange={setIsAddCourtOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Court</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="court-name">Court Name</Label>
              <Input
                id="court-name"
                placeholder="Enter court name"
                value={newCourtName}
                onChange={(e) => setNewCourtName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCourtOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCourt}>Add Court</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Player Modal */}
      <Dialog open={isAddPlayerOpen} onOpenChange={setIsAddPlayerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Player</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="player-name">Player Name</Label>
              <Input
                id="player-name"
                placeholder="Enter player name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPlayerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPlayer}>Add Player</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Price Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="shuttlecock-price">Shuttlecock Price (฿)</Label>
              <Input
                id="shuttlecock-price"
                type="number"
                min="0"
                step="0.01"
                value={tempSettings.shuttlecockPrice}
                onChange={(e) =>
                  setTempSettings({
                    ...tempSettings,
                    shuttlecockPrice: Number.parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="court-fee">Court Rental Fee (฿)</Label>
              <Input
                id="court-fee"
                type="number"
                min="0"
                step="0.01"
                value={tempSettings.courtRentalFee}
                onChange={(e) =>
                  setTempSettings({
                    ...tempSettings,
                    courtRentalFee: Number.parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

