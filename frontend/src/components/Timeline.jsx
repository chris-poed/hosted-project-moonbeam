import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import TimelineItem from "./TimelineItem";
import "./Timeline.css";

// timeline, activeTimelineCard and disabled are given default values now to prevent .map errors
function Timeline({
    timeline = [],
    activeTimelineCard = null,
    disabled = false,
    }) {
    const droppable = useDroppable({
        id: "timeline",
        disabled,
    });

    return (
        <div className="timeline-wrapper">
        <div
            ref={droppable.setNodeRef}
            className="timeline-dropzone"
        >
            <SortableContext
            items={timeline.map((song) => song.id)}
            strategy={rectSortingStrategy}
            >
            {timeline.map((song) => (
                <TimelineItem
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