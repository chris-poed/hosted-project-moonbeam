import { useDroppable } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, } from "@dnd-kit/sortable";
import TimelineItem from "./TimelineItem";

// timeline, activeTimelineCard and disabled are given default values now to prevent .map errors
function Timeline({
        timeline = [],
        activeTimelineCard = null,
        disabled = false,
    }) {
    const droppable = useDroppable({
    id: "timeline",
    disabled,
    });  // useDroppable is making clear to dnd-kit that this box (timeline) accepts dropped cards and is called timeline
                                                        // id: timeline later becomes over.id when a dragged card is hovering over it
    return (
        <div>
        {/* <h2>Timeline</h2> */}
        <div // because of ref={droppable.setNodeRef}, this div is where dropping is allowed
            ref={droppable.setNodeRef} // connects the actual HTML element to dnd-kit.  Without this, useDroppable() would exist but would not be attached to anything
            style={{
            display: "flex",
            flexDirection: "row",
            gap: "10px",
            minHeight: "80px",
            border: "1px solid black",
            padding: "10px",
            }}
        >
            <SortableContext // tells dnd-kit that these items or cards belong to sortable group. The timeline cards need SortableContext to move from side to side
            items={timeline.map(song => song.id)} // uses .map here to take timeline array that is passed in from dndContext and transform data into just 
            strategy={horizontalListSortingStrategy} // the timeline card ids.  dnd-kit needs to know that the cards are sortable and what their order is.
            >                                           
            {timeline.map(song => (             // strategy={horizontalListSortingStrategy} - shifts the cards from left to right
                <TimelineItem                      // {props.timeline.map(song => ( This creates one TimelineItem for every song.
                key={song.id}
                song={song}
                isDraggable={song.id === activeTimelineCard}
                />
            ))}
            </SortableContext>
        </div>
        </div>
    );
    }

export default Timeline;