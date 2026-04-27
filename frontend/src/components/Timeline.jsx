import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import TimelineItem from "./TimelineItem";

function Timeline(props) {
  const droppable = useDroppable({ id: "timeline" });

  return (
    <div>
      <h2>Timeline</h2>

      <div
        ref={droppable.setNodeRef}
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "10px",
          minHeight: "80px",
          border: "1px solid black",
          padding: "10px",
        }}
      >
        <SortableContext
          items={props.timeline.map(song => song.id)}
          strategy={horizontalListSortingStrategy}
        >
          {props.timeline.map(song => (
            <TimelineItem
              key={song.id}
              song={song}
              isDraggable={song.id === props.activeTimelineCard}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default Timeline;