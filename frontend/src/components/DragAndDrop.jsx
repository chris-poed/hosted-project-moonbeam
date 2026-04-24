import { useEffect, useState } from "react";
import { DndContext } from "@dnd-kit/core"
import { songs } from "./data/songs";
import CardBank from "./components/CardBank";
import Timeline from "./components/Timeline";

function DragAndDrop() {

  const [cardBank, setCardBank] = useState(songs)
  const [timeline, setTimeline] = useState([])

  const handleDragEnd = (event) => {
    const draggedId = event.active.id
    const draggedCard = cardBank.find(song => song.id === draggedId)
    const newTimeline = [...timeline, draggedCard]
    const sorted = newTimeline.sort((a, b) => a.year - b.year)
    setTimeline(sorted)
    setCardBank(cardBank.filter(song => song.id !== draggedCard.id))
  }
  useEffect(() => {
        console.log("timeline:", timeline)
        console.log("cardBank:", cardBank)
  }, [timeline, cardBank])

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div>
        
        <CardBank cardBank={cardBank} />

        <Timeline timeline={timeline} />
        
      </div></DndContext>
    
  );
}

export default DragAndDrop;

