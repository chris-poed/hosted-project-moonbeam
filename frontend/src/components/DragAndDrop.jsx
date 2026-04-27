import { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { songs } from "../data/songs";
import CardBank from "./CardBank";
import Timeline from "./Timeline";

function DragAndDrop() {

  const [cardBank, setCardBank] = useState(songs)
  const [timeline, setTimeline] = useState([])

  const handleDragEnd = (event) => {
    const draggedId = event.active.id
    const draggedCard = cardBank.find(song => song.id === draggedId)
    if (!draggedCard) return
    const newTimeline = [...timeline, draggedCard]
    const sorted = newTimeline.sort((a, b) => a.year - b.year)
    setTimeline(sorted)
    setCardBank(cardBank.filter(song => song.id !== draggedCard.id))
  }

  const handleDragOver = (event) => {
    console.log(event)
    const draggedId = event.active.id
    const draggedCard = timeline.findIndex(song => song.id === draggedId)
    console.log("timeline:", timeline)
    console.log("draggedId:", draggedId)
    console.log("draggedCard index:", draggedCard)
    if (draggedCard === -1) return
    const draggedOverId = event.over.id
    const draggedOverCard = timeline.findIndex(song => song.id === draggedOverId)
    const shuffleTimeline = arrayMove(timeline, draggedCard, draggedOverCard)
    setTimeline(shuffleTimeline)
    console.log("draggedCard index:", draggedCard)
    console.log("draggedOverCard index:", draggedOverCard)
    console.log("shuffled:", shuffleTimeline)
  }

  useEffect(() => {
        console.log("timeline:", timeline)
        console.log("cardBank:", cardBank)
  }, [timeline, cardBank])

  return (
    <DndContext collisionDetection={closestCenter} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div>
        
        <CardBank cardBank={cardBank} />

        <Timeline timeline={timeline} />
        
      </div></DndContext>
    
  );
}

export default DragAndDrop;

