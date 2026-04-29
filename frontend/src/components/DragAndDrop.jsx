import { useEffect, useState } from "react";
import { DndContext, rectIntersection, DragOverlay } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
//import { songs } from "../data/songs";
import CardBank from "./CardBank";
import Timeline from "./Timeline";
import { createPortal } from "react-dom";
import "../components/DragAndDrop.css"

function DragAndDrop({
    cardBank,
    setCardBank,
    timeline,
    setTimeline,
    activeTimelineCard,
    setActiveTimelineCard,
    setPlacement
}) {

//   const [cardBank, setCardBank] = useState(songs);
//   const [timeline, setTimeline] = useState([]);
//   const [activeTimelineCard, setActiveTimelineCard] = useState(null); // only timeline card that is currently allowed to be moved again
  const [activeCard, setActiveCard] = useState(null); // This card is used by DragOverlay for when the current card is being dragged.  Stops glitchiness

  const handleDragStart = (event) => {
    const activeId = event.active.id; // gives the id of the card the user just picked up because of useDraggable in CardBankItem

    const card =
      cardBank.find((song) => song.id === activeId) ||
      timeline.find((song) => song.id === activeId);

    setActiveCard(card); // stores the full card being dragged.
  };

  // Dragging a card over the timeline
  const handleDragOver = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const draggedFromBank = cardBank.find((song) => song.id === activeId);
    const activeIndex = timeline.findIndex((song) => song.id === activeId);
    const overIndex = timeline.findIndex((song) => song.id === overId);

    if (draggedFromBank) {
      setTimeline((prev) => {
        const alreadyInTimeline = prev.some((song) => song.id === activeId); // .some returns true if at least one item matches

        const copy = alreadyInTimeline
          ? prev.filter((song) => song.id !== activeId)
          : [...prev];

        const insertIndex = copy.findIndex((song) => song.id === overId);  // Which timeline card is being hovered over

        if (overId === "timeline" || insertIndex === -1) {
          copy.push(draggedFromBank); // .push adds item to the end of the array
        } else {
          copy.splice(insertIndex, 0, draggedFromBank); // This is what makes the other timeline cards shift left and right.
        }                                               // .splice adds card to the middle of the array

        return copy;
      });

      setActiveTimelineCard(activeId);
      return;
    }

    if (
      activeId === activeTimelineCard && // check to see if the card is the active card
      activeIndex !== -1 && // check to see if the card is inside the timeline
      overIndex !== -1 && // what is the index of the card we are hovering over
      activeIndex !== overIndex // check to see if the actie card is different to the card that is being hovered over
    ) {
      setTimeline((prev) => arrayMove(prev, activeIndex, overIndex)); // Only the newest/active card can be moved again.
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

      if (!over) { // If the card is dropped outside a valid area, it returns to the card bank
        const draggedFromBank = cardBank.find(song => song.id === active.id);

        if (draggedFromBank) { // if the card was in the timeline and is dragged and released outside, it will return to its last place in the timeline
          setTimeline(prev => prev.filter(song => song.id !== active.id));
          setActiveTimelineCard(null);
          setPlacement(null);
        }

          setActiveCard(null);
          return;
      }

      const draggedFromBank = cardBank.find((song) => song.id === active.id);

      if (draggedFromBank) {
        setCardBank((prev) => prev.filter((song) => song.id !== active.id));

        setActiveTimelineCard(active.id); // marks the card as the active timeline card so that it can be moved around after being placed.
      }
      // this sets the timeline and placement of the card so the GameScreen parent component has it
      setTimeline((currentTimeline) => {
        const placedSong = currentTimeline.find((song) => song.id === active.id);
        const position = currentTimeline.findIndex((song) => song.id === active.id);

        if (placedSong && position !== -1) {
          setPlacement({
            song_id: placedSong.id,
            position,
          });
        }

        return currentTimeline;
      });
      setActiveCard(null); // hides the floating drag overlay.
  };

  const handleDragCancel = () => {
    setActiveCard(null);
  };


  useEffect(() => {
    console.log("timeline:", timeline);
    console.log("cardBank:", cardBank);
    console.log("activeTimelineCard:", activeTimelineCard);
  }, [timeline, cardBank, activeTimelineCard]);

  return (
    <DndContext
      collisionDetection={rectIntersection} //decides what the dragged card is currently over
      onDragStart={handleDragStart} // this function and onDragOver and onDragEnd are run when a card is dragged because of useDraggable in CardBankId
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div>
        <CardBank cardBank={cardBank} activeCard={activeCard} />

        <Timeline timeline={timeline} activeTimelineCard={activeTimelineCard} />
      </div>

      {createPortal(
        <DragOverlay adjustScale={false} dropAnimation={null}>
          {activeCard ? (
            <div className="drag-overlay-card">
              <span className="drag-overlay-card__unknown">?</span>
            </div>
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}

export default DragAndDrop;
