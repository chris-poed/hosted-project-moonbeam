import { useEffect, useState } from "react";
import {
  DndContext,
  rectIntersection,
  DragOverlay,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { songs } from "../data/songs";
import CardBank from "./CardBank";
import Timeline from "./Timeline";

function DragAndDrop() {
  const [cardBank, setCardBank] = useState(songs);
  const [timeline, setTimeline] = useState([]);
  const [activeTimelineCard, setActiveTimelineCard] = useState(null); // only timeline card that is currently allowed to be moved again
  const [activeCard, setActiveCard] = useState(null); // This card is used by DragOverlay for when the current card is being dragged.  Stops glitchiness

  const handleDragStart = (event) => {
    const activeId = event.active.id;

    const card =
      cardBank.find(song => song.id === activeId) ||
      timeline.find(song => song.id === activeId);

    setActiveCard(card);
  };

  // whilst dragging over the timeline
  const handleDragOver = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const draggedFromBank = cardBank.find(song => song.id === activeId);
    const activeIndex = timeline.findIndex(song => song.id === activeId);
    const overIndex = timeline.findIndex(song => song.id === overId);

    if (draggedFromBank) {
      setTimeline(prev => {
        const alreadyInTimeline = prev.some(song => song.id === activeId);

        const copy = alreadyInTimeline
          ? prev.filter(song => song.id !== activeId)
          : [...prev];

        const insertIndex = copy.findIndex(song => song.id === overId);

        if (overId === "timeline" || insertIndex === -1) {
          copy.push(draggedFromBank);
        } else {
          copy.splice(insertIndex, 0, draggedFromBank); // This is what makes the other timeline cards shift left and right.
        }

        return copy;
      });

      setActiveTimelineCard(activeId);
      return;
    }

    if (
      activeId === activeTimelineCard &&
      activeIndex !== -1 &&
      overIndex !== -1 &&
      activeIndex !== overIndex
    ) {
      setTimeline(prev => arrayMove(prev, activeIndex, overIndex)); // Only the newest/active card can be moved again.
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) { // If the card is dropped outside a valid area, it returns to the card bank
      setTimeline(prev => prev.filter(song => song.id !== active.id));
      setActiveTimelineCard(null);
      setActiveCard(null);
      return;
    }

    const draggedFromBank = cardBank.find(song => song.id === active.id);

    if (draggedFromBank) {
      setCardBank(prev =>
        prev.filter(song => song.id !== active.id)
      );

      setActiveTimelineCard(active.id); // marks the card as the active timeline card so that it can be moved aroudn after being placed.
    }

    setActiveCard(null); // hides the floating drag overlay.
  };

  useEffect(() => {
    console.log("timeline:", timeline);
    console.log("cardBank:", cardBank);
    console.log("activeTimelineCard:", activeTimelineCard);
  }, [timeline, cardBank, activeTimelineCard]);

  return (
    <DndContext
      collisionDetection={rectIntersection} //decides what the dragged card is currently over
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div>
        <CardBank cardBank={cardBank} activeCard={activeCard} />

        <Timeline
          timeline={timeline}
          activeTimelineCard={activeTimelineCard}
        />
      </div>

    <DragOverlay>
  {activeCard ? (
    <div
      style={{
        padding: "10px",
        border: "1px solid black",
        background: "white",
        minWidth: "60px",
        textAlign: "center",
        boxSizing: "border-box",
      }}
    >
      <span style={{ fontSize: "32px", fontWeight: "bold" }}>?</span>
    </div>
  ) : null}
</DragOverlay>
    </DndContext>
  );
}

export default DragAndDrop;