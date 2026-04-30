import { useEffect, useState } from "react";
import { DndContext,  pointerWithin, closestCenter,DragOverlay } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
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

  const [activeCard, setActiveCard] = useState(null); // This card is used by DragOverlay for when the current card is being dragged.  Stops glitchiness

  const collisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);

    const collisions =
      pointerCollisions.length > 0
        ? pointerCollisions
        : closestCenter(args);

    const itemCollisions = collisions.filter((collision) => {
      return collision.id !== "timeline";
    });

    return itemCollisions.length > 0 ? itemCollisions : collisions;
  };

const handleDragStart = (event) => {
  const activeId = event.active.id;

  const bankCard = cardBank.find((song) => song.id === activeId);
  const timelineCard = timeline.find((song) => song.id === activeId);

  const card = bankCard || timelineCard;
  setActiveCard(card);

  if (bankCard) {
    setCardBank((prev) =>
      prev.filter((song) => song.id !== activeId)
    );

    setTimeline((prev) => {
      const alreadyInTimeline = prev.some((song) => song.id === activeId);

      if (alreadyInTimeline) return prev;

      return [...prev, bankCard];
    });

    setActiveTimelineCard(activeId);
  }
};

//   // Dragging a card over the timeline
const handleDragOver = (event) => {
  const { active, over } = event;

  if (!over) return;

  const activeId = active.id;
  const overId = over.id;

  const activeIndex = timeline.findIndex((song) => song.id === activeId);
  const overIndex = timeline.findIndex((song) => song.id === overId);

  if (
    activeIndex !== -1 &&
    overIndex !== -1 &&
    activeIndex !== overIndex
  ) {
    setTimeline((prev) => {
      const oldIndex = prev.findIndex((song) => song.id === activeId);
      const newIndex = prev.findIndex((song) => song.id === overId);

      return arrayMove(prev, oldIndex, newIndex);
    });
  }
};

const handleDragEnd = (event) => {
  const { active, over } = event;

  if (!over) {
    setTimeline((prev) =>
      prev.filter((song) => song.id !== active.id)
    );

    if (activeCard) {
      setCardBank((prev) => [activeCard, ...prev]);
    }

    setActiveTimelineCard(null);
    setPlacement(null);
    setActiveCard(null);
    return;
  }

  setTimeline((currentTimeline) => {
    const placedSong = currentTimeline.find(
      (song) => song.id === active.id
    );

    const position = currentTimeline.findIndex(
      (song) => song.id === active.id
    );

    if (placedSong && position !== -1) {
      setPlacement({
        song_id: placedSong.id,
        position,
      });
    }

    return currentTimeline;
  });

  setActiveTimelineCard(active.id);
  setActiveCard(null);
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
      collisionDetection={collisionDetection}
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
