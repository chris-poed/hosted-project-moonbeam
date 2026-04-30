import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function TimelineItem(props) {
  const sortable = useSortable({ id: props.song.id }); // useStoppable makes each card droppable + reorderable

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    padding: "10px",
    border: "1px solid black",
    background: "white",
    color: "black", // add this
    cursor: props.isDraggable ? "grab" : "default",

    // Hide original card while DragOverlay is moving
    opacity: sortable.isDragging ? 0 : 1,

    minWidth: "60px",
    textAlign: "center",
    boxSizing: "border-box",
  };

  return (
    <div
      ref={sortable.setNodeRef}
      {...sortable.attributes}
      {...(props.isDraggable ? sortable.listeners : {})}
      style={style}
    >
      {props.isDraggable ? (
  <span style={{ fontSize: "32px", fontWeight: "bold" }}>?</span>
) : (
  props.song.year
)}
    </div>
  );
}

export default TimelineItem;
